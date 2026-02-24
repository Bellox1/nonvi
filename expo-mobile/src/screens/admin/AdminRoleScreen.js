import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, SectionList, TouchableOpacity,
    ActivityIndicator, Alert, Modal, TextInput,
    KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import Toast, { useToast } from '../../components/Toast';

// Human-readable labels for each permission slug
const PERM_LABELS = {
    user_management_access: 'Gestion des Utilisateurs',
    user_create: 'Créer un utilisateur',
    user_edit: 'Modifier un utilisateur',
    user_show: 'Détails des utilisateurs',
    user_delete: 'Supprimer un utilisateur',
    user_access: 'Accès Module Utilisateurs',
    role_create: 'Créer un rôle',
    role_edit: 'Modifier un rôle',
    role_show: 'Détails des rôles',
    role_delete: 'Supprimer un rôle',
    role_access: 'Accès Module Rôles',
    permission_create: 'Créer une permission',
    permission_edit: 'Modifier une permission',
    permission_show: 'Détails des permissions',
    permission_delete: 'Supprimer une permission',
    permission_access: 'Accès Module Permissions',
    client_create: 'Créer un client',
    client_edit: 'Modifier un client',
    client_show: 'Détails des clients',
    client_delete: 'Supprimer un client',
    client_access: 'Accès Module Clients',
    station_create: 'Créer une station',
    station_edit: 'Modifier une station',
    station_show: 'Détails des stations',
    station_delete: 'Supprimer une station',
    station_access: 'Accès Module Stations',
    produit_create: 'Créer un produit',
    produit_edit: 'Modifier un produit',
    produit_show: 'Détails des produits',
    produit_delete: 'Supprimer un produit',
    produit_access: 'Accès Module Produits',
    reservation_create: 'Créer une réservation',
    reservation_edit: 'Modifier une réservation',
    reservation_show: 'Détails des réservations (Lecture)',
    reservation_delete: 'Supprimer une réservation',
    reservation_access: 'Accès Module Réservations',
    coli_create: 'Créer un colis',
    coli_edit: 'Modifier un colis',
    coli_show: 'Détails des colis',
    coli_delete: 'Supprimer un colis',
    coli_access: 'Accès Module Colis',
    audit_log_show: 'Détails techniques (IP, JSON)',
    audit_log_access: 'Accès Module Logs d\'Audit',
    profile_password_edit: 'Modifier mot de passe',
    pub_create: 'Créer une pub',
    pub_edit: 'Modifier une pub',
    pub_show: 'Détails des pubs',
    pub_delete: 'Supprimer une pub',
    pub_access: 'Accès Module Publicités',
    setting_access: 'Accès Module Paramètres/Tarifs',
    setting_edit: 'Modifier les Tarifs',
    revenue_show: 'Voir les revenus (Dashboard)',
    dashboard_access: 'Accès au Tableau de Bord',
    commande_create: 'Créer une commande',
    commande_edit: 'Modifier une commande',
    commande_show: 'Détails des commandes',
    commande_delete: 'Supprimer une commande',
    commande_access: 'Accès Module Commandes',
};

const getLabel = (slug) =>
    PERM_LABELS[slug] || slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// Module display names (order matters for display)
const MODULE_ORDER = [
    { key: 'dashboard', label: 'Accès Principal' },
    { key: 'user_management', label: 'Gestion Utilisateurs' },
    { key: 'user', label: 'Utilisateurs' },
    { key: 'role', label: 'Rôles' },
    { key: 'permission', label: 'Permissions' },
    { key: 'client', label: 'Clients' },
    { key: 'station', label: 'Stations' },
    { key: 'produit', label: 'Produits' },
    { key: 'commande', label: 'Commandes' },
    { key: 'reservation', label: 'Réservations' },
    { key: 'coli', label: 'Colis' },
    { key: 'audit_log', label: 'Logs d\'Audit' },
    { key: 'pub', label: 'Publicités' },
    { key: 'setting', label: 'Tarifs' },
    { key: 'revenue', label: 'Revenus' },
    { key: 'profile', label: 'Profil' },
];

// Build SectionList sections from flat permissions array
const buildSections = (permissions) => {
    const map = {};
    permissions.forEach(p => {
        // Find the longest matching module key
        const mod = MODULE_ORDER.find(m => p.title.startsWith(m.key + '_') || p.title === m.key);
        const key = mod ? mod.key : 'other';
        const label = mod ? mod.label : 'Autres';
        if (!map[key]) map[key] = { title: label, key, data: [] };
        map[key].data.push(p);
    });
    // Return in defined order
    return [
        ...MODULE_ORDER.filter(m => map[m.key]).map(m => map[m.key]),
        ...(map['other'] ? [map['other']] : []),
    ];
};

import { useAuth } from '../../context/AuthContext';

const AdminRoleScreen = ({ navigation }) => {
    const { hasPermission, refreshUser } = useAuth();
    const canCreate = hasPermission('role_create');
    const canShow = hasPermission('role_show');
    const canEdit = hasPermission('role_edit');
    const canDelete = hasPermission('role_delete');

    const [sections, setSections] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editRole, setEditRole] = useState(null);
    const [saving, setSaving] = useState(false);
    const { toastRef, showToast } = useToast();

    const [title, setTitle] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch roles (always if they have role_access)
            const rolesRes = await client.get('/admin/roles');
            setRoles(rolesRes.data);

            // Fetch permissions ONLY if they have the specific permission
            if (hasPermission('permission_access')) {
                try {
                    const permsRes = await client.get('/admin/permissions');
                    const perms = permsRes.data;
                    setPermissions(perms);
                    setSections(buildSections(perms));
                } catch (err) {
                    console.log('Permissions load failed - likely no permission_access');
                }
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Erreur', 'Impossible de charger les rôles');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const togglePermission = (id) => {
        setSelectedPermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const toggleSection = (sectionData) => {
        const ids = sectionData.map(p => p.id);
        const allSelected = ids.every(id => selectedPermissions.includes(id));
        setSelectedPermissions(prev =>
            allSelected
                ? prev.filter(id => !ids.includes(id))
                : [...new Set([...prev, ...ids])]
        );
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Champ requis', 'Le titre du rôle est obligatoire');
            return;
        }

        setSaving(true);
        try {
            const data = { title: title.trim(), permissions: selectedPermissions };
            if (editRole) {
                await client.put(`/admin/roles/${editRole.id}`, data);
            } else {
                await client.post('/admin/roles', data);
            }

            // Refresh user to catch permission changes for the current account
            const freshUser = await refreshUser();
            const stillHasDashboardAccess = freshUser?.roles?.some(role =>
                role.permissions?.some(p => p.title === 'dashboard_access')
            );

            if (!stillHasDashboardAccess) {
                setModalVisible(false);
                resetForm();
                Alert.alert('Accès révoqué', 'Vos droits d\'accès ont été modifiés. Vous allez être redirigé.');
                navigation.navigate('MainTabs', { screen: 'Home' });
                return;
            }

            await fetchData();
            setModalVisible(false);
            resetForm();
            Alert.alert('Succès', editRole ? 'Rôle modifié' : 'Rôle créé');
        } catch (e) {
            if (e.response?.status === 403) {
                Alert.alert('Accès refusé', 'Vos droits ne vous permettent plus d\'effectuer cette action.');
                navigation.navigate('MainTabs', { screen: 'Home' });
            } else {
                Alert.alert('Erreur', e.response?.data?.message || 'Echec de l\'enregistrement');
            }
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        const dashPerm = permissions.find(p => p.title === 'dashboard_access');
        setSelectedPermissions(dashPerm ? [dashPerm.id] : []);
        setEditRole(null);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                if (canShow || canEdit) {
                    setEditRole(item);
                    setTitle(item.title);
                    setSelectedPermissions(item.permissions?.map(p => p.id) || []);
                    setModalVisible(true);
                }
            }}
            activeOpacity={(canShow || canEdit) ? 0.7 : 1}
        >
            <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>{item.title}</Text>
                <Text style={styles.permsCount}>
                    {item.permissions?.length || 0} permission{item.permissions?.length !== 1 ? 's' : ''}
                </Text>
            </View>
            <View style={styles.actions}>
                {canEdit && (
                    <TouchableOpacity onPress={() => {
                        setEditRole(item);
                        setTitle(item.title);
                        setSelectedPermissions(item.permissions?.map(p => p.id) || []);
                        setModalVisible(true);
                    }} style={styles.actionBtn}>
                        <Ionicons name="pencil" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                )}
                {canDelete && item.id !== 1 && (
                    <TouchableOpacity onPress={() => {
                        Alert.alert('Supprimer', `Supprimer le rôle "${item.title}" ?`, [
                            { text: 'Annuler', style: 'cancel' },
                            {
                                text: 'Supprimer', style: 'destructive',
                                onPress: async () => {
                                    try {
                                        await client.delete(`/admin/roles/${item.id}`);
                                        fetchData();
                                        Alert.alert('Succès', 'Rôle supprimé');
                                    } catch (e) {
                                        Alert.alert('Erreur', 'Suppression échouée');
                                    }
                                }
                            }
                        ]);
                    }} style={styles.actionBtn}>
                        <Ionicons name="trash" size={20} color={Colors.error} />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <Toast ref={toastRef} />

            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.count}>{roles.length} Rôle(s)</Text>
                </View>
                {canCreate && (
                    <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
                        <Ionicons name="add" size={24} color="#FFF" />
                        <Text style={styles.addBtnText}>Nouveau</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading
                ? <ActivityIndicator size="large" color={Colors.secondary} style={{ marginTop: 50 }} />
                : <FlatList
                    data={roles}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    onRefresh={fetchData}
                    refreshing={refreshing}
                />
            }

            <Modal visible={modalVisible} animationType="slide">
                <KeyboardAvoidingView
                    behavior="padding"
                    style={styles.modalBg}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {canEdit ? (editRole ? 'Modifier' : 'Nouveau') : 'Détails du'} Rôle
                        </Text>
                        <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                            <Ionicons name="close" size={28} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formContent}>
                        <TextInput
                            style={[styles.input, !canEdit && { backgroundColor: '#F0F0F0', color: Colors.textLight }]}
                            placeholder="Titre du rôle"
                            placeholderTextColor={Colors.textLight}
                            value={title}
                            onChangeText={setTitle}
                            editable={canEdit}
                        />

                        <Text style={styles.sectionLabel}>
                            Permissions ({selectedPermissions.length} sélectionnée{selectedPermissions.length !== 1 ? 's' : ''})
                        </Text>

                        <SectionList
                            sections={sections}
                            keyExtractor={p => p.id.toString()}
                            stickySectionHeadersEnabled={false}
                            renderSectionHeader={({ section }) => {
                                const ids = section.data.map(p => p.id);
                                const selectedCount = ids.filter(id => selectedPermissions.includes(id)).length;
                                const allSelected = selectedCount === ids.length;
                                return (
                                    <TouchableOpacity
                                        style={styles.groupHeader}
                                        onPress={() => canEdit && toggleSection(section.data)}
                                        activeOpacity={canEdit ? 0.7 : 1}
                                    >
                                        <Ionicons
                                            name={allSelected ? 'checkbox' : selectedCount > 0 ? 'checkbox-outline' : 'square-outline'}
                                            size={18}
                                            color={selectedCount > 0 ? Colors.secondary : Colors.textLight}
                                        />
                                        <Text style={styles.groupTitle}>{section.title}</Text>
                                        <Text style={styles.groupCount}>{selectedCount}/{ids.length}</Text>
                                    </TouchableOpacity>
                                );
                            }}
                            renderItem={({ item }) => {
                                const isSelected = selectedPermissions.includes(item.id);
                                return (
                                    <TouchableOpacity
                                        style={[styles.permItem, isSelected && styles.permSelected]}
                                        onPress={() => canEdit && togglePermission(item.id)}
                                        activeOpacity={canEdit ? 0.7 : 1}
                                    >
                                        <Ionicons
                                            name={isSelected ? 'checkbox' : 'square-outline'}
                                            size={18}
                                            color={isSelected ? Colors.secondary : Colors.textLight}
                                        />
                                        <View style={styles.permTexts}>
                                            <Text style={[styles.permLabel, isSelected && styles.permLabelSelected]}>
                                                {getLabel(item.title)}
                                            </Text>
                                            <Text style={styles.permSlug}>{item.title}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                            contentContainerStyle={{ paddingBottom: 10 }}
                        />

                        {canEdit && (
                            <TouchableOpacity
                                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving
                                    ? <ActivityIndicator color="#FFF" />
                                    : <Text style={styles.saveText}>Enregistrer</Text>
                                }
                            </TouchableOpacity>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 15,
        backgroundColor: Colors.surface, elevation: 2,
    },
    count: { fontSize: 16, color: Colors.textLight, fontWeight: '600' },
    addBtn: {
        backgroundColor: Colors.secondary, flexDirection: 'row', alignItems: 'center',
        padding: 10, borderRadius: 10,
    },
    addBtnText: { color: '#FFF', marginLeft: 5, fontWeight: '600' },
    list: { padding: 15 },
    card: {
        backgroundColor: Colors.surface, borderRadius: 15, padding: 16,
        marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        elevation: 2,
    },
    roleInfo: { flex: 1, alignItems: 'flex-start' },
    roleTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
    permsCount: { fontSize: 13, color: Colors.textLight, marginTop: 3 },
    actions: { flexDirection: 'row' },
    actionBtn: { padding: 10, marginLeft: 5 },
    // Modal
    modalBg: {
        flex: 1,
        backgroundColor: Colors.surface,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24)
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
    formContent: { flex: 1, paddingTop: 20 },
    input: {
        backgroundColor: Colors.background, borderRadius: 10, padding: 15,
        marginHorizontal: 20, marginBottom: 20, fontSize: 15, color: Colors.primary,
    },
    sectionLabel: { fontSize: 15, fontWeight: 'bold', color: Colors.primary, marginBottom: 12, marginHorizontal: 20 },
    // Group header
    groupHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 10,
        backgroundColor: Colors.background,
        borderTopWidth: 1, borderTopColor: Colors.border,
        marginTop: 6,
    },
    groupTitle: { flex: 1, marginLeft: 10, fontSize: 13, fontWeight: 'bold', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
    groupCount: { fontSize: 12, color: Colors.textLight },
    // Permissions list
    permItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingLeft: 40, paddingRight: 20, paddingVertical: 10,
        borderTopWidth: 1, borderTopColor: Colors.border + '80',
    },
    permSelected: { backgroundColor: Colors.secondary + '08' },
    permTexts: { flex: 1, marginLeft: 10 },
    permLabel: { fontSize: 14, color: Colors.text },
    permLabelSelected: { color: Colors.secondary, fontWeight: '600' },
    permSlug: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
    // Save
    saveBtn: {
        backgroundColor: Colors.secondary, padding: 18,
        borderRadius: 12, alignItems: 'center', marginTop: 16,
        marginHorizontal: 20, marginBottom: 20,
    },
    saveText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default AdminRoleScreen;
