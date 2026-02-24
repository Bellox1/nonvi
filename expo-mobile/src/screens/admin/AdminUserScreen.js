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
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { exportToCsv } from '../../utils/export';

const AdminUserScreen = ({ navigation }) => {
    const { hasPermission, refreshUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterType, setFilterType] = useState('all'); // all, membre, client
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Permissions
    const canCreate = hasPermission('user_create');
    const canEdit = hasPermission('user_edit');
    const canDelete = hasPermission('user_delete');
    const canExport = hasPermission('export_csv');

    const [editingUser, setEditingUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tel, setTel] = useState('');
    const [roleId, setRoleId] = useState('');

    const fetchUsers = async (type = filterType, search = searchQuery) => {
        try {
            setLoading(true);
            let params = {};
            if (type !== 'all') params.type = type;
            if (search) params.search = search;

            const response = await client.get('/admin/users', { params });
            const data = response.data.data || response.data;
            setUsers(Array.isArray(data) ? data : []);
            setTotal(response.data.total || (Array.isArray(data) ? data.length : 0));
        } catch (e) {
            Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await client.get('/admin/roles');
            setRoles(res.data);
            if (res.data.length > 0 && !roleId) {
                const userRole = res.data.find(r => r.id === 2 || r.title.toLowerCase().includes('user'));
                setRoleId(userRole ? userRole.id.toString() : res.data[0].id.toString());
            }
        } catch (e) {
            console.error('Error fetching roles:', e);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers(filterType, searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, filterType]);

    const handleSave = async () => {
        if (!name || !tel || (!editingUser && !password)) {
            Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (Nom, Tel, Password)');
            return;
        }

        try {
            const payload = { name, email, tel, role_id: roleId };
            if (password) payload.password = password;

            if (editingUser) {
                if (!canEdit) return;
                await client.put(`/admin/users/${editingUser.id}`, payload);
            } else {
                if (!canCreate) return;
                await client.post('/admin/users', payload);
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

            setModalVisible(false);
            resetForm();
            await fetchUsers();
            Alert.alert('Succès', editingUser ? 'Utilisateur mis à jour' : 'Utilisateur créé');
        } catch (e) {
            if (e.response?.status === 403) {
                Alert.alert('Accès refusé', 'Vos droits ne vous permettent plus d\'effectuer cette action.');
                navigation.navigate('MainTabs', { screen: 'Home' });
            } else if (e.response?.status === 422) {
                const errors = e.response?.data?.errors;
                let message = 'Veuillez vérifier les informations.';
                if (errors) {
                    const firstErrorField = Object.keys(errors)[0];
                    message = errors[firstErrorField][0];
                }
                Alert.alert('Validation', message);
            } else {
                Alert.alert('Erreur', e.response?.data?.message || 'Une erreur est survenue');
            }
        }
    };

    const deleteUser = (id) => {
        if (id === 1) return;
        if (!canDelete) return;

        Alert.alert(
            'Confirmation',
            'Voulez-vous vraiment supprimer cet utilisateur ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.delete(`/admin/users/${id}`);
                            fetchUsers();
                        } catch (e) {
                            Alert.alert('Erreur', 'Suppression échouée');
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setEditingUser(null);
        setName('');
        setEmail('');
        setTel('+229');
        setPassword('PlusVoyageNonvi1202@');
        if (roles.length > 0) {
            const userRole = roles.find(r => r.id === 2 || r.title.toLowerCase().includes('user'));
            setRoleId(userRole ? userRole.id.toString() : roles[0].id.toString());
        }
        setShowPassword(false);
    };

    const startEdit = (user) => {
        if (!canEdit) return;
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email || '');
        setTel(user.tel || '');
        setPassword('');
        setRoleId(user.roles?.[0]?.id.toString() || '2');
        setModalVisible(true);
        setShowPassword(false);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.details}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.unique_id ? `ID: ${item.unique_id} • ` : ''}{item.tel || 'Pas de tel'}</Text>
                    <Text style={styles.userEmail}>{item.email || 'Pas d\'email'}</Text>
                    <View style={styles.roleRow}>
                        {item.roles && item.roles.length > 0 ? (
                            item.roles.map(role => (
                                <View key={role.id} style={styles.roleBadge}>
                                    <Text style={styles.roleText}>{role.title}</Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.pointsBadge}>
                                <Ionicons name="star" size={10} color={Colors.secondary} />
                                <Text style={styles.pointsText}>{item.points || 0} pts</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            {(canEdit || canDelete) && item.roles?.length > 0 && (
                <View style={styles.actions}>
                    {canEdit && (
                        <TouchableOpacity onPress={() => startEdit(item)} style={styles.actionIcon}>
                            <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                    )}
                    {canDelete && item.id !== 1 && (
                        <TouchableOpacity onPress={() => deleteUser(item.id)} style={styles.actionIcon}>
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

            <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.surface }}>
                <View style={styles.headerSection}>
                    <View style={styles.header}>
                    {!showSearch ? (
                        <>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                                </TouchableOpacity>
                                <Text style={styles.countText} numberOfLines={1}>{total} {filterType === 'client' ? 'clients' : filterType === 'membre' ? 'membres' : 'utilisateurs'}</Text>
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
                                        onPress={() => exportToCsv('admin/users-export', 'users')}
                                        style={{ marginRight: 15 }}
                                    >
                                        <Ionicons name="download-outline" size={24} color={Colors.secondary} />
                                    </TouchableOpacity>
                                )}
                                {canCreate && (
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => {
                                            resetForm();
                                            setModalVisible(true);
                                        }}
                                    >
                                        <Ionicons name="add" size={20} color="#FFF" />
                                        <Text style={styles.addButtonText}>Créer</Text>
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

                    <View style={styles.filterWrapper}>
                        <View style={styles.filterGroup}>
                            <TouchableOpacity
                                style={[styles.filterTab, filterType === 'all' && styles.filterTabActive]}
                                onPress={() => setFilterType('all')}
                            >
                                <Text style={[styles.filterTabText, filterType === 'all' && styles.filterTabTextActive]}>Tous</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterTab, filterType === 'membre' && styles.filterTabActive]}
                                onPress={() => setFilterType('membre')}
                            >
                                <Text style={[styles.filterTabText, filterType === 'membre' && styles.filterTabTextActive]}>Membres</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterTab, filterType === 'client' && styles.filterTabActive]}
                                onPress={() => setFilterType('client')}
                            >
                                <Text style={[styles.filterTabText, filterType === 'client' && styles.filterTabTextActive]}>Clients</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            {loading && users.length === 0 ? (
                <View style={styles.center}><ActivityIndicator size="large" color={Colors.secondary} /></View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    onRefresh={fetchUsers}
                    refreshing={refreshing}
                    ListEmptyComponent={<Text style={styles.empty}>Aucun compte</Text>}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Nom complet</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Nom complet"
                            />

                            <Text style={styles.label}>Email (optionnel)</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Text style={styles.label}>Mot de passe {editingUser && '(laisser vide pour ne pas changer)'}</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="8 caractères min."
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textLight} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Téléphone *</Text>
                            <TextInput
                                style={styles.input}
                                value={tel}
                                onChangeText={setTel}
                                placeholder="Téléphone"
                                keyboardType="phone-pad"
                            />

                            <Text style={styles.label}>Rôle</Text>
                            <View style={styles.roleSelector}>
                                {roles.map(role => (
                                    <TouchableOpacity
                                        key={role.id}
                                        style={[styles.roleSelectBtn, roleId === role.id.toString() && styles.roleActive]}
                                        onPress={() => setRoleId(role.id.toString())}
                                    >
                                        <Text style={[styles.roleSelectText, roleId === role.id.toString() && styles.roleActiveText]}>
                                            {role.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                {roles.length === 0 && (
                                    <ActivityIndicator size="small" color={Colors.secondary} />
                                )}
                            </View>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Enregistrer</Text>
                            </TouchableOpacity>
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
    headerSection: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
    },
    countText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.textLight },
    addButton: { backgroundColor: Colors.secondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    addButtonText: { color: Colors.surface, marginLeft: 4, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
    list: { padding: 16, paddingBottom: 100, flexGrow: 1 },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 1,
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
    roleRow: { flexDirection: 'row', marginTop: 4 },
    roleBadge: { backgroundColor: Colors.secondary + '10', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    roleText: { fontSize: 10, color: Colors.secondary, fontFamily: 'Poppins_600SemiBold' },
    pointsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.secondary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, gap: 4 },
    pointsText: { fontSize: 10, color: Colors.secondary, fontFamily: 'Poppins_700Bold' },
    actions: { flexDirection: 'row' },
    actionIcon: { padding: 8, marginLeft: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: Colors.surface, borderRadius: 24, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    form: {},
    label: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.textLight, marginBottom: 6 },
    input: { backgroundColor: Colors.background, borderRadius: 12, padding: 14, marginBottom: 16, fontFamily: 'Poppins_400Regular', color: Colors.text, borderWidth: 1, borderColor: Colors.border },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
    passwordInput: { flex: 1, padding: 14, fontFamily: 'Poppins_400Regular', color: Colors.text },
    eyeIcon: { paddingHorizontal: 15 },
    roleSelector: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
    roleSelectBtn: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', margin: 4, minWidth: '45%' },
    roleActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    roleSelectText: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 12 },
    roleActiveText: { color: '#FFF' },
    saveButton: { backgroundColor: Colors.secondary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    saveButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_700Bold' },
    filterWrapper: { paddingHorizontal: 20, paddingBottom: 15 },
    filterGroup: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: 4, padding: 2, borderWidth: 1, borderColor: Colors.border },
    filterTab: { flex: 1, paddingVertical: 5, alignItems: 'center', borderRadius: 2 },
    filterTabActive: { backgroundColor: Colors.surface, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
    filterTabText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: Colors.textLight },
    filterTabTextActive: { color: Colors.primary },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 12, height: 45 },
    searchInput: { flex: 1, height: '100%', fontFamily: 'Poppins_400Regular', fontSize: 14, color: Colors.primary },
});

export default AdminUserScreen;
