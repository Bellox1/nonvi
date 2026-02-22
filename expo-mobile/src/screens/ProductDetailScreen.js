import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Alert,
    Modal,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import Toast, { useToast } from '../components/Toast';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
    const { product } = route.params || {};
    const { addToCart, cartCount } = useCart();
    const { toastRef, showToast } = useToast();
    const [qty, setQty] = useState(1);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const insets = useSafeAreaInsets();

    if (!product) {
        return (
            <View style={styles.center}>
                <Text>Produit non trouvé</Text>
            </View>
        );
    }

    const totalPrice = (product.prix || 0) * qty;

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://192.168.123.181:8000/storage/${path}`;
    };

    const handleAddToCart = () => {
        addToCart(product, qty);
        showToast(`${product.nom} ajouté au panier !`);
    };

    // Add cart icon to navigation header
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={{ marginRight: 20 }}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Ionicons name="cart-outline" size={24} color={Colors.primary} />
                    {cartCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            ),
        });
    }, [navigation, cartCount]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Toast ref={toastRef} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setImageModalVisible(true)}
                    style={styles.imageHeader}
                >
                    <Image
                        source={product.image ? { uri: getImageUrl(product.image) } : require('../../assets/icon.png')}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <View style={styles.zoomIcon}>
                        <Ionicons name="expand" size={20} color="#FFF" />
                    </View>
                </TouchableOpacity>

                {/* Image Full Screen Modal */}
                <Modal visible={imageModalVisible} transparent={true} animationType="fade">
                    <View style={styles.modalBg}>
                        <TouchableOpacity
                            style={styles.closeModal}
                            onPress={() => setImageModalVisible(false)}
                        >
                            <Ionicons name="close" size={30} color="#FFF" />
                        </TouchableOpacity>
                        <Image
                            source={product.image ? { uri: getImageUrl(product.image) } : require('../../assets/icon.png')}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    </View>
                </Modal>

                <View style={styles.content}>
                    <Text style={styles.name}>{product.nom || product.name}</Text>
                    <Text style={styles.price}>{product.prix} CFA</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>
                            {product.description || 'Aucune description disponible pour ce produit.'}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quantité</Text>
                        <View style={styles.qtyContainer}>
                            <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}>
                                <Ionicons name="remove" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{qty}</Text>
                            <TouchableOpacity onPress={() => setQty(qty + 1)} style={styles.qtyBtn}>
                                <Ionicons name="add" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Platform.OS === 'ios' ? 40 : Math.max(24, insets.bottom + 16) }]}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total à payer</Text>
                    <Text style={styles.totalPrice}>{totalPrice} CFA</Text>
                </View>
                <TouchableOpacity
                    style={styles.orderButton}
                    onPress={handleAddToCart}
                >
                    <Ionicons name="cart-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.orderButtonText}>Ajouter au panier</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    imageHeader: {
        width: '100%',
        height: 250,
        backgroundColor: Colors.background,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    zoomIcon: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
    },
    name: {
        fontSize: 24,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginBottom: 8,
    },
    price: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        color: Colors.secondary,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        lineHeight: 22,
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 8,
        alignSelf: 'flex-start',
    },
    qtyBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    qtyText: {
        fontSize: 18,
        fontFamily: 'Poppins_600SemiBold',
        marginHorizontal: 20,
        color: Colors.primary,
    },
    footer: {
        flexDirection: 'row',
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        alignItems: 'center',
    },
    totalContainer: {
        flex: 0.8,
    },
    totalLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
    totalPrice: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    orderButton: {
        flex: 1.5,
        backgroundColor: Colors.secondary,
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
        paddingHorizontal: 12,
    },
    orderButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
    },
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeModal: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
    },
    fullImage: {
        width: width,
        height: width,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -10,
        backgroundColor: Colors.secondary,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: 'Poppins_700Bold',
    }
});

export default ProductDetailScreen;
