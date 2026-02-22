import React, { useState } from 'react';
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
    Modal,
    Dimensions,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import Toast, { useToast } from '../components/Toast';

const { width, height } = Dimensions.get('window');
const PRIX_LIVRAISON_FIXE = 1000;

const CartScreen = ({ navigation }) => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { toastRef, showToast } = useToast();
    const [retraitType, setRetraitType] = useState('sur_place');
    const [ville, setVille] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const finalTotal = retraitType === 'livraison' ? cartTotal + PRIX_LIVRAISON_FIXE : cartTotal;

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://192.168.123.181:8000/storage/${path}`;
    };

    const handleOrder = async () => {
        if (retraitType === 'livraison' && !ville.trim()) {
            showToast('Veuillez préciser l\'adresse de livraison', 'warning');
            return;
        }

        // Setup listener to auto-close browser
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
                type_retrait: retraitType,
                ville_livraison: retraitType === 'livraison' ? ville : null,
                prix_total: finalTotal
            });

            if (response.data && response.data.checkout_url) {
                showToast('Chargement du paiement...', 'success');

                // Open PRETTY Native Browser
                await WebBrowser.openBrowserAsync(response.data.checkout_url, {
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, // Nice iOS look
                    toolbarColor: Colors.primary,
                    controlsColor: '#FFF',
                });

                // Check status after close
                setSubmitting(true);
                try {
                    const statusRes = await client.get(`/commandes`);
                    const latest = statusRes.data[0];
                    if (latest && latest.payment_id === response.data.transaction_id && latest.payment_status === 'paid') {
                        showToast('Paiement réussi !', 'success');
                        clearCart(); // Only clear on success
                        navigation.navigate('Drawer', { screen: 'History' });
                    } else {
                        showToast('Paiement annulé', 'warning');
                        // Stay on cart screen
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
            console.error('Order error:', e.response?.data || e.message);
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

                <View style={styles.deliverySection}>
                    <Text style={styles.sectionTitle}>Mode de retrait</Text>
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={[styles.option, retraitType === 'sur_place' && styles.optionSelected]} onPress={() => setRetraitType('sur_place')}>
                            <Ionicons name={retraitType === 'sur_place' ? "radio-button-on" : "radio-button-off"} size={20} color={retraitType === 'sur_place' ? Colors.secondary : Colors.textLight} />
                            <Text style={[styles.optionText, retraitType === 'sur_place' && styles.optionTextSelected]}>Retrait sur place</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.option, retraitType === 'livraison' && styles.optionSelected]} onPress={() => setRetraitType('livraison')}>
                            <Ionicons name={retraitType === 'livraison' ? "radio-button-on" : "radio-button-off"} size={20} color={retraitType === 'livraison' ? Colors.secondary : Colors.textLight} />
                            <Text style={[styles.optionText, retraitType === 'livraison' && styles.optionTextSelected]}>Livraison (+{PRIX_LIVRAISON_FIXE} CFA)</Text>
                        </TouchableOpacity>
                    </View>
                    {retraitType === 'livraison' && (
                        <View style={styles.cityInputContainer}>
                            <Text style={styles.label}>Adresse de livraison</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Rue, quartier, maison..."
                                value={ville}
                                onChangeText={setVille}
                            />
                            <Text style={styles.deliveryWarning}>
                                <Ionicons name="information-circle" size={14} color={Colors.warning} /> Pas de livraison hors Cotonou et Porto-Novo
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.summarySection}>
                    <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Sous-total</Text><Text style={styles.summaryValue}>{cartTotal} CFA</Text></View>
                    {retraitType === 'livraison' && (<View style={styles.summaryRow}><Text style={styles.summaryLabel}>Frais de livraison</Text><Text style={styles.summaryValue}>{PRIX_LIVRAISON_FIXE} CFA</Text></View>)}
                    <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{finalTotal} CFA</Text></View>
                </View>

                <TouchableOpacity style={[styles.orderBtn, submitting && styles.btnDisabled]} onPress={handleOrder} disabled={submitting}>
                    {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.orderBtnText}>Valider la commande</Text>}
                </TouchableOpacity>
            </ScrollView>
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
    deliverySection: { marginTop: 20 },
    optionsContainer: { gap: 10 },
    option: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
    optionSelected: { borderColor: Colors.secondary, backgroundColor: Colors.secondary + '05' },
    optionText: { marginLeft: 12, fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textLight },
    optionTextSelected: { color: Colors.primary, fontFamily: 'Poppins_600SemiBold' },
    cityInputContainer: { marginTop: 15 },
    label: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.textLight, marginBottom: 8 },
    input: { backgroundColor: Colors.surface, borderRadius: 12, padding: 15, borderWidth: 1, borderColor: Colors.border },
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
    deliveryWarning: {
        marginTop: 8,
        fontSize: 11,
        color: Colors.warning,
        fontFamily: 'Poppins_500Medium',
        fontStyle: 'italic',
    },
});

export default CartScreen;
