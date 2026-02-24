import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    StatusBar,
    TextInput,
    KeyboardAvoidingView,
    ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { exportToCsv } from '../../utils/export';

const AdminReservationScreen = ({ navigation }) => {
    const { hasPermission } = useAuth();
    const canShow = hasPermission('reservation_show');
    const canEdit = hasPermission('reservation_edit');
    const canDelete = hasPermission('reservation_delete');
    const canExport = hasPermission('export_csv');

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRes, setSelectedRes] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Multi-selection states
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // Create Reservation States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [stations, setStations] = useState([]);
    const [cities, setCities] = useState([]);
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [userSearchLoading, setUserSearchLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSearchText, setUserSearchText] = useState('');

    const getRoundedTime = () => {
        const now = new Date();
        const ms = 1000 * 60 * 15;
        const rounded = new Date(Math.ceil(now.getTime() / ms) * ms);
        return rounded;
    };

    const [formData, setFormData] = useState({
        guest_name: '',
        guest_phone: '',
        station_depart_id: '',
        station_arrivee_id: '',
        date_depart: new Date().toISOString().split('T')[0],
        heure_depart: getRoundedTime().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'H').split('H').join(':'),
        nombre_tickets: '1',
        prix: '0'
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [unitPrice, setUnitPrice] = useState(0);
    const [creating, setCreating] = useState(false);

    const fetchStations = async () => {
        try {
            const [stationsRes, priceRes] = await Promise.all([
                client.get('/stations'),
                client.get('/admin/settings/price')
            ]);
            setStations(stationsRes.data);
            const uniqueCities = [...new Set(stationsRes.data.map(s => s.ville))].sort();
            setCities(uniqueCities);

            setFormData(prev => ({
                ...prev,
                prix: priceRes.data.prix.toString()
            }));
            setUnitPrice(priceRes.data.prix);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSearchUser = async (text) => {
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
            if (userSearchText.length >= 2) {
                handleSearchUser(userSearchText);
            } else {
                setUserSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [userSearchText]);

    useEffect(() => {
        const tickets = parseInt(formData.nombre_tickets) || 0;
        const total = tickets * unitPrice;
        setFormData(prev => ({ ...prev, prix: total.toString() }));
    }, [formData.nombre_tickets, unitPrice]);

    const handleCreateReservation = async () => {
        if (!formData.station_depart_id || !formData.station_arrivee_id || !formData.date_depart || !formData.heure_depart) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (formData.station_depart_id === formData.station_arrivee_id) {
            Alert.alert('Erreur', 'Le départ et l\'arrivée ne peuvent pas être identiques');
            return;
        }

        if (!selectedUser && !formData.guest_name) {
            Alert.alert('Erreur', 'Veuillez sélectionner un utilisateur ou entrer un nom d\'invité');
            return;
        }

        setCreating(true);
        try {
            await client.post('/admin/reservations', {
                ...formData,
                user_id: selectedUser?.id,
                nombre_tickets: parseInt(formData.nombre_tickets),
                prix: parseFloat(formData.prix)
            });
            Alert.alert('Succès', 'Réservation créée avec succès');
            setCreateModalVisible(false);
            fetchReservations();
            // Reset form
            setSelectedUser(null);
            setUserSearchText('');
        } catch (e) {
            const msg = e.response?.data?.message || 'Erreur lors de la création';
            Alert.alert('Erreur', msg);
        } finally {
            setCreating(false);
        }
    };

    const fetchReservations = async (search = searchQuery) => {
        try {
            const params = search ? { search } : {};
            const response = await client.get('/admin/reservations', { params });
            setReservations(response.data.data || response.data);
            setSelectedIds([]);
            setSelectionMode(false);
        } catch (e) {
            console.error(e);
            Alert.alert('Erreur', 'Impossible de charger les réservations');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchReservations(searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        fetchStations();
    }, []);

    const toggleSelection = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                const updated = prev.filter(i => i !== id);
                if (updated.length === 0) setSelectionMode(false);
                return updated;
            } else {
                return [...prev, id];
            }
        });
    };

    const selectEnTrajet = () => {
        const enTrajetIds = reservations
            .filter(r => r.statut === 'en_trajet')
            .map(r => r.id);

        if (enTrajetIds.length === 0) {
            Alert.alert('Info', 'Aucune réservation "En trajet" à sélectionner.');
            return;
        }

        setSelectionMode(true);
        setSelectedIds(enTrajetIds);
    };

    const handleBulkComplete = async () => {
        if (selectedIds.length === 0) return;

        Alert.alert(
            'Action groupée',
            `Marquer ${selectedIds.length} réservation(s) comme TERMINÉES ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Confirmer',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await client.post('/admin/reservations/bulk-status', {
                                ids: selectedIds,
                                statut: 'termine'
                            });
                            fetchReservations();
                        } catch (e) {
                            Alert.alert('Erreur', 'L\'opération a échoué');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await client.patch(`/admin/reservations/${id}/status`, { statut: newStatus });
            Alert.alert('Succès', 'Statut mis à jour');
            setModalVisible(false);
            fetchReservations();
        } catch (e) {
            Alert.alert('Erreur', 'Mise à jour échouée');
        }
    };

    const deleteReservation = (id) => {
        Alert.alert(
            'Confirmation',
            'Voulez-vous vraiment supprimer cette réservation ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.delete(`/admin/reservations/${id}`);
                            fetchReservations();
                        } catch (e) {
                            Alert.alert('Erreur', 'Suppression échouée');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedIds.includes(item.id);

        return (
            <TouchableOpacity
                style={[styles.card, isSelected && styles.selectedCard]}
                onLongPress={() => {
                    if (!selectionMode) {
                        setSelectionMode(true);
                        toggleSelection(item.id);
                    }
                }}
                onPress={() => {
                    if (selectionMode) {
                        toggleSelection(item.id);
                    } else if (canShow || canEdit) {
                        setSelectedRes(item);
                        setModalVisible(true);
                    }
                }}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        {selectionMode && (
                            <Ionicons
                                name={isSelected ? "checkbox" : "square-outline"}
                                size={24}
                                color={isSelected ? Colors.secondary : Colors.textLight}
                                style={{ marginRight: 12 }}
                            />
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.clientName} numberOfLines={1}>
                                {item.user?.name || item.guest_name || 'Client Inconnu'}
                            </Text>
                            {item.user?.unique_id && (
                                <Text style={{ fontSize: 11, color: Colors.secondary, fontFamily: 'Poppins_600SemiBold' }}>
                                    ID: {item.user.unique_id}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.statut) }]}>
                            {item.statut === 'en_attente' ? 'À VENIR' :
                                item.statut === 'en_trajet' ? 'EN TRAJET' :
                                    item.statut === 'confirme' ? 'CONFIRMÉE' :
                                        item.statut === 'termine' ? 'TERMINÉE' :
                                            item.statut === 'annule' ? 'ANNULÉE' : item.statut}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color={Colors.textLight} />
                        <Text style={styles.infoText}>{item.station_depart?.nom} → {item.station_arrivee?.nom}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={Colors.textLight} />
                        <Text style={styles.infoText}>{new Date(item.created_at).toLocaleString('fr-FR')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="key-outline" size={16} color={Colors.textLight} />
                        <Text style={styles.infoText}>{`Code: ${item.tickets?.[0]?.code || "---"}`}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="ticket-outline" size={16} color={Colors.textLight} />
                        <Text style={styles.infoText}>{item.nombre_tickets} ticket(s)</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="cash-outline" size={16} color={Colors.secondary} />
                        <Text style={[styles.infoText, { color: Colors.secondary, fontFamily: 'Poppins_700Bold' }]}>{item.prix} CFA</Text>
                    </View>
                </View>

                {!selectionMode && canDelete && (
                    <View style={styles.cardFooter}>
                        <TouchableOpacity onPress={() => deleteReservation(item.id)} style={styles.actionBtn}>
                            <Ionicons name="trash-outline" size={20} color={Colors.error} />
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'en_attente': return Colors.warning;
            case 'confirme': return Colors.success;
            case 'en_trajet': return '#2196F3';
            case 'annule': return Colors.error;
            case 'termine': return Colors.primary;
            default: return Colors.textLight;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.surface }}>
                <View style={styles.topHeader}>
                    {!showSearch ? (
                        <>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                            <View style={styles.headerInfo}>
                                <Text style={styles.welcomeText}>Admin</Text>
                                <Text style={styles.userName} numberOfLines={1}>Réservations</Text>
                            </View>
                            <View style={styles.headerActions}>
                                <TouchableOpacity
                                    onPress={() => setShowSearch(true)}
                                    style={{ marginRight: 15 }}
                                >
                                    <Ionicons name="search" size={24} color={Colors.textLight} />
                                </TouchableOpacity>
                                {!selectionMode && (
                                    <TouchableOpacity onPress={selectEnTrajet} style={styles.bulkIconBtn}>
                                        <Ionicons name="copy-outline" size={20} color={Colors.secondary} />
                                    </TouchableOpacity>
                                )}
                                {selectionMode ? (
                                    <TouchableOpacity
                                        onPress={() => { setSelectionMode(false); setSelectedIds([]); }}
                                        style={styles.cancelBtn}
                                    >
                                        <Ionicons name="close-circle" size={24} color={Colors.error} />
                                    </TouchableOpacity>
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {canExport && (
                                            <TouchableOpacity
                                                onPress={() => exportToCsv('admin/reservations-export', 'reservations')}
                                                style={[styles.refreshBtn, { marginRight: 10 }]}
                                            >
                                                <Ionicons name="download-outline" size={22} color={Colors.secondary} />
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity onPress={() => fetchReservations()} style={styles.refreshBtn}>
                                            <Ionicons name="refresh" size={22} color={Colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </>
                    ) : (
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color={Colors.textLight} style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Nom client, ticket..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                            <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
                                <Ionicons name="close-circle" size={22} color={Colors.textLight} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </SafeAreaView>

            {loading && reservations.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.secondary} />
                </View>
            ) : (
                <FlatList
                    data={reservations}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    onRefresh={fetchReservations}
                    refreshing={refreshing}
                    extraData={selectedIds}
                    ListEmptyComponent={<Text style={styles.empty}>Aucune réservation trouvée</Text>}
                />
            )}

            {selectionMode && (
                <View style={styles.bulkActionContainer}>
                    <TouchableOpacity style={styles.bulkActionBtn} onPress={handleBulkComplete}>
                        <Ionicons name="checkmark-done" size={24} color="#FFF" />
                        <Text style={styles.bulkActionText}>Marquer comme Terminé ({selectedIds.length})</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!selectionMode && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setCreateModalVisible(true)}
                >
                    <Ionicons name="add" size={30} color="#FFF" />
                </TouchableOpacity>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={createModalVisible}
                onRequestClose={() => setCreateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={[styles.modalContent, { height: '90%' }]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nouvelle Réservation</Text>
                            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                                <Ionicons name="close" size={28} color={Colors.textLight} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.form}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Recherche Utilisateur */}
                            <View>
                                <Text style={styles.label}>Rechercher un Client existant</Text>
                                <View style={styles.searchContainer}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Nom ou téléphone..."
                                        value={userSearchText}
                                        onChangeText={setUserSearchText}
                                    />
                                    {userSearchLoading && <ActivityIndicator size="small" color={Colors.secondary} style={{ marginLeft: 15, marginBottom: 10 }} />}
                                </View>

                                {userSearchResults.length > 0 && (
                                    <View style={[styles.resultsList, { overflow: 'hidden' }]}>
                                        <ScrollView
                                            style={{ maxHeight: 180 }}
                                            nestedScrollEnabled={true}
                                            keyboardShouldPersistTaps="handled"
                                        >
                                            {userSearchResults.map(u => (
                                                <TouchableOpacity
                                                    key={u.id}
                                                    style={styles.resultItem}
                                                    onPress={() => {
                                                        setSelectedUser(u);
                                                        setUserSearchResults([]);
                                                        setUserSearchText(u.name);
                                                    }}
                                                >
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.resultText} numberOfLines={1}>{u.name}</Text>
                                                            <Text style={{ fontSize: 11, color: Colors.secondary, fontFamily: 'Poppins_600SemiBold' }}>ID: {u.unique_id}</Text>
                                                            <Text style={{ fontSize: 12, color: Colors.textLight }}>{u.tel}</Text>
                                                        </View>
                                                        <Ionicons name="person-add" size={20} color={Colors.secondary} />
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            {selectedUser ? (
                                <View style={styles.selectedUserBadge}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="person" size={20} color={Colors.secondary} style={{ marginRight: 10 }} />
                                        <View>
                                            <Text style={styles.selectedUserText}>{selectedUser.name}</Text>
                                            <Text style={{ fontSize: 12, color: Colors.secondary }}>ID: {selectedUser.unique_id}</Text>
                                            <Text style={{ fontSize: 12, color: Colors.textLight }}>{selectedUser.tel} • Compte lié ✅</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => { setSelectedUser(null); setUserSearchText(''); }}>
                                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={{ marginTop: 10 }}>
                                    <Text style={styles.label}>OU - Créer pour un nouveau client</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nom complet du passager"
                                        value={formData.guest_name}
                                        onChangeText={(v) => setFormData({ ...formData, guest_name: v })}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Numéro de téléphone"
                                        value={formData.guest_phone}
                                        onChangeText={(v) => setFormData({ ...formData, guest_phone: v })}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            )}

                            <View style={styles.divider} />

                            <Text style={styles.label}>Détails du Trajet</Text>

                            <Text style={styles.subLabel}>Départ</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerContainer}>
                                {stations.map(item => (
                                    <TouchableOpacity
                                        key={'dep' + item.id}
                                        style={[styles.chip, formData.station_depart_id === item.id && styles.chipActive]}
                                        onPress={() => {
                                            if (formData.station_arrivee_id === item.id) {
                                                Alert.alert('Erreur', 'Le départ ne peut être identique à l\'arrivée');
                                                return;
                                            }
                                            setFormData({ ...formData, station_depart_id: item.id });
                                        }}
                                    >
                                        <Text style={[styles.chipText, formData.station_depart_id === item.id && styles.chipTextActive]}>{item.nom}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.subLabel}>Arrivée</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerContainer}>
                                {stations.map(item => (
                                    <TouchableOpacity
                                        key={'arr' + item.id}
                                        style={[styles.chip, formData.station_arrivee_id === item.id && styles.chipActive]}
                                        onPress={() => {
                                            if (formData.station_depart_id === item.id) {
                                                Alert.alert('Erreur', 'L\'arrivée ne peut être identique au départ');
                                                return;
                                            }
                                            setFormData({ ...formData, station_arrivee_id: item.id });
                                        }}
                                    >
                                        <Text style={[styles.chipText, formData.station_arrivee_id === item.id && styles.chipTextActive]}>{item.nom}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Date de départ</Text>
                                    <TouchableOpacity
                                        style={styles.input}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: Colors.text }}>{formData.date_depart}</Text>
                                            <Ionicons name="calendar-outline" size={20} color={Colors.secondary} />
                                        </View>
                                    </TouchableOpacity>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={new Date(formData.date_depart)}
                                            mode="date"
                                            display="default"
                                            minimumDate={new Date()}
                                            onChange={(event, selectedDate) => {
                                                setShowDatePicker(false);
                                                if (selectedDate) {
                                                    setFormData({ ...formData, date_depart: selectedDate.toISOString().split('T')[0] });
                                                }
                                            }}
                                        />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Heure</Text>
                                    <TouchableOpacity
                                        style={styles.input}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: Colors.text }}>{formData.heure_depart}</Text>
                                            <Ionicons name="time-outline" size={20} color={Colors.secondary} />
                                        </View>
                                    </TouchableOpacity>
                                    {showTimePicker && (
                                        <DateTimePicker
                                            value={(() => {
                                                const d = new Date();
                                                const [h, m] = formData.heure_depart.split(':');
                                                d.setHours(parseInt(h), parseInt(m));
                                                return d;
                                            })()}
                                            mode="time"
                                            display="default"
                                            is24Hour={true}
                                            minuteInterval={15}
                                            onChange={(event, selectedTime) => {
                                                setShowTimePicker(false);
                                                if (selectedTime) {
                                                    const h = selectedTime.getHours().toString().padStart(2, '0');
                                                    const m = selectedTime.getMinutes().toString().padStart(2, '0');
                                                    setFormData({ ...formData, heure_depart: `${h}:${m}` });
                                                }
                                            }}
                                        />
                                    )}
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Tickets</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.nombre_tickets}
                                        onChangeText={(v) => setFormData({ ...formData, nombre_tickets: v })}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Prix Total (CFA)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.prix}
                                        onChangeText={(v) => setFormData({ ...formData, prix: v })}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <Text style={styles.paymentNotice}>
                                Ce type de paiement est soit fait en espèces soit payé via le service Momo de Nonvi
                            </Text>

                            <TouchableOpacity
                                style={[styles.submitBtn, creating && { opacity: 0.7 }]}
                                onPress={handleCreateReservation}
                                disabled={creating}
                            >
                                {creating ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Créer la Réservation</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{canEdit ? 'Modifier le statut' : 'Détails de la réservation'}</Text>

                        {canEdit ? (
                            <View style={styles.modalBody}>
                                <TouchableOpacity
                                    style={[styles.statusButton, { backgroundColor: Colors.warning + '15' }]}
                                    onPress={() => updateStatus(selectedRes?.id, 'en_attente')}
                                >
                                    <View style={styles.statusDot(Colors.warning)} />
                                    <Text style={[styles.statusButtonText, { color: Colors.warning }]}>À venir</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.statusButton, { backgroundColor: Colors.success + '15' }]}
                                    onPress={() => updateStatus(selectedRes?.id, 'confirme')}
                                >
                                    <View style={styles.statusDot(Colors.success)} />
                                    <Text style={[styles.statusButtonText, { color: Colors.success }]}>Confirmer</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.statusButton, { backgroundColor: Colors.primary + '15' }]}
                                    onPress={() => updateStatus(selectedRes?.id, 'termine')}
                                >
                                    <View style={styles.statusDot(Colors.primary)} />
                                    <Text style={[styles.statusButtonText, { color: Colors.primary }]}>Terminer</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.statusButton, { backgroundColor: Colors.error + '15' }]}
                                    onPress={() => updateStatus(selectedRes?.id, 'annule')}
                                >
                                    <View style={styles.statusDot(Colors.error)} />
                                    <Text style={[styles.statusButtonText, { color: Colors.error }]}>Annuler</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ color: Colors.textLight, textAlign: 'center' }}>
                                    Lecture seule
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    topHeader: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    backBtn: {
        marginRight: 16,
    },
    headerInfo: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    userName: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginTop: -2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bulkIconBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: Colors.secondary + '15',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    bulkIconText: {
        fontSize: 12,
        color: Colors.secondary,
        fontFamily: 'Poppins_600SemiBold',
        marginLeft: 5,
    },
    cancelBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: Colors.error + '15',
        borderRadius: 8,
    },
    cancelText: {
        color: Colors.error,
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 13,
    },
    refreshBtn: {
        padding: 8,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 20,
        paddingBottom: 100,
    },
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
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: Colors.secondary,
        backgroundColor: Colors.secondary + '05',
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
    clientName: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontFamily: 'Poppins_700Bold',
        textTransform: 'uppercase',
    },
    cardBody: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.text,
        marginLeft: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    actionBtn: {
        padding: 8,
    },
    empty: {
        textAlign: 'center',
        marginTop: 60,
        color: Colors.textLight,
        fontFamily: 'Poppins_400Regular',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginBottom: 25,
        textAlign: 'center',
    },
    modalBody: {
        gap: 12,
    },
    statusButton: {
        padding: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: (color) => ({
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        marginRight: 15,
    }),
    statusButtonText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    closeButton: {
        marginTop: 20,
        padding: 16,
        alignItems: 'center',
    },
    closeButtonText: {
        color: Colors.textLight,
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 15,
    },
    bulkActionContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        zIndex: 100,
    },
    bulkActionBtn: {
        backgroundColor: Colors.secondary,
        padding: 20,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    bulkActionText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        marginLeft: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 45,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        color: Colors.primary,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    form: {
        paddingBottom: 40
    },
    label: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
        marginBottom: 8,
        marginTop: 15
    },
    subLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        marginBottom: 5
    },
    input: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 10
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    resultsList: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden'
    },
    resultItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border
    },
    resultText: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.text
    },
    selectedUserBadge: {
        flexDirection: 'row',
        backgroundColor: Colors.secondary + '15',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    selectedUserText: {
        color: Colors.secondary,
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14
    },
    pickerContainer: {
        marginBottom: 15
    },
    chip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: 8
    },
    chipActive: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary
    },
    chipText: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
        color: Colors.text
    },
    chipTextActive: {
        color: '#FFF'
    },
    submitBtn: {
        backgroundColor: Colors.primary,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 30
    },
    submitBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Poppins_700Bold'
    },
    paymentNotice: {
        fontSize: 12,
        color: Colors.textLight,
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 10,
        fontFamily: 'Poppins_400Regular'
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 20
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        zIndex: 10,
    }
});

export default AdminReservationScreen;
