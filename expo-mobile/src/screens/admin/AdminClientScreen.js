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
import { exportToCsv } from '../../utils/export';

const AdminClientScreen = ({ navigation }) => {
    const { hasPermission } = useAuth();
    const canCreate = hasPermission('client_create');
    const canEdit = hasPermission('client_edit');
    const canDelete = hasPermission('client_delete');
    const canExport = hasPermission('export_csv');

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editClient, setEditClient] = useState(null);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toastRef, showToast } = useToast();

    const [nom, setNom] = useState('');
    const [telephone, setTelephone] = useState('+229');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('PlusVoyageNonvi1202@');

    const fetchClients = async (search = searchQuery) => {
        setErrorMsg('');
        try {
            const params = search ? { search } : {};
            const response = await client.get('/admin/clients', { params });
            const data = response.data.data || response.data;
            const list = Array.isArray(data) ? data : [];
            setClients(list);
            setTotal(response.data.total || list.length);
        } catch (e) {
            const msg = e.response?.data?.message || e.message || 'Erreur réseau';
            setErrorMsg(`Chargement échoué: ${msg}`);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchClients(searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const resetForm = () => {
        setNom('');
        setTelephone('+229');
        setEmail('');
        setPassword('PlusVoyageNonvi1202@');
        setEditClient(null);
        setShowPassword(false);
    };

    const handleSave = async () => {
        if (!nom.trim() || !telephone.trim()) {
            Alert.alert('Champs manquants', 'Nom et téléphone sont obligatoires');
            return;
        }

        setSaving(true);
        const data = {
            nom: nom.trim(),
            telephone: telephone.trim(),
            email: email.trim().toLowerCase() || null,
            password: password,
        };

        try {
            if (editClient) {
                await client.put(`/admin/clients/${editClient.id}`, data);
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
                        await client.delete(`/admin/clients/${id}`);
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
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(item.name || item.nom || '?').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.details}>
                    <Text style={styles.userName}>{item.name || item.nom}</Text>
                    <Text style={styles.userEmail}>{item.tel || item.telephone || 'Pas de tel'}</Text>
                    <Text style={styles.userSubtext}>{item.email || 'Pas d\'email'}</Text>
                    <View style={styles.pointsBadge}>
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
                            setNom(item.name || item.nom || '');
                            setTelephone(item.tel || item.telephone || '+229');
                            setEmail(item.email || '');
                            setPassword('');
                            setModalVisible(true);
                            setShowPassword(false);
                        }} style={styles.actionIcon}>
                            <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                    )}
                    {canDelete && (
                        <TouchableOpacity onPress={() => handleDelete(item.id, item.name || item.nom)} style={styles.actionIcon}>
                            <Ionicons name="trash-outline" size={20} color={Colors.error} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
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
                {!showSearch ? (
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
                                <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.count}>{total} Client(s)</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => setShowSearch(true)}
                                style={{ marginRight: 15 }}
                            >
                                <Ionicons name="search" size={24} color={Colors.textLight} />
                            </TouchableOpacity>
                            {canExport && (
                                <TouchableOpacity
                                    onPress={() => exportToCsv('admin/clients-export', 'clients')}
                                    style={{ marginRight: 15 }}
                                >
                                    <Ionicons name="download-outline" size={24} color={Colors.secondary} />
                                </TouchableOpacity>
                            )}
                            {canCreate && (
                                <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
                                    <Ionicons name="add" size={22} color="#FFF" />
                                    <Text style={styles.addBtnText}>Créer</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                ) : (
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={Colors.textLight} style={{ marginRight: 10 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher..."
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

            {loading && clients.length === 0 ? (
                <View style={styles.center}><ActivityIndicator size="large" color={Colors.secondary} /></View>
            ) : (
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
            )}

            <Modal visible={modalVisible} transparent animationType="fade">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editClient ? 'Modifier Client' : 'Nouveau Client'}</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Nom complet *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nom complet"
                                placeholderTextColor={Colors.textLight}
                                value={nom}
                                onChangeText={setNom}
                            />

                            <Text style={styles.label}>Téléphone *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Téléphone"
                                placeholderTextColor={Colors.textLight}
                                value={telephone}
                                onChangeText={setTelephone}
                                keyboardType="phone-pad"
                            />

                            <Text style={styles.label}>Email (optionnel)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor={Colors.textLight}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Text style={styles.label}>Mot de passe {editClient && '(laisser vide pour ne pas changer)'}</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Mot de passe"
                                    placeholderTextColor={Colors.textLight}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textLight} />
                                </TouchableOpacity>
                            </View>

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
                        </ScrollView>
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
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { fontSize: 18, color: Colors.primary, fontFamily: 'Poppins_700Bold' },
    details: { flex: 1 },
    userName: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
    userEmail: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textLight },
    userSubtext: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textLight, marginTop: 1 },
    pointsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.secondary + '15', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6, gap: 4 },
    pointsText: { fontSize: 10, fontFamily: 'Poppins_700Bold', color: Colors.secondary },
    actions: { flexDirection: 'row' },
    actionIcon: { padding: 8, marginLeft: 4 },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 15, color: Colors.textLight, marginTop: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: Colors.surface, borderRadius: 24, padding: 24, maxHeight: '90%' },
    modalTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.primary, marginBottom: 20 },
    label: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.textLight, marginBottom: 6 },
    input: { backgroundColor: Colors.background, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 14, color: Colors.primary, borderWidth: 1, borderColor: Colors.border, fontFamily: 'Poppins_400Regular' },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
    passwordInput: { flex: 1, padding: 14, fontFamily: 'Poppins_400Regular', color: Colors.primary, fontSize: 14 },
    eyeIcon: { paddingHorizontal: 15 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    cancelBtn: { marginRight: 16, padding: 12 },
    cancelText: { color: Colors.textLight, fontFamily: 'Poppins_600SemiBold' },
    saveBtn: { backgroundColor: Colors.secondary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, minWidth: 110, alignItems: 'center' },
    saveText: { color: '#FFF', fontFamily: 'Poppins_700Bold' },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 12, height: 45 },
    searchInput: { flex: 1, height: '100%', fontFamily: 'Poppins_400Regular', fontSize: 14, color: Colors.primary },
});

export default AdminClientScreen;
