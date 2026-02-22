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
} from 'react-native';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import { useAuth } from '../../context/AuthContext';

const AdminColisScreen = ({ navigation }) => {
    const { hasPermission } = useAuth();
    const canCreate = hasPermission('coli_create');
    const canShow = hasPermission('coli_show');
    const canEdit = hasPermission('coli_edit');
    const canDelete = hasPermission('coli_delete');

    const [colis, setColis] = useState([]);
    const [stations, setStations] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editColis, setEditColis] = useState(null);

    // Form state
    const [destNom, setDestNom] = useState('');
    const [destTel, setDestTel] = useState('');
    const [prix, setPrix] = useState('');
    const [statut, setStatut] = useState('en_attente');
    const [startStation, setStartStation] = useState('');
    const [endStation, setEndStation] = useState('');
    const [expediteurId, setExpediteurId] = useState('');
    const [expediteurNom, setExpediteurNom] = useState('');
    const [expediteurTel, setExpediteurTel] = useState('');
    const [isManualSender, setIsManualSender] = useState(false);

    const fetchData = async () => {
        try {
            const [colisRes, stationsRes, clientsRes] = await Promise.all([
                client.get('/admin/colis'),
                client.get('/admin/stations'),
                client.get('/admin/clients')
            ]);
            setColis(colisRes.data.data);
            setStations(stationsRes.data.data || stationsRes.data);
            setClients(clientsRes.data.data);
        } catch (e) {
            Alert.alert('Erreur', 'Impossible de charger les données');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!destNom || !destTel || !prix || !startStation || !endStation) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (!isManualSender && !expediteurId) {
            Alert.alert('Erreur', 'Veuillez sélectionner un expéditeur ou choisir l\'envoi manuel');
            return;
        }

        if (isManualSender && (!expediteurNom || !expediteurTel)) {
            Alert.alert('Erreur', 'Veuillez remplir les informations de l\'expéditeur manuel');
            return;
        }

        if (startStation === endStation) {
            Alert.alert('Erreur', 'La station de départ et d\'arrivée ne peuvent pas être identiques');
            return;
        }

        const data = {
            destinataire_nom: destNom,
            destinataire_tel: destTel,
            prix,
            statut,
            station_depart_id: startStation,
            station_arrivee_id: endStation,
            expediteur_id: isManualSender ? null : expediteurId,
            expediteur_nom: isManualSender ? expediteurNom : null,
            expediteur_tel: isManualSender ? expediteurTel : null,
        };

        try {
            if (editColis) {
                await client.put(`/admin/colis/${editColis.id}`, data);
            } else {
                await client.post('/admin/colis', data);
            }
            fetchData();
            setModalVisible(false);
            resetForm();
        } catch (e) {
            const msg = e.response?.data?.message || 'Impossible d\'enregistrer le colis';
            const errors = e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join('\n') : '';
            Alert.alert('Erreur', errors || msg);
        }
    };

    const resetForm = () => {
        setDestNom('');
        setDestTel('');
        setPrix('');
        setStatut('en_attente');
        setStartStation('');
        setEndStation('');
        setExpediteurId('');
        setExpediteurNom('');
        setExpediteurTel('');
        setIsManualSender(false);
        setEditColis(null);
    };

    const handleQuickStatus = async (item) => {
        let nextStatus = '';
        if (item.statut === 'en_attente') nextStatus = 'en_cours';
        else if (item.statut === 'en_cours') nextStatus = 'arrive';
        else if (item.statut === 'arrive') nextStatus = 'livre';

        if (!nextStatus) return;

        try {
            await client.patch(`/admin/colis/${item.id}/status`, { statut: nextStatus });
            fetchData();
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
                        fetchData();
                    } catch (e) { Alert.alert('Erreur', 'Echec suppression'); }
                }
            }
        ]);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'en_attente': return Colors.warning;
            case 'en_cours': return '#3B82F6'; // Blue
            case 'arrive': return '#A855F7'; // Purple
            case 'livre': return Colors.success;
            case 'annule': return Colors.error;
            default: return Colors.textLight;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'en_attente': return 'EN ATTENTE';
            case 'en_cours': return 'EN COURS';
            case 'arrive': return 'ARRIVÉ';
            case 'livre': return 'LIVRÉ';
            case 'annule': return 'ANNULÉ';
            default: return status?.toUpperCase();
        }
    };

    const getNextStatus = (current) => {
        if (current === 'en_attente') return 'en_cours';
        if (current === 'en_cours') return 'arrive';
        if (current === 'arrive') return 'livre';
        return null;
    };

    const formatHour = (time) => {
        if (!time) return null;
        return time.substring(0, 5); // Take HH:mm from HH:mm:ss
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.destName}>{item.destinataire_nom}</Text>
                    <Text style={styles.subtext}>{item.destinataire_tel}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.statut) }]}>
                        {getStatusLabel(item.statut)}
                    </Text>
                </View>
            </View>
            <View style={styles.route}>
                <Text style={styles.routeText}>{item.station_depart?.nom || item.station_depart?.name} → {item.station_arrivee?.nom || item.station_arrivee?.name}</Text>

                <View style={styles.hoursRow}>
                    {item.heure_envoi && (
                        <View style={styles.hourItem}>
                            <Ionicons name="paper-plane-outline" size={12} color={Colors.textLight} />
                            <Text style={styles.hourText}>{formatHour(item.heure_envoi)}</Text>
                        </View>
                    )}
                    {item.heure_arrive && (
                        <View style={styles.hourItem}>
                            <Ionicons name="business-outline" size={12} color={Colors.textLight} />
                            <Text style={styles.hourText}>{formatHour(item.heure_arrive)}</Text>
                        </View>
                    )}
                    {item.heure_retrait && (
                        <View style={styles.hourItem}>
                            <Ionicons name="checkmark-done-circle-outline" size={12} color={Colors.textLight} />
                            <Text style={styles.hourText}>{formatHour(item.heure_retrait)}</Text>
                        </View>
                    )}
                    {item.heure_annule && (
                        <View style={styles.hourItem}>
                            <Ionicons name="close-circle-outline" size={12} color={Colors.error} />
                            <Text style={[styles.hourText, { color: Colors.error }]}>{formatHour(item.heure_annule)}</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.price}>{item.prix} CFA</Text>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.expediteur}>
                    Exp: {item.expediteur?.nom || item.expediteur_nom || 'Inconnu'}
                </Text>
                <View style={styles.actions}>
                    {canEdit && ['en_attente', 'en_cours', 'arrive'].includes(item.statut) && (
                        <TouchableOpacity
                            onPress={() => handleQuickStatus(item)}
                            style={[styles.quickBtn, { borderColor: getStatusColor(getNextStatus(item.statut)) }]}
                        >
                            <Text style={[styles.quickBtnText, { color: getStatusColor(getNextStatus(item.statut)) }]}>
                                Passer à {getStatusLabel(getNextStatus(item.statut))}
                            </Text>
                            <Ionicons name="arrow-forward" size={14} color={getStatusColor(getNextStatus(item.statut))} />
                        </TouchableOpacity>
                    )}
                    {canEdit && (
                        <TouchableOpacity onPress={() => {
                            setEditColis(item);
                            setDestNom(item.destinataire_nom);
                            setDestTel(item.destinataire_tel);
                            setPrix(item.prix.toString());
                            setStatut(item.statut);
                            setStartStation(item.station_depart_id.toString());
                            setEndStation(item.station_arrivee_id.toString());
                            setExpediteurId(item.expediteur_id?.toString() || '');
                            setExpediteurNom(item.expediteur_nom || '');
                            setExpediteurTel(item.expediteur_tel || '');
                            setIsManualSender(!item.expediteur_id);
                            setModalVisible(true);
                        }} style={styles.actionBtn}>
                            <Ionicons name="pencil" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                    )}
                    {canDelete && (
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                            <Ionicons name="trash" size={18} color={Colors.error} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.count}>{colis.length} Colis</Text>
                </View>
                {canCreate && (
                    <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
                        <Ionicons name="add" size={24} color="#FFF" />
                        <Text style={styles.addBtnText}>Nouveau Colis</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? <ActivityIndicator size="large" color={Colors.secondary} style={{ marginTop: 50 }} /> :
                <FlatList
                    data={colis}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    onRefresh={fetchData}
                    refreshing={refreshing}
                />}

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editColis ? 'Modifier' : 'Nouveau'} Colis</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={28} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.form}>
                        {editColis && editColis.statut !== 'en_attente' && (
                            <View style={styles.lockBanner}>
                                <Ionicons name="lock-closed" size={14} color="#854d0e" />
                                <Text style={styles.lockText}>Informations de transport verrouillées (colis en cours)</Text>
                            </View>
                        )}

                        <Text style={styles.label}>Destinataire (Nom)</Text>
                        <TextInput style={styles.input} value={destNom} onChangeText={setDestNom} />

                        <Text style={styles.label}>Destinataire (Tel)</Text>
                        <TextInput
                            style={[styles.input, editColis && editColis.statut !== 'en_attente' && styles.disabledInput]}
                            value={destTel}
                            onChangeText={setDestTel}
                            keyboardType="phone-pad"
                            editable={!editColis || editColis.statut === 'en_attente'}
                        />

                        <Text style={styles.label}>Prix (CFA)</Text>
                        <TextInput
                            style={[styles.input, editColis && editColis.statut !== 'en_attente' && styles.disabledInput]}
                            value={prix}
                            onChangeText={setPrix}
                            keyboardType="numeric"
                            editable={!editColis || editColis.statut === 'en_attente'}
                        />

                        <Text style={styles.label}>Station Départ</Text>
                        <View style={[styles.pickerContainer, editColis && editColis.statut !== 'en_attente' && styles.disabledInput]}>
                            <Picker
                                selectedValue={startStation}
                                onValueChange={setStartStation}
                                enabled={!editColis || editColis.statut === 'en_attente'}
                            >
                                <Picker.Item label="Sélectionner..." value="" />
                                {stations.map(s => <Picker.Item key={s.id} label={s.nom || s.name} value={s.id.toString()} />)}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Station Arrivée</Text>
                        <View style={[styles.pickerContainer, editColis && editColis.statut !== 'en_attente' && styles.disabledInput]}>
                            <Picker
                                selectedValue={endStation}
                                onValueChange={setEndStation}
                                enabled={!editColis || editColis.statut === 'en_attente'}
                            >
                                <Picker.Item label="Sélectionner..." value="" />
                                {stations.map(s => <Picker.Item key={s.id} label={s.nom || s.name} value={s.id.toString()} />)}
                            </Picker>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={[styles.label, { marginBottom: 0 }]}>Expéditeur</Text>
                            <TouchableOpacity onPress={() => setIsManualSender(!isManualSender)}>
                                <Text style={{ color: Colors.secondary, fontSize: 12, fontFamily: 'Poppins_600SemiBold' }}>
                                    {isManualSender ? 'Sélectionner Client' : 'Saisie Manuelle'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {isManualSender ? (
                            <View>
                                <TextInput
                                    style={[styles.input, { marginBottom: 10 }]}
                                    placeholder="Nom de l'expéditeur"
                                    value={expediteurNom}
                                    onChangeText={setExpediteurNom}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Téléphone de l'expéditeur"
                                    value={expediteurTel}
                                    onChangeText={setExpediteurTel}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        ) : (
                            <View style={[styles.pickerContainer, editColis && editColis.statut !== 'en_attente' && styles.disabledInput]}>
                                <Picker
                                    selectedValue={expediteurId}
                                    onValueChange={setExpediteurId}
                                    enabled={!editColis || editColis.statut === 'en_attente'}
                                >
                                    <Picker.Item label="Sélectionner un client..." value="" />
                                    {clients.map(c => <Picker.Item key={c.id} label={c.nom} value={c.id.toString()} />)}
                                </Picker>
                            </View>
                        )}

                        <Text style={styles.label}>Statut</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={statut} onValueChange={setStatut}>
                                <Picker.Item label="En attente" value="en_attente" />
                                <Picker.Item label="En cours" value="en_cours" />
                                <Picker.Item label="Arrivé" value="arrive" />
                                <Picker.Item label="Livré" value="livre" />
                                {(!editColis || editColis.statut === 'en_attente' || editColis.statut === 'annule') && (
                                    <Picker.Item label="Annulé" value="annule" />
                                )}
                            </Picker>
                        </View>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveText}>Enregistrer</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 15,
        backgroundColor: Colors.surface
    },
    count: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.textLight },
    addBtn: { backgroundColor: Colors.secondary, flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10 },
    addBtnText: { color: '#FFF', marginLeft: 5, fontFamily: 'Poppins_600SemiBold' },
    list: { padding: 15 },
    card: { backgroundColor: Colors.surface, borderRadius: 15, padding: 16, marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    destName: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    subtext: { fontSize: 13, color: Colors.textLight, fontFamily: 'Poppins_400Regular' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontFamily: 'Poppins_700Bold' },
    route: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 12 },
    routeText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
    price: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.secondary, marginTop: 5 },
    hoursRow: { flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' },
    hourItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15, backgroundColor: Colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    hourText: { fontSize: 11, color: Colors.textLight, marginLeft: 4, fontFamily: 'Poppins_500Medium' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    expediteur: { fontSize: 12, color: Colors.textLight, fontFamily: 'Poppins_500Medium' },
    actions: { flexDirection: 'row', alignItems: 'center' },
    actionBtn: { padding: 8, marginLeft: 5 },
    quickBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        marginRight: 10
    },
    quickBtnText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', marginRight: 4 },
    modalBg: {
        flex: 1,
        backgroundColor: Colors.surface,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24)
    },
    disabledInput: { opacity: 0.5, backgroundColor: '#F3F4F6' },
    lockBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF9C3',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#FEF08A'
    },
    lockText: {
        fontSize: 11,
        color: '#854d0e',
        fontFamily: 'Poppins_500Medium',
        marginLeft: 6,
        flex: 1
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
    modalTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    form: { padding: 20 },
    label: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.textLight, marginBottom: 8 },
    input: { backgroundColor: Colors.background, borderRadius: 12, padding: 15, marginBottom: 15, fontFamily: 'Poppins_400Regular' },
    pickerContainer: { backgroundColor: Colors.background, borderRadius: 12, marginBottom: 15, overflow: 'hidden' },
    saveBtn: { backgroundColor: Colors.secondary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 50 },
    saveText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_700Bold' }
});

export default AdminColisScreen;
