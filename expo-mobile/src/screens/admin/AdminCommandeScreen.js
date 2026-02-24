import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import Toast, { useToast } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { exportToCsv } from '../../utils/export';

const AdminCommandeScreen = ({ navigation }) => {
    const { hasPermission } = useAuth();
    const { toastRef, showToast } = useToast();

    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Create Mode States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [step, setStep] = useState(1); // 1: Client, 2: Products

    const [userSearchText, setUserSearchText] = useState('');
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSearchLoading, setUserSearchLoading] = useState(false);

    const [productSearchText, setProductSearchText] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]); // Array of { product, quantity }

    const [cities, setCities] = useState([]);
    const [allStations, setAllStations] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedStation, setSelectedStation] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Guest States
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    // Edit Mode States
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingCommande, setEditingCommande] = useState(null);
    const [editStatus, setEditStatus] = useState('');
    const [editGuestName, setEditGuestName] = useState('');
    const [editGuestPhone, setEditGuestPhone] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editStation, setEditStation] = useState(null);
    const [editItems, setEditItems] = useState([]);
    const [editProductSearch, setEditProductSearch] = useState('');

    const fetchCommandes = async () => {
        try {
            const response = await client.get('/admin/commandes');
            setCommandes(response.data.data || response.data);
        } catch (e) {
            console.error(e);
            Alert.alert('Erreur', 'Impossible de charger les commandes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const [prodRes, stationRes] = await Promise.all([
                client.get('/admin/produits'),
                client.get('/stations')
            ]);
            setAllProducts(prodRes.data.data || prodRes.data);
            setFilteredProducts(prodRes.data.data || prodRes.data);
            setAllStations(stationRes.data);

            const uniqueCities = [...new Set(stationRes.data.map(s => s.ville))].sort();
            setCities(uniqueCities);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (hasPermission('commande_access')) {
            fetchCommandes();
            fetchInitialData();
        }
    }, []);

    if (!hasPermission('commande_access')) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="lock-closed" size={64} color={Colors.border} />
                <Text style={{ marginTop: 20, color: Colors.textLight, fontSize: 16 }}>
                    Accès non autorisé
                </Text>
            </View>
        );
    }

    const handleDeleteCommande = (commande) => {
        Alert.alert(
            'Supprimer la commande',
            `Êtes-vous sûr de vouloir supprimer la commande #${commande.id} ?\nLe stock sera restauré.`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.delete(`/admin/commandes/${commande.id}`);
                            fetchCommandes();
                            showToast('Commande supprimée avec succès', 'success');
                        } catch (e) {
                            showToast(e.response?.data?.message || 'Impossible de supprimer la commande', 'error');
                        }
                    }
                }
            ]
        );
    };

    const handleSearchUser = async (text) => {
        if (text.length < 2) {
            setUserSearchResults([]);
            return;
        }
        setUserSearchLoading(true);
        try {
            const res = await client.get('/admin/reservations/users', { params: { q: text } });
            setUserSearchResults(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setUserSearchLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (userSearchText && !selectedUser) {
                handleSearchUser(userSearchText);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [userSearchText, selectedUser]);

    useEffect(() => {
        if (!productSearchText) {
            setFilteredProducts(allProducts);
        } else {
            const lower = productSearchText.toLowerCase();
            setFilteredProducts(allProducts.filter(p => p.nom.toLowerCase().includes(lower)));
        }
    }, [productSearchText, allProducts]);

    const addItem = (product) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                return prev.map(i => i.product.id === product.id ? { ...i, quantite: i.quantite + 1 } : i);
            }
            return [...prev, { product, quantite: 1 }];
        });
        showToast(`${product.nom} ajouté`);
    };

    const removeItem = (productId) => {
        setSelectedItems(prev => prev.filter(i => i.product.id !== productId));
    };

    const updateQty = (productId, delta) => {
        setSelectedItems(prev => prev.map(i => {
            if (i.product.id === productId) {
                const newQty = Math.max(1, i.quantite + delta);
                if (newQty > i.product.stock) {
                    Alert.alert('Stock insuffisant', `Seulement ${i.product.stock} disponibles.`);
                    return i;
                }
                return { ...i, quantite: newQty };
            }
            return i;
        }));
    };

    const calculateTotal = () => {
        return selectedItems.reduce((acc, item) => acc + (item.product.prix * item.quantite), 0);
    };

    const calculateSubtotal = (items) => {
        return items.reduce((acc, item) => acc + (item.product.prix * item.quantite), 0);
    };

    const handleCreateCommande = async () => {
        if (!selectedUser && !guestName.trim()) return Alert.alert('Erreur', 'Veuillez renseigner un client');
        if (selectedItems.length === 0) return Alert.alert('Erreur', 'Veuillez ajouter au moins un produit');
        if (!selectedCity || !selectedStation) return Alert.alert('Erreur', 'Veuillez sélectionner une ville et une station');

        setSubmitting(true);
        try {
            const payload = {
                user_id: selectedUser?.id || null,
                guest_name: selectedUser ? null : guestName,
                guest_phone: selectedUser ? null : guestPhone,
                ville_livraison: selectedCity,
                station_id: selectedStation?.id,
                moyen_paiement: 'Espèces (Admin)',
                items: selectedItems.map(i => ({
                    produit_id: i.product.id,
                    quantite: i.quantite
                }))
            };

            await client.post('/admin/commandes', payload);
            showToast('Vente enregistrée avec succès');
            setCreateModalVisible(false);
            resetCreateState();
            fetchCommandes();
            fetchInitialData(); // Refresh product stock
        } catch (e) {
            const msg = e.response?.data?.message || 'Une erreur est survenue';
            Alert.alert('Erreur', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateCommande = async () => {
        if (!editingCommande) return;
        if (!editCity || !editStation) return Alert.alert('Erreur', 'Veuillez sélectionner une ville et une station');

        setSubmitting(true);
        try {
            await client.put(`/admin/commandes/${editingCommande.id}`, {
                statut: editStatus,
                guest_name: editingCommande.user ? null : editGuestName,
                guest_phone: editingCommande.user ? null : editGuestPhone,
                ville_livraison: editCity,
                station_id: editStation.id,
                items: editItems.map(i => ({
                    produit_id: i.product.id,
                    quantite: i.quantite
                }))
            });
            showToast('Commande mise à jour');
            setEditModalVisible(false);
            fetchCommandes();
        } catch (e) {
            console.error(e);
            Alert.alert('Erreur', 'Impossible de modifier la commande');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (commande) => {
        setEditingCommande(commande);
        setEditStatus(commande.statut);
        // Pre-fill with user data if registered, otherwise guest data
        setEditGuestName(commande.user?.name || commande.guest_name || '');
        setEditGuestPhone(commande.user?.tel || commande.guest_phone || '');
        setEditCity(commande.ville_livraison || '');
        setEditStation(commande.station || null);
        // Map the items to a format the local state understands
        setEditItems(commande.items ? commande.items.map(it => ({
            product: it.produit,
            quantite: it.quantite
        })) : []);
        setEditModalVisible(true);
    };

    const addEditItem = (product) => {
        setEditItems(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                return prev.map(i => i.product.id === product.id ? { ...i, quantite: i.quantite + 1 } : i);
            }
            return [...prev, { product, quantite: 1 }];
        });
        showToast(`${product.nom} ajouté`);
    };

    const removeEditItem = (productId) => {
        setEditItems(prev => prev.filter(i => i.product.id !== productId));
    };

    const updateEditQty = (productId, delta) => {
        setEditItems(prev => prev.map(i => {
            if (i.product.id === productId) {
                const newQty = Math.max(1, i.quantite + delta);
                // We don't check stock strictly here because we would need to know the OLD qty in stock
                // The server will handle the strict check with transaction
                return { ...i, quantite: newQty };
            }
            return i;
        }));
    };

    const getStatusLabel = (statut) => {
        switch (statut) {
            case 'en_attente': return { label: 'EN ATTENTE', color: Colors.warning };
            case 'confirme': return { label: 'CONFIRMÉ', color: Colors.secondary };
            case 'livre': return { label: 'LIVRÉ & PAYÉ', color: Colors.success };
            case 'annule': return { label: 'ANNULÉ', color: Colors.error };
            default: return { label: statut?.toUpperCase() || 'INCONNU', color: Colors.textLight };
        }
    };

    const resetCreateState = () => {
        setStep(1);
        setSelectedUser(null);
        setUserSearchText('');
        setUserSearchResults([]);
        setSelectedItems([]);
        setProductSearchText('');
        setSelectedCity('');
        setSelectedStation(null);
        setGuestName('');
        setGuestPhone('');
    };

    const renderCommandeItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.orderId}>Vente #{item.unique_id || item.id}</Text>
                    <Text style={styles.orderDate}>{format(new Date(item.created_at), 'dd MMM yyyy • HH:mm', { locale: fr })}</Text>
                </View>
                <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>{item.prix_total} CFA</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="person" size={16} color={Colors.secondary} />
                    <View>
                        <Text style={styles.clientName}>{item.user?.name || item.guest_name || 'Client inconnu'}</Text>
                        {(item.guest_name || item.guest_phone) && (
                            <Text style={{ fontSize: 11, color: Colors.textLight, marginLeft: 10, fontStyle: 'italic' }}>
                                Client non-inscrit {item.guest_phone ? `(${item.guest_phone})` : ''}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color={Colors.textLight} />
                    <Text style={styles.infoText}>{item.ville_livraison} {item.station ? `(${item.station.nom})` : ''}</Text>
                </View>

                <View style={styles.productsList}>
                    {item.items?.map((it, idx) => (
                        <View key={idx} style={styles.productLine}>
                            <Ionicons name="radio-button-on" size={8} color={Colors.secondary} style={{ marginRight: 8 }} />
                            <Text style={styles.productText}>
                                {it.produit?.nom} <Text style={{ fontFamily: 'Poppins_700Bold' }}>(x{it.quantite})</Text>
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={[styles.statusTag, { backgroundColor: getStatusLabel(item.statut).color + '15' }]}>
                    <Ionicons
                        name={item.statut === 'livre' ? "checkmark-circle" : "time-outline"}
                        size={14}
                        color={getStatusLabel(item.statut).color}
                        style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.statusTagText, { color: getStatusLabel(item.statut).color }]}>
                        {getStatusLabel(item.statut).label}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.paymentMethodText, { marginRight: 10 }]}>{item.payment_method}</Text>
                    {hasPermission('commande_edit') && (
                        <TouchableOpacity style={styles.editIconBtn} onPress={() => openEditModal(item)}>
                            <Ionicons name="create-outline" size={20} color={Colors.secondary} />
                        </TouchableOpacity>
                    )}
                    {hasPermission('commande_delete') && (
                        <TouchableOpacity style={styles.editIconBtn} onPress={() => handleDeleteCommande(item)}>
                            <Ionicons name="trash-outline" size={20} color={Colors.error} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <Toast ref={toastRef} />

            <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.surface }}>
                <View style={styles.topHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.welcomeText}>Admin</Text>
                        <Text style={styles.userName} numberOfLines={1}>Commandes</Text>
                    </View>
                    {hasPermission('export_csv') && (
                        <TouchableOpacity
                            style={{ marginRight: 12 }}
                            onPress={() => exportToCsv('admin/commandes-export', 'commandes')}
                        >
                            <Ionicons name="download-outline" size={24} color={Colors.secondary} />
                        </TouchableOpacity>
                    )}
                    {hasPermission('commande_create') && (
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => { resetCreateState(); setCreateModalVisible(true); }}
                        >
                            <Ionicons name="add" size={24} color="#FFF" />
                            <Text style={styles.addBtnText}>Ajouter</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.secondary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={commandes}
                    renderItem={renderCommandeItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    onRefresh={fetchCommandes}
                    refreshing={refreshing}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="document-text-outline" size={60} color={Colors.border} />
                            <Text style={styles.emptyText}>Aucune commande trouvée</Text>
                        </View>
                    }
                />
            )}

            {/* Create Mode Modal */}
            <Modal visible={createModalVisible} animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, backgroundColor: Colors.surface }}
                >
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : setCreateModalVisible(false)} style={styles.closeBtn}>
                                <Ionicons name={step > 1 ? "arrow-back" : "close"} size={28} color={Colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {step === 1 ? '1. Client & Ville' : '2. Produits'}
                            </Text>
                            <View style={{ width: 40 }} />
                        </View>
                    </SafeAreaView>

                    <View style={styles.stepIndicator}>
                        <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
                        <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
                    </View>

                    {step === 1 ? (
                        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
                            <Text style={styles.label}>Rechercher un client</Text>
                            <View style={styles.searchBox}>
                                <TextInput
                                    style={styles.input}
                                    value={selectedUser ? selectedUser.name : userSearchText}
                                    onChangeText={(t) => {
                                        setUserSearchText(t);
                                        if (selectedUser) setSelectedUser(null);
                                        if (t.trim().length > 0) {
                                            setGuestName('');
                                            setGuestPhone('');
                                        }
                                    }}
                                    placeholder="Rechercher un client inscrit..."
                                />
                                {userSearchLoading && <ActivityIndicator style={styles.searchIndicator} size="small" color={Colors.secondary} />}
                            </View>

                            {!selectedUser && userSearchResults.length > 0 && !guestName.trim() && !guestPhone.trim() && (
                                <View style={styles.searchResults}>
                                    <ScrollView
                                        style={{ maxHeight: 200 }}
                                        nestedScrollEnabled={true}
                                        keyboardShouldPersistTaps="handled"
                                    >
                                        {userSearchResults.map(u => (
                                            <TouchableOpacity key={u.id} style={styles.searchResultItem} onPress={() => {
                                                setSelectedUser(u);
                                                setUserSearchResults([]);
                                            }}>
                                                <Text style={styles.searchResultName}>{u.name}</Text>
                                                <Text style={styles.searchResultTel}>{u.tel} • ID: {u.unique_id}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {selectedUser && (
                                <View style={styles.selectedUserCard}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                                            <Text style={styles.selectedUserText}>{selectedUser.name}</Text>
                                        </View>
                                        <Text style={styles.selectedUserSubText}>Tel: {selectedUser.tel} • ID: {selectedUser.unique_id}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setSelectedUser(null)}>
                                        <Text style={styles.changeUserText}>Changer</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {!selectedUser && !userSearchText.trim() && (
                                <View style={{ marginTop: 20 }}>
                                    <Text style={styles.label}>OU - Nouveau client (non-inscrit)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nom complet du client"
                                        value={guestName}
                                        onChangeText={(t) => {
                                            setGuestName(t);
                                            if (t.trim().length > 0) {
                                                setUserSearchText('');
                                                setUserSearchResults([]);
                                            }
                                        }}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Numéro de téléphone"
                                        value={guestPhone}
                                        onChangeText={(t) => {
                                            setGuestPhone(t);
                                            if (t.trim().length > 0) {
                                                setUserSearchText('');
                                                setUserSearchResults([]);
                                            }
                                        }}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            )}

                            <Text style={[styles.label, { marginTop: 20 }]}>Ville de retrait</Text>
                            <View style={styles.cityGrid}>
                                {cities.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.cityItem, selectedCity === c && styles.cityItemActive]}
                                        onPress={() => {
                                            setSelectedCity(c);
                                            setSelectedStation(null);
                                        }}
                                    >
                                        <Text style={[styles.cityItemText, selectedCity === c && styles.cityItemTextActive]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {selectedCity && (
                                <>
                                    <Text style={[styles.label, { marginTop: 15 }]}>Station de retrait (Point de livraison)</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 30 }}>
                                        <View style={styles.cityGrid}>
                                            {allStations.filter(s => s.ville === selectedCity).map(s => (
                                                <TouchableOpacity
                                                    key={s.id}
                                                    style={[styles.cityItem, selectedStation?.id === s.id && styles.cityItemActive]}
                                                    onPress={() => setSelectedStation(s)}
                                                >
                                                    <Text style={[styles.cityItemText, selectedStation?.id === s.id && styles.cityItemTextActive]}>{s.nom}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.nextBtn,
                                    (!selectedUser && (!guestName.trim() || !guestPhone.trim())) || !selectedCity || !selectedStation
                                        ? { opacity: 0.5 }
                                        : {}
                                ]}
                                onPress={() => {
                                    const isClientOk = selectedUser || (guestName.trim() && guestPhone.trim());
                                    if (isClientOk && selectedCity && selectedStation) {
                                        setStep(2);
                                    } else {
                                        Alert.alert('Incomplet', 'Veuillez remplir toutes les informations (Client, Ville et Station)');
                                    }
                                }}
                                disabled={(!selectedUser && (!guestName.trim() || !guestPhone.trim())) || !selectedCity || !selectedStation}
                            >
                                <Text style={styles.nextBtnText}>Suivant</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <View style={styles.productSelectionContainer}>
                                <View style={styles.productSearchRow}>
                                    <Ionicons name="search" size={20} color={Colors.textLight} />
                                    <TextInput
                                        style={styles.productSearchInput}
                                        placeholder="Rechercher un produit..."
                                        value={productSearchText}
                                        onChangeText={setProductSearchText}
                                    />
                                </View>

                                <FlatList
                                    data={filteredProducts}
                                    keyExtractor={item => item.id.toString()}
                                    style={{ flex: 1 }}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.productItem} onPress={() => addItem(item)}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.productItemName}>{item.nom}</Text>
                                                <Text style={styles.productItemPrice}>{item.prix} CFA • Stock: {item.stock}</Text>
                                            </View>
                                            <Ionicons name="add-circle" size={28} color={Colors.secondary} />
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>

                            <View style={styles.selectedItemsContainer}>
                                <Text style={styles.selectedItemsTitle}>Paniers ({selectedItems.length})</Text>
                                <ScrollView style={styles.selectedItemsList}>
                                    {selectedItems.map((item) => (
                                        <View key={item.product.id} style={styles.cartItem}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.cartItemName}>{item.product.nom}</Text>
                                                <Text style={styles.cartItemPrice}>{item.product.prix * item.quantite} CFA</Text>
                                            </View>
                                            <View style={styles.qtyBox}>
                                                <TouchableOpacity onPress={() => updateQty(item.product.id, -1)}>
                                                    <Ionicons name="remove-circle-outline" size={24} color={Colors.textLight} />
                                                </TouchableOpacity>
                                                <Text style={styles.qtyValue}>{item.quantite}</Text>
                                                <TouchableOpacity onPress={() => updateQty(item.product.id, 1)}>
                                                    <Ionicons name="add-circle-outline" size={24} color={Colors.secondary} />
                                                </TouchableOpacity>
                                            </View>
                                            <TouchableOpacity onPress={() => removeItem(item.product.id)} style={{ marginLeft: 10 }}>
                                                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>

                                <View style={styles.orderSummary}>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Total à payer</Text>
                                        <Text style={styles.totalValue}>{calculateTotal()} CFA</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                                        onPress={handleCreateCommande}
                                        disabled={submitting || selectedItems.length === 0}
                                    >
                                        {submitting ? <ActivityIndicator color="#FFF" /> : (
                                            <>
                                                <Text style={styles.submitBtnText}>Enregistrer la vente</Text>
                                                <Ionicons name="checkmark-done" size={20} color="#FFF" />
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </Modal>

            {/* Edit Mode Modal */}
            <Modal visible={editModalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.editModalContent}
                    >
                        <View style={styles.editModalHeader}>
                            <Text style={styles.editModalTitle}>Modifier la commande</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ padding: 20 }}>
                            <Text style={styles.label}>Informations Client</Text>
                            <View style={[styles.input, { backgroundColor: editingCommande?.user ? Colors.success + '10' : Colors.surface, borderColor: editingCommande?.user ? Colors.success : Colors.border }]}>
                                <Text style={{ fontFamily: 'Poppins_700Bold', color: Colors.primary }}>
                                    {editingCommande?.user ? `CLIENT INSCRIT : ${editingCommande.user.name}` : `CLIENT PASSAGER : ${editGuestName}`}
                                </Text>
                                <Text style={{ fontSize: 12, color: Colors.textLight }}>
                                    {editingCommande?.user ? `ID: ${editingCommande.user.unique_id} • Tel: ${editingCommande.user.tel}` : `Tel: ${editGuestPhone}`}
                                </Text>
                            </View>

                            {!editingCommande?.user && (
                                <>
                                    <Text style={[styles.label, { marginTop: 10 }]}>Modifier Nom (Guest)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={editGuestName}
                                        onChangeText={setEditGuestName}
                                        placeholder="Nom du client"
                                    />
                                    <Text style={styles.label}>Modifier Téléphone (Guest)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={editGuestPhone}
                                        onChangeText={setEditGuestPhone}
                                        placeholder="Téléphone"
                                        keyboardType="phone-pad"
                                    />
                                </>
                            )}

                            <Text style={[styles.label, { marginTop: 10 }]}>Statut de la commande</Text>
                            <View style={styles.statusGrid}>
                                {['en_attente', 'confirme', 'livre', 'annule'].map(s => (
                                    <TouchableOpacity
                                        key={s}
                                        style={[styles.statusBtn, editStatus === s && { backgroundColor: getStatusLabel(s).color, borderColor: getStatusLabel(s).color }]}
                                        onPress={() => setEditStatus(s)}
                                    >
                                        <Text style={[styles.statusBtnText, editStatus === s && { color: '#FFF' }]}>
                                            {getStatusLabel(s).label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.label, { marginTop: 20 }]}>Lieu de retrait</Text>
                            <View style={styles.cityGrid}>
                                {cities.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.cityItem, editCity === c && styles.cityItemActive]}
                                        onPress={() => {
                                            setEditCity(c);
                                            setEditStation(null);
                                        }}
                                    >
                                        <Text style={[styles.cityItemText, editCity === c && styles.cityItemTextActive]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {editCity && (
                                <>
                                    <Text style={[styles.label, { marginTop: 10 }]}>Station de retrait</Text>
                                    <View style={styles.cityGrid}>
                                        {allStations.filter(s => s.ville === editCity).map(s => (
                                            <TouchableOpacity
                                                key={s.id}
                                                style={[styles.cityItem, editStation?.id === s.id && styles.cityItemActive]}
                                                onPress={() => setEditStation(s)}
                                            >
                                                <Text style={[styles.cityItemText, editStation?.id === s.id && styles.cityItemTextActive]}>{s.nom}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}

                            <Text style={[styles.label, { marginTop: 20 }]}>Modifier les Produits</Text>
                            <View style={[styles.productSearchRow, { backgroundColor: Colors.background }]}>
                                <Ionicons name="search" size={18} color={Colors.textLight} />
                                <TextInput
                                    style={styles.productSearchInput}
                                    placeholder="Ajouter un produit..."
                                    value={editProductSearch}
                                    onChangeText={setEditProductSearch}
                                />
                            </View>

                            {editProductSearch.length > 0 && (
                                <View style={styles.editProductResults}>
                                    {allProducts.filter(p => p.nom.toLowerCase().includes(editProductSearch.toLowerCase())).slice(0, 5).map(p => (
                                        <TouchableOpacity key={p.id} style={styles.editProductItem} onPress={() => { addEditItem(p); setEditProductSearch(''); }}>
                                            <Text style={styles.editProductItemText}>{p.nom} - {p.prix} CFA</Text>
                                            <Ionicons name="add-circle" size={20} color={Colors.secondary} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <View style={styles.editItemsList}>
                                {editItems.map((item) => (
                                    <View key={item.product.id} style={styles.editCartItem}>
                                        <Text style={styles.editCartItemName} numberOfLines={1}>{item.product.nom}</Text>
                                        <View style={styles.qtyBoxSmall}>
                                            <TouchableOpacity onPress={() => updateEditQty(item.product.id, -1)}>
                                                <Ionicons name="remove-circle-outline" size={20} color={Colors.textLight} />
                                            </TouchableOpacity>
                                            <Text style={styles.qtyValueSmall}>{item.quantite}</Text>
                                            <TouchableOpacity onPress={() => updateEditQty(item.product.id, 1)}>
                                                <Ionicons name="add-circle-outline" size={20} color={Colors.secondary} />
                                            </TouchableOpacity>
                                        </View>
                                        <TouchableOpacity onPress={() => removeEditItem(item.product.id)}>
                                            <Ionicons name="trash-outline" size={18} color={Colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>

                            <View style={{ marginTop: 15, padding: 10, backgroundColor: Colors.secondary + '05', borderRadius: 10 }}>
                                <Text style={{ fontFamily: 'Poppins_400Regular', color: Colors.textLight, fontSize: 13 }}>
                                    Nouveau Total : <Text style={{ fontFamily: 'Poppins_700Bold', color: Colors.secondary }}>{calculateSubtotal(editItems)} CFA</Text>
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtn, { marginTop: 30 }, submitting && { opacity: 0.7 }]}
                                onPress={handleUpdateCommande}
                                disabled={submitting}
                            >
                                {submitting ? <ActivityIndicator color="#FFF" /> : (
                                    <>
                                        <Text style={styles.submitBtnText}>Enregistrer les modifications</Text>
                                        <Ionicons name="save-outline" size={20} color="#FFF" />
                                    </>
                                )}
                            </TouchableOpacity>
                            <View style={{ height: 30 }} />
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    topHeader: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    backBtn: { marginRight: 16 },
    headerInfo: { flex: 1 },
    welcomeText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 2 },
    userName: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.primary, marginTop: -2 },
    addBtn: { backgroundColor: Colors.secondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    addBtnText: { color: '#FFF', marginLeft: 5, fontFamily: 'Poppins_600SemiBold' },

    list: { padding: 20, paddingBottom: 100 },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    orderId: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    orderDate: { fontSize: 11, color: Colors.textLight, fontFamily: 'Poppins_400Regular' },
    priceBadge: { backgroundColor: Colors.secondary + '15', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    priceBadgeText: { color: Colors.secondary, fontFamily: 'Poppins_700Bold', fontSize: 14 },

    cardBody: { marginBottom: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    clientName: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.primary, marginLeft: 10 },
    infoText: { fontSize: 13, color: Colors.text, fontFamily: 'Poppins_400Regular', marginLeft: 10 },

    productsList: { backgroundColor: Colors.background, padding: 12, borderRadius: 12, marginTop: 5 },
    productLine: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    productText: { fontSize: 13, color: Colors.primary, fontFamily: 'Poppins_400Regular' },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
    statusTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
    statusTagText: { fontSize: 11, fontFamily: 'Poppins_700Bold', textTransform: 'uppercase' },
    paymentMethodText: { fontSize: 11, color: Colors.textLight, fontFamily: 'Poppins_400Regular', fontStyle: 'italic' },

    empty: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
    emptyText: { marginTop: 15, fontFamily: 'Poppins_400Regular', color: Colors.textLight },

    modalBg: { flex: 1, backgroundColor: Colors.background },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
    modalTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    closeBtn: { padding: 5 },
    stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, backgroundColor: Colors.surface },
    stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
    stepDotActive: { backgroundColor: Colors.secondary },
    stepLine: { width: 40, height: 2, backgroundColor: Colors.border, marginHorizontal: 5 },
    stepLineActive: { backgroundColor: Colors.secondary },

    form: { padding: 20 },
    label: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.primary, marginBottom: 8 },
    searchBox: { position: 'relative' },
    input: { backgroundColor: Colors.surface, borderRadius: 12, padding: 15, marginBottom: 15, fontFamily: 'Poppins_400Regular', borderWidth: 1, borderColor: Colors.border },
    searchIndicator: { position: 'absolute', right: 15, top: 18 },
    searchResults: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        marginTop: -5,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        overflow: 'hidden'
    },
    searchResultItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
    searchResultName: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
    searchResultTel: { fontSize: 12, color: Colors.textLight },
    selectedUserCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.success + '10', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.success + '30', marginTop: 10 },
    selectedUserText: { marginLeft: 10, fontFamily: 'Poppins_700Bold', color: Colors.primary, fontSize: 15 },
    selectedUserSubText: { marginLeft: 28, fontFamily: 'Poppins_400Regular', color: Colors.textLight, fontSize: 12 },
    changeUserText: { color: Colors.secondary, fontSize: 12, fontFamily: 'Poppins_600SemiBold' },

    cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 30 },
    cityItem: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
    cityItemActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    cityItemText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textLight },
    cityItemTextActive: { color: '#FFF' },

    nextBtn: { backgroundColor: Colors.secondary, padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    nextBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_700Bold' },

    productSelectionContainer: { flex: 1, padding: 20 },
    productSearchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15 },
    productSearchInput: { flex: 1, paddingVertical: 12, marginLeft: 10, fontFamily: 'Poppins_400Regular' },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 15,
        borderRadius: 16,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    productItemName: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    productItemPrice: { fontSize: 12, color: Colors.textLight },

    selectedItemsContainer: { backgroundColor: Colors.surface, borderTopLeftRadius: 25, borderTopRightRadius: 25, elevation: 15, padding: 20, height: '50%' },
    selectedItemsTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.primary, marginBottom: 15 },
    selectedItemsList: { flex: 1 },
    cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: Colors.background, paddingBottom: 10 },
    cartItemName: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
    cartItemPrice: { fontSize: 12, color: Colors.secondary, fontFamily: 'Poppins_700Bold' },
    qtyBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    qtyValue: { fontSize: 16, fontFamily: 'Poppins_700Bold', minWidth: 20, textAlign: 'center' },

    orderSummary: { marginTop: 15, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 15 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    totalLabel: { fontSize: 14, color: Colors.textLight },
    totalValue: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    submitBtn: { backgroundColor: Colors.success, padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    submitBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_700Bold' },
    // Modal Additions
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editModalContent: {
        width: '90%',
        backgroundColor: Colors.surface,
        borderRadius: 20,
        maxHeight: '80%',
        overflow: 'hidden',
    },
    editModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    editModalTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10,
    },
    statusBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statusBtnText: {
        fontSize: 12,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.textLight,
    },
    editIconBtn: {
        padding: 8,
        backgroundColor: Colors.secondary + '15',
        borderRadius: 8,
    },
    editProductResults: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        marginTop: -10,
        marginBottom: 10,
    },
    editProductItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    editProductItemText: {
        fontSize: 13,
        fontFamily: 'Poppins_500Medium',
        color: Colors.primary,
    },
    editItemsList: {
        marginTop: 10,
    },
    editCartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.background,
    },
    editCartItemName: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
    },
    qtyBoxSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 10,
    },
    qtyValueSmall: {
        fontSize: 14,
        fontFamily: 'Poppins_700Bold',
        minWidth: 15,
        textAlign: 'center',
    }
});

export default AdminCommandeScreen;
