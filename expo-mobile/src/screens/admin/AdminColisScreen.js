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
    TextInput,
    ScrollView,
    Platform,
    StatusBar,
    RefreshControl,
    KeyboardAvoidingView
} from 'react-native';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { exportToCsv } from '../../utils/export';

const AdminColisScreen = ({ navigation }) => {
    const { hasPermission } = useAuth();
    const canCreate = hasPermission('coli_create');
    const canEdit = hasPermission('coli_edit');
    const canDelete = hasPermission('coli_delete');
    const canExport = hasPermission('export_csv');

    const [colis, setColis] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editColis, setEditColis] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [destNom, setDestNom] = useState('');
    const [destTel, setDestTel] = useState('');
    const [prix, setPrix] = useState('');
    const [statut, setStatut] = useState('en_attente');
    const [startStation, setStartStation] = useState(null);
    const [endStation, setEndStation] = useState(null);

    // Expediteur search
    const [senderSearch, setSenderSearch] = useState('');
    const [senderResults, setSenderResults] = useState([]);
    const [selectedSender, setSelectedSender] = useState(null);
    const [manualSenderNom, setManualSenderNom] = useState('');
    const [manualSenderTel, setManualSenderTel] = useState('');
    const [isManualSender, setIsManualSender] = useState(false);

    const fetchColis = async (search = searchQuery) => {
        try {
            const params = search ? { search } : {};
            const res = await client.get('/admin/colis', { params });
            setColis(res.data.data || res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchInitialData = async () => {
        try {
            const res = await client.get('/admin/stations');
            setStations(res.data.data || res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchColis(), fetchInitialData()]);
        } catch (e) {
            Alert.alert('Erreur', 'Impossible de charger les données');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchColis(searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        fetchData();
    }, []);

    const searchUsers = async (q) => {
        setSenderSearch(q);
        if (q.length < 2) {
            setSenderResults([]);
            return;
        }
        try {
            const res = await client.get(`/admin/clients?search=${q}`);
            setSenderResults(res.data.data || res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async () => {
        if (!destNom || !destTel || !prix || !startStation || !endStation) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (!isManualSender && !selectedSender) {
            Alert.alert('Erreur', 'Veuillez sélectionner un expéditeur');
            return;
        }

        if (isManualSender && (!manualSenderNom || !manualSenderTel)) {
            Alert.alert('Erreur', 'Veuillez renseigner le nom et téléphone de l\'expéditeur');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                destinataire_nom: destNom,
                destinataire_tel: destTel,
                prix,
                statut,
                station_depart_id: startStation.id,
                station_arrivee_id: endStation.id,
                expediteur_id: isManualSender ? null : selectedSender.id,
                expediteur_nom: isManualSender ? manualSenderNom : null,
                expediteur_tel: isManualSender ? manualSenderTel : null,
            };

            if (editColis) {
                await client.put(`/admin/colis/${editColis.id}`, payload);
            } else {
                await client.post('/admin/colis', payload);
            }
            fetchColis();
            setModalVisible(false);
            resetForm();
        } catch (e) {
            const msg = e.response?.data?.message || 'Impossible d\'enregistrer le colis';
            Alert.alert('Erreur', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setDestNom('');
        setDestTel('');
        setPrix('');
        setStatut('en_attente');
        setStartStation(null);
        setEndStation(null);
        setSelectedSender(null);
        setSenderSearch('');
        setSenderResults([]);
        setManualSenderNom('');
        setManualSenderTel('');
        setIsManualSender(false);
        setEditColis(null);
    };

    const handleQuickStatus = async (item) => {
        const nextMap = {
            'en_attente': 'en_cours',
            'en_cours': 'arrive',
            'arrive': 'livre'
        };
        const nextStatus = nextMap[item.statut];
        if (!nextStatus) return;

        try {
            await client.patch(`/admin/colis/${item.id}/status`, { statut: nextStatus });
            fetchColis();
        } catch (e) {
            Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Confirmation', 'Supprimer ce colis ?', [
            { text: 'Annuler' },
            {
                text: 'Supprimer', style: 'destructive', onPress: async () => {
                    try {
                        await client.delete(`/admin/colis/${id}`);
                        fetchColis();
                    } catch (e) { Alert.alert('Erreur', 'Echec suppression'); }
                }
            }
        ]);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'en_attente': return { label: 'EN ATTENTE', color: Colors.warning, icon: 'time-outline' };
            case 'en_cours': return { label: 'EN COURS', color: '#3B82F6', icon: 'airplane-outline' };
            case 'arrive': return { label: 'ARRIVÉ', color: '#A855F7', icon: 'business-outline' };
            case 'livre': return { label: 'LIVRÉ', color: Colors.success, icon: 'checkmark-done-circle-outline' };
            case 'annule': return { label: 'ANNULÉ', color: Colors.error, icon: 'close-circle-outline' };
            default: return { label: status?.toUpperCase(), color: Colors.textLight, icon: 'help-circle-outline' };
        }
    };

    const formatHour = (time) => {
        if (!time) return null;
        return time.substring(0, 5);
    };

    const openEditModal = (item) => {
        setEditColis(item);
        setDestNom(item.destinataire_nom);
        setDestTel(item.destinataire_tel);
        setPrix(item.prix.toString());
        setStatut(item.statut);
        setStartStation(item.station_depart);
        setEndStation(item.station_arrivee);

        if (item.expediteur) {
            setSelectedSender(item.expediteur);
            setIsManualSender(false);
        } else {
            setManualSenderNom(item.expediteur_nom);
            setManualSenderTel(item.expediteur_tel);
            setIsManualSender(true);
        }

        setModalVisible(true);
    };

    const renderItem = ({ item }) => {
        const s = getStatusLabel(item.statut);
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <Text style={styles.destName}>{item.destinataire_nom}</Text>
                        <Text style={styles.destTel}>{item.destinataire_tel}</Text>
                    </View>
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>{item.prix} CFA</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.routeContainer}>
                        <View style={styles.stationRow}>
                            <Ionicons name="location" size={16} color={Colors.primary} />
                            <Text style={styles.stationName}>{item.station_depart?.nom}</Text>
                        </View>
                        <View style={styles.routeLine}>
                            <View style={styles.dot} />
                            <View style={styles.dash} />
                            <Ionicons name="cube" size={14} color={Colors.secondary} />
                            <View style={styles.dash} />
                            <View style={styles.dot} />
                        </View>
                        <View style={styles.stationRow}>
                            <Ionicons name="flag" size={16} color={Colors.secondary} />
                            <Text style={styles.stationName}>{item.station_arrivee?.nom}</Text>
                        </View>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Expéditeur</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>
                                {item.expediteur?.name || item.expediteur_nom || 'Inconnu'}
                            </Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Date</Text>
                            <Text style={styles.infoValue}>{new Date(item.created_at).toLocaleDateString('fr-FR')}</Text>
                        </View>
                    </View>

                    <View style={styles.timeline}>
                        {item.heure_envoi && (
                            <View style={styles.timeItem}>
                                <Ionicons name="paper-plane-outline" size={12} color={Colors.textLight} />
                                <Text style={styles.timeText}>{formatHour(item.heure_envoi)}</Text>
                            </View>
                        )}
                        {item.heure_arrive && (
                            <View style={styles.timeItem}>
                                <Ionicons name="business-outline" size={12} color={Colors.textLight} />
                                <Text style={styles.timeText}>{formatHour(item.heure_arrive)}</Text>
                            </View>
                        )}
                        {item.heure_retrait && (
                            <View style={styles.timeItem}>
                                <Ionicons name="checkmark-done-circle" size={12} color={Colors.success} />
                                <Text style={[styles.timeText, { color: Colors.success }]}>{formatHour(item.heure_retrait)}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={[styles.statusTag, { backgroundColor: s.color + '15' }]}>
                        <Ionicons name={s.icon} size={14} color={s.color} />
                        <Text style={[styles.statusTagText, { color: s.color }]}>{s.label}</Text>
                    </View>

                    <View style={styles.actions}>
                        {canEdit && ['en_attente', 'en_cours', 'arrive'].includes(item.statut) && (
                            <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickStatus(item)}>
                                <Ionicons name="arrow-forward-circle" size={24} color={Colors.secondary} />
                            </TouchableOpacity>
                        )}
                        {canEdit && (
                            <TouchableOpacity style={styles.actionIcon} onPress={() => openEditModal(item)}>
                                <Ionicons name="create-outline" size={22} color={Colors.primary} />
                            </TouchableOpacity>
                        )}
                        {canDelete && (
                            <TouchableOpacity style={styles.actionIcon} onPress={() => handleDelete(item.id)}>
                                <Ionicons name="trash-outline" size={22} color={Colors.error} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header Premium */}
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={28} color={Colors.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.welcomeText}>Administration</Text>
                    <Text style={styles.userName}>Gestion des Colis</Text>
                </View>
                {canCreate && (
                    <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
                        <Ionicons name="add" size={24} color="#FFF" />
                        <Text style={styles.addBtnText}>Créer</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={20} color={Colors.textLight} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un colis ou destinataire..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>
                {canExport && (
                    <TouchableOpacity style={styles.exportBtn} onPress={() => exportToCsv('admin/colis-export', 'colis')}>
                        <Ionicons name="download-outline" size={22} color={Colors.secondary} />
                    </TouchableOpacity>
                )}
            </View>

            {loading && colis.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.secondary} />
                    <Text style={styles.loadingText}>Chargement des colis...</Text>
                </View>
            ) : (
                <FlatList
                    data={colis}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cube-outline" size={60} color={Colors.border} />
                            <Text style={styles.emptyText}>Aucun colis trouvé</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={modalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editColis ? 'Modifier le Colis' : 'Nouveau Colis'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.form}
                            showsVerticalScrollIndicator={false}
                        >
                            {editColis && editColis.statut !== 'en_attente' && (
                                <View style={styles.warningBanner}>
                                    <Ionicons name="lock-closed" size={16} color="#854d0e" />
                                    <Text style={styles.warningText}>Le transport a commencé. Certaines modifications sont limitées.</Text>
                                </View>
                            )}

                            <Text style={styles.label}>Destinataire</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nom complet"
                                value={destNom}
                                onChangeText={setDestNom}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Téléphone"
                                value={destTel}
                                onChangeText={setDestTel}
                                keyboardType="phone-pad"
                            />

                            <Text style={styles.label}>Logistique</Text>
                            <View style={styles.inputRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.subLabel}>Prix (CFA)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ex: 2000"
                                        value={prix}
                                        onChangeText={setPrix}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <Text style={styles.subLabel}>Station Départ</Text>
                            <View style={styles.cityGrid}>
                                {stations.map(s => (
                                    <TouchableOpacity
                                        key={s.id}
                                        style={[styles.cityItem, startStation?.id === s.id && styles.cityItemActive]}
                                        onPress={() => setStartStation(s)}
                                    >
                                        <Text style={[styles.cityItemText, startStation?.id === s.id && styles.cityItemTextActive]}>{s.nom}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.subLabel, { marginTop: 10 }]}>Station Arrivée</Text>
                            <View style={styles.cityGrid}>
                                {stations.map(s => (
                                    <TouchableOpacity
                                        key={s.id}
                                        style={[styles.cityItem, endStation?.id === s.id && styles.cityItemActive]}
                                        onPress={() => setEndStation(s)}
                                    >
                                        <Text style={[styles.cityItemText, endStation?.id === s.id && styles.cityItemTextActive]}>{s.nom}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.expediteurSection}>
                                <View style={styles.expHeader}>
                                    <Text style={styles.label}>Expéditeur</Text>
                                    <TouchableOpacity onPress={() => { setIsManualSender(!isManualSender); setSelectedSender(null); }}>
                                        <Text style={styles.switchText}>{isManualSender ? 'Chercher Client' : 'Saisie Manuelle'}</Text>
                                    </TouchableOpacity>
                                </View>

                                {isManualSender ? (
                                    <View>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Nom de l'expéditeur"
                                            value={manualSenderNom}
                                            onChangeText={setManualSenderNom}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Téléphone"
                                            value={manualSenderTel}
                                            onChangeText={setManualSenderTel}
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                ) : (
                                    <View>
                                        {selectedSender ? (
                                            <TouchableOpacity style={styles.selectedUserCard} onPress={() => setSelectedSender(null)}>
                                                <Ionicons name="person-circle" size={24} color={Colors.success} />
                                                <View style={{ flex: 1, marginLeft: 10 }}>
                                                    <Text style={styles.selectedUserName}>{selectedSender.name}</Text>
                                                    <Text style={styles.selectedUserTel}>{selectedSender.tel}</Text>
                                                </View>
                                                <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                                            </TouchableOpacity>
                                        ) : (
                                            <View>
                                                <View style={styles.searchBox}>
                                                    <TextInput
                                                        style={styles.input}
                                                        placeholder="Rechercher un client..."
                                                        value={senderSearch}
                                                        onChangeText={searchUsers}
                                                    />
                                                </View>
                                                {senderResults.length > 0 && (
                                                    <View style={styles.searchResults}>
                                                        {senderResults.slice(0, 3).map(u => (
                                                            <TouchableOpacity key={u.id} style={styles.searchResultItem} onPress={() => { setSelectedSender(u); setSenderResults([]); }}>
                                                                <Text style={styles.searchResultName}>{u.name}</Text>
                                                                <Text style={styles.searchResultTel}>{u.tel}</Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>

                            <Text style={[styles.label, { marginTop: 10 }]}>Statut Actuel</Text>
                            <View style={styles.statusGrid}>
                                {['en_attente', 'en_cours', 'arrive', 'livre', 'annule'].map(s => {
                                    const info = getStatusLabel(s);
                                    return (
                                        <TouchableOpacity
                                            key={s}
                                            style={[styles.statusBtn, statut === s && { backgroundColor: info.color, borderColor: info.color }]}
                                            onPress={() => setStatut(s)}
                                        >
                                            <Text style={[styles.statusBtnText, statut === s && { color: '#FFF' }]}>{info.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                                onPress={handleSave}
                                disabled={submitting}
                            >
                                {submitting ? <ActivityIndicator color="#FFF" /> : (
                                    <>
                                        <Text style={styles.submitBtnText}>Enregistrer</Text>
                                        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
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
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
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

    searchSection: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15, alignItems: 'center', gap: 10 },
    searchBarContainer: { flex: 1, height: 45, backgroundColor: Colors.surface, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    searchInput: { flex: 1, marginLeft: 10, fontFamily: 'Poppins_400Regular', fontSize: 13, color: Colors.primary },
    exportBtn: { width: 45, height: 45, backgroundColor: Colors.surface, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },

    list: { padding: 20 },
    card: { backgroundColor: Colors.surface, borderRadius: 20, padding: 16, marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    destName: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    destTel: { fontSize: 12, color: Colors.textLight, fontFamily: 'Poppins_400Regular' },
    priceBadge: { backgroundColor: Colors.secondary + '15', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    priceText: { color: Colors.secondary, fontFamily: 'Poppins_700Bold', fontSize: 13 },

    cardBody: { marginBottom: 15 },
    routeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 },
    stationRow: { alignItems: 'center', flex: 1 },
    stationName: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.primary, marginTop: 4, textAlign: 'center' },
    routeLine: { flex: 0.8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    dash: { flex: 1, height: 1.5, backgroundColor: Colors.border, marginHorizontal: 5 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },

    infoGrid: { flexDirection: 'row', backgroundColor: Colors.background, padding: 12, borderRadius: 12, gap: 10, marginTop: 10 },
    infoBox: { flex: 1 },
    infoLabel: { fontSize: 10, color: Colors.textLight, fontFamily: 'Poppins_400Regular', textTransform: 'uppercase' },
    infoValue: { fontSize: 12, color: Colors.primary, fontFamily: 'Poppins_600SemiBold' },

    timeline: { flexDirection: 'row', marginTop: 12, gap: 15 },
    timeItem: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: Colors.border },
    timeText: { fontSize: 10, color: Colors.textLight, fontFamily: 'Poppins_600SemiBold' },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
    statusTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    statusTagText: { fontSize: 10, fontFamily: 'Poppins_700Bold' },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    actionIcon: { padding: 4 },
    quickAction: { padding: 2 },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: Colors.textLight, fontFamily: 'Poppins_400Regular' },
    emptyContainer: { alignItems: 'center', marginTop: 50, opacity: 0.5 },
    emptyText: { marginTop: 10, fontFamily: 'Poppins_400Regular', color: Colors.textLight },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: Colors.border },
    modalTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    closeBtn: { padding: 5 },
    form: { padding: 24 },
    label: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.primary, marginBottom: 10 },
    subLabel: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.textLight, marginBottom: 8 },
    input: { backgroundColor: Colors.background, borderRadius: 12, padding: 15, marginBottom: 15, fontFamily: 'Poppins_400Regular', fontSize: 14, color: Colors.primary },
    inputRow: { flexDirection: 'row', gap: 15 },
    cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
    cityItem: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
    cityItemActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    cityItemText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textLight },
    cityItemTextActive: { color: '#FFF' },

    expediteurSection: { marginTop: 10, marginBottom: 20, padding: 15, backgroundColor: Colors.background, borderRadius: 15 },
    expHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    switchText: { color: Colors.secondary, fontSize: 12, fontFamily: 'Poppins_700Bold' },
    selectedUserCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.success },
    selectedUserName: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    selectedUserTel: { fontSize: 12, color: Colors.textLight },
    searchResults: { backgroundColor: Colors.surface, borderRadius: 12, marginTop: -10, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
    searchResultItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
    searchResultName: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
    searchResultTel: { fontSize: 11, color: Colors.textLight },

    statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 25 },
    statusBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
    statusBtnText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: Colors.textLight },

    submitBtn: { backgroundColor: Colors.secondary, padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
    submitBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_700Bold' },
    warningBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF9C3', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FEF08A' },
    warningText: { fontSize: 11, color: '#854d0e', fontFamily: 'Poppins_500Medium', flex: 1 },
});

export default AdminColisScreen;
