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
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';

const AdminUserScreen = ({ navigation }) => {
    const { hasPermission, refreshUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Permissions
    const canCreate = hasPermission('user_create');
    const canEdit = hasPermission('user_edit');
    const canDelete = hasPermission('user_delete');

    const [editingUser, setEditingUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState('2'); // Default to User

    const fetchUsers = async () => {
        try {
            const response = await client.get('/admin/users');
            setUsers(response.data.data);
        } catch (e) {
            Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSave = async () => {
        // ... previous implementation ...
        if (!name || !email || (!editingUser && !password)) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            const payload = { name, email, role_id: roleId };
            if (password) payload.password = password;

            if (editingUser) {
                if (!canEdit) return;
                await client.put(`/admin/users/${editingUser.id}`, payload);
            } else {
                if (!canCreate) return;
                await client.post('/admin/users', payload);
            }

            Alert.alert('Succès', editingUser ? 'Utilisateur mis à jour' : 'Utilisateur créé');
            setModalVisible(false);
            resetForm();
            await fetchUsers();
            await refreshUser();
        } catch (e) {
            if (e.response?.status !== 422) {
                console.error(e);
            }
            const errors = e.response?.data?.errors;
            let message = 'Une erreur est survenue';

            if (errors) {
                const firstErrorField = Object.keys(errors)[0];
                message = errors[firstErrorField][0];
            } else if (e.response?.data?.message) {
                message = e.response.data.message;
            }

            Alert.alert('Erreur', message);
        }
    };

    const deleteUser = (id) => {
        if (id === 1) return; // Protect main admin
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
        setPassword('');
        setRoleId('2');
    };

    const startEdit = (user) => {
        if (!canEdit) return;
        setEditingUser(user);
        setName(user.name);
        setEmail(user.email);
        setPassword('');
        setRoleId(user.roles[0]?.id.toString() || '2');
        setModalVisible(true);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.details}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.roleRow}>
                        {item.roles.map(role => (
                            <View key={role.id} style={styles.roleBadge}>
                                <Text style={styles.roleText}>{role.title}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
            {(canEdit || canDelete) && (
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

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.secondary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <View style={styles.topBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.countText}>{users.length} utilisateurs</Text>
                </View>
                {canCreate && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            resetForm();
                            setModalVisible(true);
                        }}
                    >
                        <Ionicons name="add" size={24} color={Colors.surface} />
                        <Text style={styles.addButtonText}>Nouveau</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                onRefresh={fetchUsers}
                refreshing={refreshing}
            />

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

                        <ScrollView style={styles.form}>
                            <Text style={styles.label}>Nom complet</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Nom complet"
                            />

                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Text style={styles.label}>Mot de passe {editingUser && '(laisser vide pour ne pas changer)'}</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="8 caractères min."
                                secureTextEntry
                            />

                            <Text style={styles.label}>Rôle</Text>
                            <View style={styles.roleSelector}>
                                <TouchableOpacity
                                    style={[styles.roleSelectBtn, roleId === '1' && styles.roleActive]}
                                    onPress={() => setRoleId('1')}
                                >
                                    <Text style={[styles.roleSelectText, roleId === '1' && styles.roleActiveText]}>Admin</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.roleSelectBtn, roleId === '2' && styles.roleActive]}
                                    onPress={() => setRoleId('2')}
                                >
                                    <Text style={[styles.roleSelectText, roleId === '2' && styles.roleActiveText]}>Utilisateur</Text>
                                </TouchableOpacity>
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
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 15,
        backgroundColor: Colors.surface,
    },
    countText: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.textLight,
    },
    addButton: {
        backgroundColor: Colors.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    addButtonText: {
        color: Colors.surface,
        marginLeft: 4,
        fontFamily: 'Poppins_600SemiBold',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 1,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        color: Colors.primary,
        fontFamily: 'Poppins_700Bold',
    },
    details: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
    },
    userEmail: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
    roleRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    roleBadge: {
        backgroundColor: Colors.secondary + '10',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleText: {
        fontSize: 10,
        color: Colors.secondary,
        fontFamily: 'Poppins_600SemiBold',
    },
    actions: {
        flexDirection: 'row',
    },
    actionIcon: {
        padding: 8,
        marginLeft: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    form: {
        marginTop: 10,
    },
    label: {
        fontSize: 12,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.textLight,
        marginBottom: 6,
    },
    input: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        fontFamily: 'Poppins_400Regular',
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    roleSelector: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    roleSelectBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    roleActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    roleSelectText: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
    },
    roleActiveText: {
        color: '#FFF',
    },
    saveButton: {
        backgroundColor: Colors.secondary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
    }
});

export default AdminUserScreen;
