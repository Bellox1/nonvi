import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Linking,
    Dimensions,
    Modal as RNModal,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import Toast, { useToast } from '../components/Toast';

const { width, height } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { toastRef, showToast } = useToast();
    const [allStations, setAllStations] = useState([]);
    const [cities, setCities] = useState([]);
    const [ville, setVille] = useState('');
    const [selectedStation, setSelectedStation] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loadingStations, setLoadingStations] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const finalTotal = cartTotal;

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        try {
            const response = await client.get('/stations');
            const data = response.data;
            setAllStations(data);

            // Extract unique cities
            const uniqueCities = [...new Set(data.map(s => s.ville))].sort();
            setCities(uniqueCities);

            if (uniqueCities.length > 0) {
                setVille(uniqueCities[0]);
            }
        } catch (e) {
            console.error('Error fetching stations:', e);
            showToast('Erreur lors du chargement des stations', 'error');
        } finally {
            setLoadingStations(false);
        }
    };

    const stationsInCity = allStations.filter(s => s.ville === ville);

    useEffect(() => {
        // Reset selected station if it's not in the current city
        if (selectedStation && selectedStation.ville !== ville) {
            setSelectedStation(null);
        }
    }, [ville]);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://192.168.123.181:8000/storage/${path}`;
    };

    const handleOrder = async () => {
        if (!ville || !selectedStation) {
            showToast('Veuillez préciser la ville et la station de retrait', 'warning');
            return;
        }

        const subscription = Linking.addEventListener('url', (event) => {
            if (event.url.includes('nonvi://')) {
                WebBrowser.dismissBrowser();
            }
        });

        setSubmitting(true);
        try {
            const items = cartItems.map(item => ({
                produit_id: item.id,
                quantite: item.quantity,
                prix_unitaire: item.prix
            }));

            const response = await client.post('/commandes', {
                items,
                type_retrait: 'sur_place',
                ville_livraison: `${ville}, ${selectedStation.nom}`,
                prix_total: finalTotal
            });

            if (response.data && response.data.checkout_url) {
                showToast('Chargement du paiement...', 'success');
                await WebBrowser.openBrowserAsync(response.data.checkout_url, {
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
                    toolbarColor: Colors.primary,
                    controlsColor: '#FFF',
                });

                setSubmitting(true);
                try {
                    const statusRes = await client.get(`/commandes`);
                    const latest = statusRes.data[0];
                    if (latest && latest.payment_id === response.data.transaction_id && latest.payment_status === 'paid') {
                        showToast('Paiement réussi !', 'success');
                        clearCart();
                        navigation.navigate('Drawer', { screen: 'History' });
                    } else {
                        showToast('Paiement annulé', 'warning');
                    }
                } catch (e) {
                    showToast('Paiement annulé', 'warning');
                }
                subscription.remove();
            } else {
                showToast('Commande validée !', 'success');
                clearCart();
                setTimeout(() => navigation.navigate('Drawer', { screen: 'History' }), 2000);
            }

        } catch (e) {
            const errorMsg = e.response?.data?.message || 'Impossible de valider votre commande';
            showToast(errorMsg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image
                source={item.image ? { uri: getImageUrl(item.image) } : require('../../assets/icon.png')}
                style={styles.itemImage}
            />
            <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.nom}</Text>
                <Text style={styles.itemPrice}>{item.prix} CFA</Text>
                <View style={styles.quantityControls}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity - 1)}><Ionicons name="remove" size={16} color={Colors.primary} /></TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity + 1)}><Ionicons name="add" size={16} color={Colors.primary} /></TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.id)}><Ionicons name="trash-outline" size={20} color={Colors.error} /></TouchableOpacity>
        </View>
    );

    if (cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={80} color={Colors.border} />
                <Text style={styles.emptyText}>Votre panier est vide</Text>
                <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Drawer', { screen: 'Store' })}><Text style={styles.shopBtnText}>Aller à Santé Plus</Text></TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <Toast ref={toastRef} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.itemsSection}>
                    <Text style={styles.sectionTitle}>Articles ({cartItems.length})</Text>
                    <FlatList data={cartItems} renderItem={renderItem} keyExtractor={item => item.id.toString()} scrollEnabled={false} />
                </View>

                <View style={styles.locationSection}>
                    <Text style={styles.sectionTitle}>Information de retrait</Text>

                    <Text style={styles.label}>Ville de retrait</Text>
                    {loadingStations ? (
                        <ActivityIndicator color={Colors.secondary} style={{ alignSelf: 'flex-start', marginVertical: 10 }} />
                    ) : (
                        <View style={styles.villeToggleContainer}>
                            {cities.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    style={[styles.villeToggle, ville === c && styles.villeToggleActive]}
                                    onPress={() => setVille(c)}
                                >
                                    <Text style={[styles.villeToggleText, ville === c && styles.villeToggleTextActive]}>{c}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <Text style={styles.label}>Station de retrait</Text>
                    <TouchableOpacity
                        style={styles.stationSelector}
                        onPress={() => setModalVisible(true)}
                        disabled={loadingStations || stationsInCity.length === 0}
                    >
                        <Text style={[styles.stationSelectorText, !selectedStation && { color: Colors.textLight }]}>
                            {selectedStation ? selectedStation.nom : (stationsInCity.length > 0 ? 'Choisir une station...' : 'Aucune station disponible')}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={Colors.textLight} />
                    </TouchableOpacity>
                </View>

                <View style={styles.summarySection}>
                    <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Sous-total</Text><Text style={styles.summaryValue}>{cartTotal} CFA</Text></View>
                    <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{finalTotal} CFA</Text></View>
                </View>

                <TouchableOpacity style={[styles.orderBtn, submitting && styles.btnDisabled]} onPress={handleOrder} disabled={submitting}>
                    {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.orderBtnText}>Valider la commande</Text>}
                </TouchableOpacity>
            </ScrollView>

            <RNModal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Stations à {ville}</Text>
                        <ScrollView>
                            {stationsInCity.map(s => (
                                <TouchableOpacity
                                    key={s.id}
                                    style={[styles.stationItem, selectedStation?.id === s.id && styles.stationItemActive]}
                                    onPress={() => {
                                        setSelectedStation(s);
                                        setModalVisible(false);
                                    }}
                                >
                                    <View style={styles.stationItemInfo}>
                                        <Ionicons name="business-outline" size={20} color={selectedStation?.id === s.id ? Colors.secondary : Colors.primary} />
                                        <Text style={[styles.stationItemText, selectedStation?.id === s.id && styles.stationItemTextActive]}>{s.nom}</Text>
                                    </View>
                                    {selectedStation?.id === s.id && <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </RNModal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { padding: 20 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { fontSize: 18, fontFamily: 'Poppins_400Regular', color: Colors.textLight, marginTop: 20 },
    shopBtn: { marginTop: 30, backgroundColor: Colors.primary, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 10 },
    shopBtnText: { color: '#FFF', fontFamily: 'Poppins_600SemiBold' },
    sectionTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.primary, marginBottom: 15 },
    cartItem: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 15, padding: 12, marginBottom: 12, alignItems: 'center' },
    itemImage: { width: 70, height: 70, borderRadius: 10, marginRight: 15 },
    itemContent: { flex: 1 },
    itemName: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
    itemPrice: { fontSize: 14, color: Colors.secondary, fontFamily: 'Poppins_700Bold' },
    quantityControls: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    qtyBtn: { width: 28, height: 28, backgroundColor: Colors.background, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    qtyText: { marginHorizontal: 12, fontSize: 14, fontFamily: 'Poppins_600SemiBold' },
    removeBtn: { padding: 8 },
    locationSection: { marginTop: 20 },
    label: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.textLight, marginBottom: 8, marginTop: 15 },
    villeToggleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 4,
        gap: 4,
    },
    villeToggle: {
        flex: 1,
        minWidth: 100,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    villeToggleActive: {
        backgroundColor: Colors.primary,
    },
    villeToggleText: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.textLight,
        fontSize: 13,
    },
    villeToggleTextActive: {
        color: '#FFF',
    },
    stationSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    stationSelectorText: {
        fontFamily: 'Poppins_400Regular',
        color: Colors.primary,
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        maxHeight: height * 0.6,
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: Colors.border,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginBottom: 20,
    },
    stationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 12,
        marginBottom: 8,
    },
    stationItemActive: {
        backgroundColor: Colors.primary + '10',
    },
    stationItemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stationItemText: {
        fontSize: 15,
        fontFamily: 'Poppins_500Medium',
        color: Colors.primary,
    },
    stationItemTextActive: {
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.secondary,
    },
    summarySection: { marginTop: 30, backgroundColor: Colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.border },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    summaryLabel: { color: Colors.textLight, fontFamily: 'Poppins_400Regular' },
    summaryValue: { color: Colors.primary, fontFamily: 'Poppins_600SemiBold' },
    totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
    totalLabel: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    totalValue: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.secondary },
    orderBtn: { marginTop: 30, backgroundColor: Colors.secondary, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
    orderBtnText: { color: '#FFF', fontSize: 18, fontFamily: 'Poppins_700Bold' },
    btnDisabled: { opacity: 0.7 },
});

export default CartScreen;
