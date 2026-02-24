import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, Modal, TextInput,
    KeyboardAvoidingView, ScrollView, Platform, Image, Switch, StatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import Toast, { useToast } from '../../components/Toast';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';

const AdminPubScreen = ({ navigation }) => {
    const { hasPermission } = useAuth();
    const canCreate = hasPermission('pub_create');
    const canEdit = hasPermission('pub_edit');
    const canDelete = hasPermission('pub_delete');

    const [pubs, setPubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editPub, setEditPub] = useState(null);
    const { toastRef, showToast } = useToast();

    const [nom, setNom] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [active, setActive] = useState(true);
    const [saving, setSaving] = useState(false);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://192.168.123.181:8000/storage/${path}`;
    };

    const fetchPubs = async () => {
        try {
            const response = await client.get('/admin/pubs');
            setPubs(Array.isArray(response.data) ? response.data : []);
        } catch (e) {
            Alert.alert('Erreur', 'Impossible de charger les publicités');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchPubs(); }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.85,
        });
        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const resetForm = () => {
        setNom('');
        setDescription('');
        setImage(null);
        setActive(true);
        setEditPub(null);
    };

    const handleEdit = (pub) => {
        setEditPub(pub);
        setNom(pub.nom);
        setDescription(pub.description || '');
        setImage(pub.image ? { uri: getImageUrl(pub.image) } : null);
        setActive(!!pub.active);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!nom.trim()) {
            Alert.alert('Erreur', 'Le nom est obligatoire');
            return;
        }

        const formData = new FormData();
        formData.append('nom', nom.trim());
        formData.append('description', description || '');
        formData.append('active', active ? '1' : '0');

        if (image && image.uri && !image.uri.startsWith('http')) {
            const uriParts = image.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('image', {
                uri: image.uri,
                name: `pub.${fileType}`,
                type: `image/${fileType}`,
            });
        }

        setSaving(true);
        try {
            if (editPub) {
                await client.post(`/admin/pubs/${editPub.id}?_method=PUT`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                showToast('Publicité mise à jour ✓');
            } else {
                await client.post('/admin/pubs', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                showToast('Publicité créée ✓');
            }
            setModalVisible(false);
            fetchPubs();
        } catch (e) {
            Alert.alert('Erreur', "Échec de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id, pubNom) => {
        Alert.alert('Confirmation', `Supprimer "${pubNom}" ?`, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive', onPress: async () => {
                    try {
                        await client.delete(`/admin/pubs/${id}`);
                        fetchPubs();
                        showToast('Publicité supprimée');
                    } catch {
                        Alert.alert('Erreur', 'Échec suppression');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={item.image ? { uri: getImageUrl(item.image) } : require('../../../assets/icon.png')}
                style={styles.cardImage}
            />
            <View style={styles.cardBody}>
                <View style={styles.cardInfo}>
                    <View style={styles.cardTitleRow}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.nom}</Text>
                        <View style={[styles.badge, { backgroundColor: item.active ? Colors.success + 'CC' : Colors.error + 'CC' }]}>
                            <Text style={styles.badgeText}>{item.active ? 'Active' : 'Inactive'}</Text>
                        </View>
                    </View>
                    {item.description ? (
                        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                    ) : null}
                </View>
                {(canEdit || canDelete) && (
                    <View style={styles.actions}>
                        {canEdit && (
                            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
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
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <Toast ref={toastRef} />

            {/* Header */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.surface }}>
                <View style={styles.topHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.welcomeText}>Administration</Text>
                        <Text style={styles.userName} numberOfLines={1}>Publicités</Text>
                    </View>
                    {canCreate && (
                        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
                            <Ionicons name="add" size={24} color="#FFF" />
                            <Text style={styles.addBtnText}>Ajouter</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.secondary} style={{ marginTop: 60 }} />
            ) : (
                <FlatList
                    data={pubs}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    onRefresh={fetchPubs}
                    refreshing={refreshing}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="megaphone-outline" size={60} color={Colors.border} />
                            <Text style={styles.emptyText}>Aucune publicité</Text>
                            <Text style={styles.emptyHint}>Appuyez sur "Ajouter" pour créer votre première pub</Text>
                        </View>
                    }
                />
            )}

            {/* Modal Formulaire */}
            <Modal visible={modalVisible} animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={styles.modalBg}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editPub ? 'Modifier la pub' : 'Nouvelle Pub'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            {/* Image Picker */}
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {image ? (
                                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Ionicons name="image-outline" size={48} color={Colors.textLight} />
                                        <Text style={styles.imagePlaceholderText}>Choisir une image (format bannière)</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.label}>Nom de la publicité</Text>
                            <TextInput
                                style={styles.input}
                                value={nom}
                                onChangeText={setNom}
                                placeholder="Ex: Promo Ramadan"
                                placeholderTextColor={Colors.textLight}
                            />

                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Texte affiché sur la bannière..."
                                placeholderTextColor={Colors.textLight}
                                multiline
                            />

                            <View style={styles.switchRow}>
                                <View>
                                    <Text style={styles.label}>Publier maintenant</Text>
                                    <Text style={styles.switchHint}>Visible sur l'accueil si activé</Text>
                                </View>
                                <Switch
                                    value={active}
                                    onValueChange={setActive}
                                    trackColor={{ false: Colors.border, true: Colors.success + '80' }}
                                    thumbColor={active ? Colors.success : '#ccc'}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving
                                    ? <ActivityIndicator color="#FFF" />
                                    : <Text style={styles.saveText}>Enregistrer</Text>
                                }
                            </TouchableOpacity>

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    topHeader: {
        paddingTop: Platform.OS === 'android' ? 10 : 0,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    backBtn: { marginRight: 16 },
    headerInfo: { flex: 1 },
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
    addBtn: {
        backgroundColor: Colors.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    addBtnText: { color: '#FFF', marginLeft: 5, fontFamily: 'Poppins_600SemiBold' },
    list: { padding: 16, paddingBottom: 100 },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    cardImage: {
        width: '100%',
        aspectRatio: 1,   // carré 1:1 (1080x1080)
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        marginLeft: 8,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: 'Poppins_700Bold',
    },
    cardBody: {
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardInfo: { flex: 1 },
    cardTitle: {
        fontSize: 15,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        flex: 1,
    },
    cardDesc: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        marginTop: 2,
        lineHeight: 18,
    },
    actions: { flexDirection: 'row' },
    actionBtn: { padding: 8, marginLeft: 4 },
    empty: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        color: Colors.textLight,
        marginTop: 16,
    },
    emptyHint: {
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    modalBg: {
        flex: 1,
        backgroundColor: Colors.surface,
        paddingTop: Platform.OS === 'ios' ? 44 : 0,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    form: { padding: 20 },
    label: {
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.textLight,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        fontFamily: 'Poppins_400Regular',
        fontSize: 15,
        color: Colors.primary,
    },
    imagePicker: {
        width: '100%',
        height: 180,
        borderRadius: 16,
        backgroundColor: Colors.background,
        marginBottom: 24,
        overflow: 'hidden',
        borderStyle: 'dashed',
        borderWidth: 1.5,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: 10,
        color: Colors.textLight,
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    switchHint: {
        fontSize: 11,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        marginTop: 2,
    },
    saveBtn: {
        backgroundColor: Colors.secondary,
        padding: 18,
        borderRadius: 14,
        alignItems: 'center',
    },
    saveText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
    },
});

export default AdminPubScreen;
