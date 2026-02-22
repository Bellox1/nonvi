import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, Modal, TextInput,
    KeyboardAvoidingView, ScrollView, Platform, StatusBar, RefreshControl
} from 'react-native';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import Toast, { useToast } from '../../components/Toast';

import { useAuth } from '../../context/AuthContext';

const AdminStationScreen = ({ navigation }) => {
    const { hasPermission } = useAuth();
    const canCreate = hasPermission('station_create');
    const canEdit = hasPermission('station_edit');
    const canDelete = hasPermission('station_delete');

    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editStation, setEditStation] = useState(null);
    const [nom, setNom] = useState('');
    const [ville, setville] = useState('');
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [existingCities, setExistingCities] = useState([]);
    const [isAddingNewCity, setIsAddingNewCity] = useState(false);
    const { toastRef, showToast } = useToast();

    const fetchStations = async () => {
        setErrorMsg('');
        try {
            const response = await client.get('/admin/stations');
            const list = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setStations(list);

            // Dynamically build city list
            const cities = [...new Set(list.map(s => s.ville).filter(v => v))].sort();
            setExistingCities(cities);
        } catch (e) {
            const msg = e.response?.data?.message || e.message || 'Erreur réseau';
            setErrorMsg(`Chargement échoué (${e.response?.status || '?'}): ${msg}`);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchStations();
    };

    useEffect(() => {
        fetchStations();
    }, []);

    const handleSave = async () => {
        if (!nom.trim()) {
            Alert.alert('Erreur', 'Le nom est obligatoire');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                nom: nom.trim(),
                ville: ville.trim() || null
            };

            if (editStation) {
                await client.put(`/admin/stations/${editStation.id}`, payload);
            } else {
                await client.post('/admin/stations', payload);
            }
            setModalVisible(false);
            resetForm();
            fetchStations();
            showToast(editStation ? 'Station modifiée avec succès' : 'Station créée avec succès');
        } catch (e) {
            let msg = 'Erreur inconnue';
            if (e.response?.data?.errors) {
                msg = Object.values(e.response.data.errors).flat().join('\n');
            } else if (e.response?.data?.message) {
                msg = e.response.data.message;
            }
            Alert.alert('Erreur', msg);
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setNom('');
        setville('');
        setEditStation(null);
        setIsAddingNewCity(false);
    };

    const handleDelete = (id, stationNom) => {
        Alert.alert('Confirmer', `Supprimer "${stationNom}" ?`, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete(`/admin/stations/${id}`);
                        fetchStations();
                        showToast('Station supprimée');
                    } catch (e) {
                        Alert.alert('Erreur', e.response?.data?.message || 'Suppression échouée');
                    }
                }
            }
        ]);
    };



    if (loading) return (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.secondary} /></View>
    );

    const groupedStations = existingCities.map(city => ({
        city,
        data: stations.filter(s => s.ville === city)
    })).filter(group => group.data.length > 0);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <Toast ref={toastRef} />

            {!!errorMsg && (
                <TouchableOpacity style={styles.errorBanner} onPress={fetchStations}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                    <Text style={styles.errorRetry}>Appuyer pour réessayer</Text>
                </TouchableOpacity>
            )}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.menuBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.welcomeText}>Administration</Text>
                    <Text style={styles.userName}>Stations</Text>
                </View>
                {canCreate && (
                    <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
                        <Ionicons name="add" size={24} color="#FFF" />
                        <Text style={styles.addBtnText}>Ajouter</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                style={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.secondary]} />
                }
            >
                {groupedStations.map((group, idx) => (
                    <View key={idx} style={styles.citySection}>
                        <View style={styles.cityHeader}>
                            <Ionicons name="business-outline" size={18} color={Colors.primary} />
                            <Text style={styles.cityHeaderText}>{group.city}</Text>
                            <View style={styles.cityBadge}>
                                <Text style={styles.cityBadgeText}>{group.data.length}</Text>
                            </View>
                        </View>
                        {group.data.map(station => (
                            <View key={station.id} style={styles.card}>
                                <View style={styles.info}>
                                    <View style={styles.iconBg}>
                                        <Ionicons name="location" size={22} color={Colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.stationNom}>{station.nom || station.name || '—'}</Text>
                                    </View>
                                </View>
                                {(canEdit || canDelete) && (
                                    <View style={styles.actions}>
                                        {canEdit && (
                                            <TouchableOpacity onPress={() => {
                                                setEditStation(station);
                                                setNom(station.nom || station.name || '');
                                                setville(station.ville || '');
                                                setModalVisible(true);
                                            }} style={styles.actionBtn}>
                                                <Ionicons name="pencil" size={20} color={Colors.primary} />
                                            </TouchableOpacity>
                                        )}
                                        {canDelete && (
                                            <TouchableOpacity onPress={() => handleDelete(station.id, station.nom || station.name)} style={styles.actionBtn}>
                                                <Ionicons name="trash" size={20} color={Colors.error} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                ))}

                {stations.length === 0 && !loading && (
                    <View style={styles.empty}>
                        <Ionicons name="location-outline" size={60} color={Colors.textLight} />
                        <Text style={styles.emptyText}>Aucune station</Text>
                        <Text style={styles.emptyHint}>Appuyez sur "Ajouter" pour créer une station</Text>
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            <Modal visible={modalVisible} transparent animationType="fade">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editStation ? 'Modifier Station' : 'Nouvelle Station'}</Text>

                        <Text style={styles.label}>Nom de la station *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nom de la station"
                            placeholderTextColor={Colors.textLight}
                            value={nom}
                            onChangeText={setNom}
                            autoFocus
                        />

                        <Text style={styles.label}>Ville *</Text>

                        {!isAddingNewCity ? (
                            <View style={styles.citiesGrid}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.citiesScroll}>
                                    {existingCities.map((city, idx) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={[styles.cityChip, ville === city && styles.cityChipSelected]}
                                            onPress={() => setville(city)}
                                        >
                                            <Text style={[styles.cityChipText, ville === city && styles.cityChipTextSelected]}>{city}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        style={styles.addCityChip}
                                        onPress={() => { setIsAddingNewCity(true); setville(''); }}
                                    >
                                        <Ionicons name="add" size={16} color={Colors.secondary} />
                                        <Text style={styles.addCityText}>Nouvelle ville</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                                {ville ? (
                                    <View style={styles.selectedView}>
                                        <Text style={styles.selectedLabel}>Sélectionné : <Text style={{ color: Colors.primary, fontWeight: '700' }}>{ville}</Text></Text>
                                    </View>
                                ) : null}
                            </View>
                        ) : (
                            <View>
                                <View style={styles.newCityInputRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                        placeholder="Nom de la nouvelle ville"
                                        placeholderTextColor={Colors.textLight}
                                        value={ville}
                                        onChangeText={setville}
                                    />
                                    <TouchableOpacity
                                        style={styles.backBtn}
                                        onPress={() => { setIsAddingNewCity(false); setville(''); }}
                                    >
                                        <Ionicons name="close-circle" size={24} color={Colors.error} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.hint}>Entrez le nom de la ville pour la créer</Text>
                            </View>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); resetForm(); }}>
                                <Text style={styles.cancelText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                                {saving
                                    ? <ActivityIndicator size="small" color="#FFF" />
                                    : <Text style={styles.saveText}>Enregistrer</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorBanner: { backgroundColor: '#FEE2E2', padding: 16, borderBottomWidth: 1, borderBottomColor: '#FCA5A5' },
    errorText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
    errorRetry: { color: '#DC2626', fontSize: 11, marginTop: 4 },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 15,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    menuBtn: {
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
    addBtn: { backgroundColor: Colors.secondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    addBtnText: { color: '#FFF', marginLeft: 5, fontWeight: '600' },
    list: { padding: 16, flexGrow: 1 },
    card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
    info: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconBg: { width: 42, height: 42, borderRadius: 10, backgroundColor: Colors.secondary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    stationNom: { fontSize: 15, fontWeight: 'bold', color: Colors.primary },
    ville: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
    actions: { flexDirection: 'row' },
    actionBtn: { padding: 10, marginLeft: 5 },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 16, color: Colors.textLight, marginTop: 15, fontWeight: '600' },
    emptyHint: { fontSize: 13, color: Colors.textLight, marginTop: 8, textAlign: 'center', paddingHorizontal: 30 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: Colors.surface, width: '88%', padding: 25, borderRadius: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginBottom: 20 },
    label: { fontSize: 11, fontWeight: '600', color: Colors.textLight, marginBottom: 6, textTransform: 'uppercase' },
    input: { backgroundColor: Colors.background, borderRadius: 10, padding: 15, marginBottom: 16, fontSize: 15, color: Colors.primary },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    cancelBtn: { marginRight: 16, padding: 12 },
    cancelText: { color: Colors.textLight, fontWeight: '600' },
    saveBtn: { backgroundColor: Colors.secondary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, minWidth: 110, alignItems: 'center' },
    saveText: { color: '#FFF', fontWeight: 'bold' },
    citiesGrid: { marginBottom: 20 },
    citiesScroll: { paddingVertical: 5 },
    cityChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: 10
    },
    cityChipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary
    },
    cityChipText: {
        fontSize: 13,
        color: Colors.text,
        fontWeight: '500'
    },
    cityChipTextSelected: {
        color: '#FFF'
    },
    addCityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.secondary,
        borderStyle: 'dashed'
    },
    addCityText: {
        fontSize: 13,
        color: Colors.secondary,
        fontWeight: '600',
        marginLeft: 4
    },
    newCityInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    backBtn: {
        marginLeft: 10
    },
    hint: {
        fontSize: 11,
        color: Colors.textLight,
        marginBottom: 20,
        marginLeft: 5
    },
    selectedView: {
        marginTop: 10,
        backgroundColor: Colors.background,
        padding: 8,
        borderRadius: 8,
    },
    selectedLabel: {
        fontSize: 12,
        color: Colors.textLight,
    },
    citySection: {
        marginBottom: 24,
    },
    cityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    cityHeaderText: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginLeft: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cityBadge: {
        backgroundColor: Colors.secondary + '20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 10,
    },
    cityBadgeText: {
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
        color: Colors.secondary,
    }
});

export default AdminStationScreen;
