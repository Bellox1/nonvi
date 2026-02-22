import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput,
    Platform,
    StatusBar
} from 'react-native';
import client from '../api/client';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import Toast, { useToast } from '../components/Toast';
import { useFocusEffect } from '@react-navigation/native';

const ProductListScreen = ({ navigation }) => {
    const { toastRef, showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { addToCart, cartCount } = useCart();

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchProducts();
        }, [])
    );

    const fetchProducts = async () => {
        try {
            const response = await client.get('/produits');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://192.168.123.181:8000/storage/${path}`;
    };

    const filteredProducts = products.filter(product =>
        product.nom.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderProduct = ({ item }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
            <Image
                source={item.image ? { uri: getImageUrl(item.image) } : require('../../assets/icon.png')}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.nom}</Text>
                <Text style={styles.productPrice}>{item.prix} CFA</Text>
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                        showToast(`${item.nom} ajouté au panier !`);
                    }}
                >
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={styles.addToCartText}>Ajouter</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
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
            <Toast ref={toastRef} />

            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => navigation.getParent()?.dispatch(DrawerActions.openDrawer())} style={styles.menuButton}>
                    <Ionicons name="apps" size={28} color={Colors.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.welcomeText}>Boutique</Text>
                    <Text style={styles.userName}>Santé Plus</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartIconBtn}>
                    <Ionicons name="basket" size={28} color={Colors.primary} />
                    {cartCount > 0 && (
                        <View style={styles.headerBadge}>
                            <Text style={styles.badgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={Colors.textLight} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un produit..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.productList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="basket-outline" size={60} color={Colors.border} />
                        <Text style={styles.emptyText}>Aucun produit trouvé</Text>
                    </View>
                }
            />
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
    topHeader: {
        paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 15,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    menuButton: {
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
    cartIconBtn: {
        position: 'relative',
        padding: 4,
    },
    searchContainer: {
        padding: 16,
        backgroundColor: Colors.surface,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 45,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
    },
    productList: {
        padding: 8,
    },
    productCard: {
        flex: 1,
        margin: 8,
        backgroundColor: Colors.surface,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#F3F4F6',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontFamily: 'Poppins_500Medium',
        color: Colors.primary,
        height: 40,
    },
    productPrice: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        color: Colors.secondary,
        marginVertical: 8,
    },
    addToCartButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
    },
    addToCartText: {
        color: '#FFF',
        fontSize: 12,
        fontFamily: 'Poppins_600SemiBold',
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        fontSize: 16,
    },
    headerBadge: {
        position: 'absolute',
        top: -2,
        right: -3,
        backgroundColor: Colors.secondary,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: Colors.surface,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 9,
        fontFamily: 'Poppins_700Bold',
    },
});

export default ProductListScreen;
