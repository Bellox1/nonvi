import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, Modal, TextInput,
    KeyboardAvoidingView, ScrollView, Platform, StatusBar,
} from 'react-native';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import Toast, { useToast } from '../../components/Toast';

import { useAuth } from '../../context/AuthContext';

const AdminClientScreen = ({ navigation }) => {
    const { hasPermission } = useAuth();
    const canCreate = hasPermission('client_create');
    const canEdit = hasPermission('client_edit');
    const canDelete = hasPermission('client_delete');

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editClient, setEditClient] = useState(null);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const { toastRef, showToast } = useToast();

    const [nom, setNom] = useState('');
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');

    const fetchClients = async () => {
        setErrorMsg('');
        try {
            const response = await client.get('/admin/clients');
            const list = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setClients(list);
        } catch (e) {
            const msg = e.response?.data?.message || e.message || 'Erreur réseau';
            setErrorMsg(`Chargement échoué(${e.response?.status || '?'}): ${msg} `);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchClients(); }, []);

    const resetForm = () => {
        setNom(''); setTelephone(''); setEmail(''); setEditClient(null);
    };

    const handleSave = async () => {
        if (!nom.trim() || !telephone.trim() || !email.trim()) {
            Alert.alert('Champs manquants', 'Nom, téléphone et email sont obligatoires');
            return;
        }
        if (!/^\d+$/.test(telephone.trim())) {
            Alert.alert('Format invalide', 'Le téléphone doit contenir uniquement des chiffres');
            return;
        }

        setSaving(true);
        const data = {
            nom: nom.trim(),
            telephone: parseInt(telephone.trim()),
            email: email.trim().toLowerCase(),
        };

        try {
            if (editClient) {
                await client.put(`/ admin / clients / ${editClient.id} `, data);
            } else {
                await client.post('/admin/clients', data);
            }
            fetchClients();
            setModalVisible(false);
            resetForm();
            Alert.alert('Succès', editClient ? 'Client modifié avec succès' : 'Client créé avec succès');
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

    const handleDelete = (id, clientNom) => {
        Alert.alert('Confirmer', `Supprimer "${clientNom}" ? `, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete(`/ admin / clients / ${id} `);
                        fetchClients();
                        Alert.alert('Succès', 'Client supprimé');
                    } catch (e) {
                        Alert.alert('Erreur', e.response?.data?.message || 'Suppression échouée');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.info}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(item.nom || '?').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.details}>
                    <Text style={styles.name}>{item.nom}</Text>
                    <Text style={styles.subtext}>📞 {item.telephone}</Text>
                    <Text style={styles.subtext}>✉️ {item.email}</Text>
                    <View style={styles.pointsContainer}>
                        <Ionicons name="star" size={12} color={Colors.secondary} />
                        <Text style={styles.pointsText}>{item.points || 0} pts</Text>
                    </View>
                </View>
            </View>
            {(canEdit || canDelete) && (
                <View style={styles.actions}>
                    {canEdit && (
                        <TouchableOpacity onPress={() => {
                            setEditClient(item);
                            setNom(item.nom || '');
                            setTelephone(item.telephone?.toString() || '');
                            setEmail(item.email || '');
                            setModalVisible(true);
                        }} style={styles.actionBtn}>
                            <Ionicons name="pencil" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                    )}
                    {canDelete && (
                        <TouchableOpacity onPress={() => handleDelete(item.id, item.nom)} style={styles.actionBtn}>
                            <Ionicons name="trash" size={20} color={Colors.error} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    if (loading) return (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.secondary} /></View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <Toast ref={toastRef} />

            {!!errorMsg && (
                <TouchableOpacity style={styles.errorBanner} onPress={fetchClients}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                    <Text style={styles.errorRetry}>Appuyer pour réessayer</Text>
                </TouchableOpacity>
            )}

            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.count}>{clients.length} Client(s)</Text>
                </View>
                {canCreate && (
                    <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
                        <Ionicons name="add" size={24} color="#FFF" />
                        <Text style={styles.addBtnText}>Nouveau Client</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={clients}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                onRefresh={fetchClients}
                refreshing={refreshing}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="people-outline" size={60} color={Colors.textLight} />
                        <Text style={styles.emptyText}>Aucun client</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} transparent animationType="fade">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editClient ? 'Modifier Client' : 'Nouveau Client'}</Text>

                        <Text style={styles.label}>Nom complet *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nom complet"
                            placeholderTextColor={Colors.textLight}
                            value={nom}
                            onChangeText={setNom}
                            autoFocus
                        />

                        <Text style={styles.label}>Téléphone * (chiffres uniquement)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Téléphone"
                            placeholderTextColor={Colors.textLight}
                            value={telephone}
                            onChangeText={setTelephone}
                            keyboardType="number-pad"
                        />

                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={Colors.textLight}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 15,
        backgroundColor: Colors.surface,
        elevation: 2
    },
    count: { fontSize: 16, color: Colors.textLight, fontWeight: '600' },
    addBtn: { backgroundColor: Colors.secondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
    addBtnText: { color: '#FFF', marginLeft: 5, fontWeight: '600', fontSize: 13 },
    list: { padding: 16, flexGrow: 1 },
    card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
    info: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.secondary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    avatarText: { fontSize: 20, color: Colors.secondary, fontWeight: 'bold' },
    details: { flex: 1 },
    name: { fontSize: 15, fontWeight: 'bold', color: Colors.primary },
    subtext: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.secondary + '15',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: 6,
        gap: 4,
    },
    pointsText: {
        fontSize: 11,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.secondary,
    },
    actions: { flexDirection: 'row' },
    actionBtn: { padding: 10, marginLeft: 4 },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 15, color: Colors.textLight, marginTop: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: Colors.surface, width: '88%', padding: 25, borderRadius: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginBottom: 20 },
    label: { fontSize: 11, fontWeight: '600', color: Colors.textLight, marginBottom: 6, textTransform: 'uppercase' },
    input: { backgroundColor: Colors.background, borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 15, color: Colors.primary },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    cancelBtn: { marginRight: 16, padding: 12 },
    cancelText: { color: Colors.textLight, fontWeight: '600' },
    saveBtn: { backgroundColor: Colors.secondary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, minWidth: 110, alignItems: 'center' },
    saveText: { color: '#FFF', fontWeight: 'bold' }
});

export default AdminClientScreen;
