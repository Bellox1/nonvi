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
    Image,
    StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import Toast, { useToast } from '../../components/Toast';

import { useAuth } from '../../context/AuthContext';
import { exportToCsv } from '../../utils/export';

const AdminProductScreen = ({ navigation }) => {
    const { hasPermission } = useAuth();
    const canCreate = hasPermission('produit_create');
    const canEdit = hasPermission('produit_edit');
    const canDelete = hasPermission('produit_delete');
    const canExport = hasPermission('export_csv');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const { toastRef, showToast } = useToast();

    const [nom, setNom] = useState('');
    const [prix, setPrix] = useState('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState(null);
    const [saving, setSaving] = useState(false);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://192.168.123.181:8000/storage/${path}`;
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await client.get('/admin/produits');
            setProducts(response.data.data || response.data);
        } catch (e) {
            console.error(e.response?.data || e.message);
            Alert.alert('Erreur', 'Impossible de charger les produits');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSave = async () => {
        if (!nom.trim() || !prix || !stock) {
            Alert.alert('Erreur', 'Nom, prix et stock sont obligatoires');
            return;
        }

        const formData = new FormData();
        formData.append('nom', nom.trim());
        formData.append('prix', prix);
        formData.append('description', description || '');
        formData.append('stock', stock);

        if (image && image.uri) {
            const uriParts = image.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('image', {
                uri: image.uri,
                name: `photo.${fileType}`,
                type: `image/${fileType}`,
            });
        }

        setSaving(true);
        try {
            if (editProduct) {
                await client.post(`/admin/produits/${editProduct.id}?_method=PUT`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                showToast('Produit mis à jour');
            } else {
                await client.post('/admin/produits', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                showToast('Produit créé');
            }
            setModalVisible(false);
            fetchProducts();
        } catch (e) {
            console.error(e.response?.data || e.message);
            Alert.alert('Erreur', 'Echec de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setNom('');
        setPrix('');
        setDescription('');
        setStock('');
        setImage(null);
        setEditProduct(null);
    };

    const handleEdit = (product) => {
        setEditProduct(product);
        setNom(product.nom);
        setPrix(product.prix.toString());
        setDescription(product.description || '');
        setStock(product.stock.toString());
        setImage(product.image ? { uri: getImageUrl(product.image) } : null);
        setModalVisible(true);
    };

    const handleDelete = (id, productNom) => {
        Alert.alert('Confirmation', `Supprimer "${productNom}" ?`, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive', onPress: async () => {
                    try {
                        await client.delete(`/admin/produits/${id}`);
                        fetchProducts();
                        showToast('Produit supprimé');
                    } catch (e) { Alert.alert('Erreur', 'Echec suppression'); }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={item.image ? { uri: getImageUrl(item.image) } : require('../../../assets/icon.png')}
                style={styles.prodImage}
            />
            <View style={styles.prodInfo}>
                <Text style={styles.prodName}>{item.nom}</Text>
                <Text style={styles.prodDetails}>{item.prix} CFA • Stock: {item.stock}</Text>
                {item.description ? <Text style={styles.prodDesc} numberOfLines={1}>{item.description}</Text> : null}
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
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <Toast ref={toastRef} />

            <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.surface }}>
                <View style={styles.topHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.welcomeText}>Administration</Text>
                        <Text style={styles.userName} numberOfLines={1}>Produits</Text>
                    </View>
                    {canExport && (
                        <TouchableOpacity
                            onPress={() => exportToCsv('admin/produits-export', 'produits')}
                            style={{ marginRight: 15 }}
                        >
                            <Ionicons name="download-outline" size={24} color={Colors.secondary} />
                        </TouchableOpacity>
                    )}
                    {canCreate && (
                        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setModalVisible(true); }}>
                            <Ionicons name="add" size={24} color="#FFF" />
                            <Text style={styles.addBtnText}>Ajouter</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>

            {loading ? <ActivityIndicator size="large" color={Colors.secondary} style={{ marginTop: 50 }} /> :
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    onRefresh={fetchProducts}
                    refreshing={refreshing}
                />}

            <Modal visible={modalVisible} animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={styles.modalBg}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editProduct ? 'Modifier' : 'Nouveau Produit'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={28} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {image ? (
                                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Ionicons name="camera" size={40} color={Colors.textLight} />
                                        <Text style={styles.imagePlaceholderText}>Ajouter une photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.label}>Nom du produit</Text>
                            <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Ex: Eau minérale" />

                            <Text style={styles.label}>Prix (CFA)</Text>
                            <TextInput style={styles.input} value={prix} onChangeText={setPrix} keyboardType="numeric" placeholder="Ex: 500" />

                            <Text style={styles.label}>Stock</Text>
                            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="Ex: 100" />

                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Description (optionnel)"
                                multiline
                            />

                            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
                                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Enregistrer</Text>}
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
    topHeader: {
        paddingTop: Platform.OS === 'android' ? 10 : 0,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    backBtn: {
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
    addBtnText: { color: '#FFF', marginLeft: 5, fontFamily: 'Poppins_600SemiBold' },
    list: { padding: 16, paddingBottom: 100 },
    card: { backgroundColor: Colors.surface, borderRadius: 15, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
    prodInfo: { flex: 1 },
    prodName: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    prodDetails: { fontSize: 14, color: Colors.textLight, fontFamily: 'Poppins_400Regular' },
    prodDesc: { fontSize: 12, color: Colors.textLight, fontFamily: 'Poppins_400Regular', marginTop: 2 },
    actions: { flexDirection: 'row' },
    actionBtn: { padding: 10, marginLeft: 5 },
    modalBg: { flex: 1, backgroundColor: Colors.surface, paddingTop: Platform.OS === 'ios' ? 40 : 0 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
    modalTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    form: { padding: 20 },
    label: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.textLight, marginBottom: 8 },
    input: { backgroundColor: Colors.background, borderRadius: 12, padding: 15, marginBottom: 20, fontFamily: 'Poppins_400Regular' },
    saveBtn: { backgroundColor: Colors.secondary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 50 },
    saveText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_700Bold' },
    prodImage: { width: 60, height: 60, borderRadius: 10, marginRight: 15, backgroundColor: Colors.background },
    imagePicker: { width: '100%', height: 200, borderRadius: 15, backgroundColor: Colors.background, marginBottom: 20, overflow: 'hidden', borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    imagePlaceholder: { alignItems: 'center' },
    imagePlaceholderText: { marginTop: 8, color: Colors.textLight, fontFamily: 'Poppins_400Regular' },
});

export default AdminProductScreen;
