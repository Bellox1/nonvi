import React, { useState } from 'react';
import { DrawerActions } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Modal,
    RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import Toast, { useToast } from '../components/Toast';
import client from '../api/client';

const ProfileScreen = ({ navigation }) => {
    const { user, logout, updateProfile } = useAuth();
    const { toastRef, showToast } = useToast();

    const [showInfoEdit, setShowInfoEdit] = useState(false);
    const [showSecurityEdit, setShowSecurityEdit] = useState(false);

    const [name, setName] = useState(user?.name || '');
    const [tel, setTel] = useState(user?.tel || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [loadingSecurity, setLoadingSecurity] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Sync local state when global user changes
    React.useEffect(() => {
        if (user) {
            setName(user.name);
            setTel(user.tel);
            setEmail(user.email || '');
        }
    }, [user]);

    // Delete account states
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [loadingDelete, setLoadingDelete] = useState(false);

    // Password visibility states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);

    const validatePassword = (pass) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(pass);
    };

    const handleUpdateInfo = async () => {
        if (!name || !tel) {
            showToast('Nom et Téléphone sont obligatoires', 'error');
            return;
        }

        setLoadingInfo(true);
        try {
            await updateProfile({ name, tel, email });
            showToast('Informations personnelles mises à jour');
            setShowInfoEdit(false);
        } catch (e) {
            showToast('Impossible de mettre à jour les informations', 'error');
        } finally {
            setLoadingInfo(false);
        }
    };

    const handleUpdateSecurity = async () => {
        if (!password || !passwordConfirmation) {
            showToast('Veuillez remplir les deux champs', 'warning');
            return;
        }

        if (password !== passwordConfirmation) {
            showToast('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        if (!validatePassword(password)) {
            Alert.alert(
                'Mot de passe trop faible',
                'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un symbole (@$!%*?&).'
            );
            return;
        }

        setLoadingSecurity(true);
        try {
            await updateProfile({
                name,
                tel,
                password,
                password_confirmation: passwordConfirmation
            });
            showToast('Mot de passe changé avec succès');
            setPassword('');
            setPasswordConfirmation('');
            setShowSecurityEdit(false);
        } catch (e) {
            showToast('Impossible de changer le mot de passe', 'error');
        } finally {
            setLoadingSecurity(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!currentPassword) {
            showToast('Veuillez entrer votre mot de passe', 'warning');
            return;
        }

        setLoadingDelete(true);
        try {
            await client.delete('/profile', { data: { password: currentPassword } });
            setDeleteModalVisible(false);
            showToast('Votre compte a été supprimé');
            setTimeout(logout, 2000);
        } catch (e) {
            const msg = e.response?.data?.errors?.password?.[0] || e.response?.data?.message || 'Erreur lors de la suppression';
            showToast(msg, 'error');
        } finally {
            setLoadingDelete(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Déconnexion', style: 'destructive', onPress: logout }
            ]
        );
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await refreshUser();
        } finally {
            setRefreshing(false);
        }
    }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Toast ref={toastRef} />

            {/* Header with Menu Button */}
            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => navigation.getParent()?.dispatch(DrawerActions.openDrawer())}>
                    <Ionicons name="apps" size={28} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.topNavTitle}>Mon Profil</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={Colors.error} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.profileHeader}>
                    <View style={styles.headerRow}>
                        <View style={styles.avatarCol}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={40} color="#FFF" />
                            </View>
                            <Text style={styles.userName}>{user?.name}</Text>
                        </View>

                        <View style={styles.infoCol}>
                            <Text style={styles.userEmail}>{user?.email || user?.tel}</Text>
                            {user?.tel && user?.email && <Text style={styles.userSub}>{user?.tel}</Text>}

                            {!user?.email && (
                                <TouchableOpacity
                                    style={styles.completeBadge}
                                    onPress={() => setShowInfoEdit(true)}
                                >
                                    <Ionicons name="alert-circle" size={14} color={Colors.error} />
                                    <Text style={styles.completeText}>Compléter le profil</Text>
                                </TouchableOpacity>
                            )}

                            <View style={styles.pointsBadge}>
                                <Ionicons name="star" size={16} color={Colors.secondary} />
                                <Text style={styles.pointsText}>{user?.points || 0} Points</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* HELP LINK */}
                    <TouchableOpacity
                        style={styles.helpLink}
                        onPress={() => navigation.navigate('Help')}
                    >
                        <Ionicons name="help-circle-outline" size={24} color={Colors.secondary} />
                        <Text style={styles.helpLinkText}>Aide & Support</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.border} />
                    </TouchableOpacity>

                    {/* Section 1: Informations Personnelles */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.sectionHeader}
                            onPress={() => setShowInfoEdit(!showInfoEdit)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.sectionHeaderLeft}>
                                <Ionicons name="person-circle-outline" size={24} color={Colors.secondary} />
                                <Text style={styles.sectionTitle}>Infos du compte</Text>
                            </View>
                            <Ionicons
                                name={showInfoEdit ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={Colors.textLight}
                            />
                        </TouchableOpacity>

                        {showInfoEdit && (
                            <View style={styles.editContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nom complet</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="Votre nom"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Téléphone (Identifiant)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={tel}
                                        onChangeText={setTel}
                                        keyboardType="phone-pad"
                                        placeholder="Votre numéro"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Adresse Email</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        placeholder="votre@email.com"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleUpdateInfo}
                                    disabled={loadingInfo}
                                >
                                    {loadingInfo ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Mettre à jour mes infos</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Section 2: Sécurité */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.sectionHeader}
                            onPress={() => setShowSecurityEdit(!showSecurityEdit)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.sectionHeaderLeft}>
                                <Ionicons name="shield-checkmark-outline" size={24} color={Colors.secondary} />
                                <Text style={styles.sectionTitle}>Sécurité du compte</Text>
                            </View>
                            <Ionicons
                                name={showSecurityEdit ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={Colors.textLight}
                            />
                        </TouchableOpacity>

                        {showSecurityEdit && (
                            <View style={styles.editContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nouveau mot de passe</Text>
                                    <View style={styles.passwordInputContainer}>
                                        <TextInput
                                            style={styles.flexInput}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                            placeholder="Min. 8 caractères"
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Ionicons
                                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                                size={20}
                                                color={Colors.textLight}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Confirmer le mot de passe</Text>
                                    <View style={styles.passwordInputContainer}>
                                        <TextInput
                                            style={styles.flexInput}
                                            value={passwordConfirmation}
                                            onChangeText={setPasswordConfirmation}
                                            secureTextEntry={!showConfirmPassword}
                                            placeholder="Confirmation"
                                        />
                                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            <Ionicons
                                                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                                size={20}
                                                color={Colors.textLight}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: Colors.primary }]}
                                    onPress={handleUpdateSecurity}
                                    disabled={loadingSecurity}
                                >
                                    {loadingSecurity ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Changer mon mot de passe</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.deleteLink}
                                    onPress={() => setDeleteModalVisible(true)}
                                >
                                    <Text style={styles.deleteLinkText}>Supprimer définitivement mon compte</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>

            {/* Account Deletion Modal */}
            <Modal
                visible={deleteModalVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconBox}>
                            <Ionicons name="warning" size={30} color={Colors.error} />
                        </View>
                        <Text style={styles.modalTitle}>Supprimer le compte ?</Text>
                        <Text style={styles.modalText}>
                            Cette action est irréversible. Toutes vos réservations et points seront perdus.
                            Veuillez entrer votre mot de passe pour confirmer.
                        </Text>

                        <View style={styles.modalInputContainer}>
                            <TextInput
                                style={styles.flexInput}
                                placeholder="Votre mot de passe actuel"
                                secureTextEntry={!showCurrentPassword}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                autoFocus
                            />
                            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                                <Ionicons
                                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={Colors.textLight}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelLink}
                                onPress={() => {
                                    setDeleteModalVisible(false);
                                    setCurrentPassword('');
                                }}
                            >
                                <Text style={styles.cancelLinkText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.deleteBtn, loadingDelete && { opacity: 0.7 }]}
                                onPress={handleDeleteAccount}
                                disabled={loadingDelete}
                            >
                                {loadingDelete ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.deleteBtnText}>Supprimer</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    topNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 15,
        paddingBottom: 15,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    topNavTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
    },
    profileHeader: {
        backgroundColor: Colors.surface,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingTop: 15,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatarCol: {
        alignItems: 'center',
        width: 100, // Fixed width for the left column
    },
    infoCol: {
        flex: 1,
        marginLeft: 15,
        paddingTop: 10,
    },
    avatar: {
        width: 86,
        height: 86,
        borderRadius: 43,
        backgroundColor: Colors.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 16,
        shadowColor: Colors.tertiary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 3,
        borderColor: Colors.tertiary,
    },
    userName: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        textAlign: 'center',
        marginTop: 8,
    },
    userEmail: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        marginBottom: 4,
    },
    userSub: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight + '80',
        marginBottom: 12,
    },
    completeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.error + '10',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        gap: 6,
        marginTop: 5,
        marginBottom: 10,
    },
    completeText: {
        fontSize: 11,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.error,
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.secondary + '15',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    pointsText: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.secondary,
    },
    content: {
        padding: 20,
    },
    helpLink: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        marginBottom: 20,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    helpLinkText: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
    },
    section: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
    },
    editContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.background,
        paddingTop: 15,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.textLight,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.primary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    flexInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.primary,
    },
    saveButton: {
        backgroundColor: Colors.secondary,
        borderRadius: 12,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
    },
    deleteLink: {
        alignItems: 'center',
        marginTop: 20,
        paddingVertical: 10,
    },
    deleteLinkText: {
        color: Colors.error,
        fontFamily: 'Poppins_500Medium',
        fontSize: 13,
        textDecorationLine: 'underline',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 24,
        padding: 25,
        width: '100%',
        alignItems: 'center',
    },
    modalIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.error + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginBottom: 10,
    },
    modalText: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    modalInputContainer: {
        width: '100%',
        backgroundColor: Colors.background,
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: 15,
    },
    cancelLink: {
        flex: 1,
        alignItems: 'center',
    },
    cancelLinkText: {
        color: Colors.textLight,
        fontFamily: 'Poppins_600SemiBold',
    },
    deleteBtn: {
        flex: 2,
        backgroundColor: Colors.error,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteBtnText: {
        color: '#FFF',
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 15,
    }
});

export default ProfileScreen;
