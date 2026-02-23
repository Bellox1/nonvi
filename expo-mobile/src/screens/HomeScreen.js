import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, Linking, Dimensions, Platform, StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect, DrawerActions } from '@react-navigation/native';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const { user } = useAuth();

    const [pubs, setPubs] = useState([]);
    const [products, setProducts] = useState([]);
    const pubScrollRef = useRef(null);
    const pubIndexRef = useRef(0);

    const fetchPubs = useCallback(async () => {
        try {
            const response = await client.get('/pubs');
            setPubs(response.data);
        } catch (error) {
            console.error('Error fetching pubs:', error);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const resp = await client.get('/produits');
            setProducts(Array.isArray(resp.data) ? resp.data.slice(0, 10) : []);
        } catch (e) {
            console.error('Error fetching products:', e);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchPubs();
            fetchProducts();
        }, [fetchPubs, fetchProducts])
    );

    // Auto-scroll toutes les 3 secondes
    useEffect(() => {
        if (pubs.length <= 1) return;
        const cardWidth = width * 0.78 + 12;
        const timer = setInterval(() => {
            pubIndexRef.current = (pubIndexRef.current + 1) % pubs.length;
            pubScrollRef.current?.scrollTo({
                x: pubIndexRef.current * cardWidth,
                animated: true,
            });
        }, 3000);
        return () => clearInterval(timer);
    }, [pubs.length]);

    const handleCall = () => {
        Linking.openURL('tel:0169343333');
    };

    const menuItems = [
        {
            title: 'Réservation',
            icon: 'bus',
            color: '#3B82F6',
            screen: 'Transport',
            subtitle: 'Réserver un voyage'
        },
        {
            title: 'Santé Plus',
            icon: 'cart',
            color: '#10B981',
            screen: 'Store',
            subtitle: 'Commander des produits de santé'
        },
        {
            title: 'Historique',
            icon: 'time',
            color: '#F59E0B',
            screen: 'History',
            subtitle: 'Vos courses et commandes'
        },
        {
            title: 'À Propos',
            icon: 'information-circle',
            color: '#6366F1',
            screen: 'DrawerAbout',
            subtitle: 'Qui sommes-nous ?'
        },
        {
            title: 'Aide & Support',
            icon: 'help-circle',
            color: '#10B981',
            screen: 'DrawerHelp',
            subtitle: 'Besoin d\'aide ?'
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => navigation.getParent()?.dispatch(DrawerActions.openDrawer())} style={styles.menuButton}>
                    <Ionicons name="apps" size={28} color={Colors.primary} />
                </TouchableOpacity>
                {/* Logo centré */}
                <View style={styles.headerCenter}>
                    <Image
                        source={require('../../assets/app_image.png')}
                        style={styles.headerLogo}
                        resizeMode="contain"
                    />
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('PubsNotif', { pubs })}
                    style={styles.notifBtn}
                >
                    <Ionicons name="notifications-outline" size={26} color={Colors.primary} />
                    {pubs.length > 0 && (
                        <View style={styles.notifBadge}>
                            <Text style={styles.notifBadgeText}>{pubs.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.heroCard}>
                    <View style={styles.heroLeft}>
                        <Text style={styles.heroTitle}>Nonvi Voyage Plus</Text><Text style={styles.heroSubtitle}>Votre partenaire de voyage au Bénin</Text>
                    </View>
                    <Ionicons name="navigate-circle" size={80} color="rgba(255,255,255,0.2)" style={styles.heroIcon} />
                </View>

                {pubs.filter(p => p.image).length > 0 && (
                    <View style={styles.pubsSection}>
                        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Actualités & Offres</Text>
                        <ScrollView
                            ref={pubScrollRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={width * 0.78 + 12}
                            snapToAlignment="start"
                            decelerationRate="fast"
                            contentContainerStyle={{ paddingRight: 24 }}
                            scrollEventThrottle={16}
                            onMomentumScrollEnd={(e) => {
                                const idx = Math.round(e.nativeEvent.contentOffset.x / (width * 0.78 + 12));
                                pubIndexRef.current = idx;
                            }}
                        >
                            {[...pubs].filter(p => p.image).sort((a, b) => b.id - a.id).map((pub, index) => (
                                <View key={index} style={styles.pubCard}>
                                    <Image
                                        source={{ uri: `http://192.168.123.181:8000/storage/${pub.image}` }}
                                        style={styles.pubImage}
                                    />
                                    <View style={styles.pubInfo}>
                                        <Text style={styles.pubTitle} numberOfLines={1}>{pub.nom}</Text>{pub.description ? (<Text style={styles.pubDesc} numberOfLines={2}>{pub.description}</Text>) : null}
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.grid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.card}
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name={item.icon} size={28} color={Colors.primary} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                        </TouchableOpacity>
                    ))}
                </View>

                {products.length > 0 && (
                    <View style={styles.productStackSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Santé Plus</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Store')}>
                                <Text style={styles.seeAllText}>Voir tout</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            style={styles.productStackList}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={252}
                            decelerationRate="fast"
                            snapToAlignment="start"
                        >
                            {products.map((item) => {
                                const imgUrl = item.image
                                    ? item.image.startsWith('http')
                                        ? item.image
                                        : `http://192.168.123.181:8000/storage/${item.image}`
                                    : null;
                                return (
                                    <View key={item.id.toString()} style={styles.productStackCard}>
                                        {imgUrl ? (
                                            <Image source={{ uri: imgUrl }} style={styles.productStackImage} />
                                        ) : (
                                            <View style={styles.productStackImagePlaceholder}>
                                                <Ionicons name="cube-outline" size={48} color={Colors.border} />
                                            </View>
                                        )}
                                        <View style={styles.productStackInfo}>
                                            <View style={styles.productStackMeta}>
                                                <Text style={styles.productStackName} numberOfLines={1}>{item.nom}</Text>
                                                <Text style={styles.productStackPrice}>{item.prix} FCFA</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.productStackBtn}
                                                onPress={() => navigation.navigate('ProductDetail', { product: item })}
                                            >
                                                <Text style={styles.productStackBtnText}>Voir le produit</Text>
                                                <Ionicons name="arrow-forward" size={16} color="#FFF" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                    <Ionicons name="call" size={24} color="#FFF" style={{ marginRight: 12 }} />
                    <Text style={styles.callButtonText}>Appeler Nonvi</Text>
                </TouchableOpacity>


            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    topHeader: {
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 8,
        paddingHorizontal: 24,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerLogo: {
        width: 72,
        height: 72,
        borderRadius: 16,
    },
    menuButton: {
        marginRight: 16,
    },
    headerInfo: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
    userName: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    notifBtn: {
        position: 'relative',
        padding: 4,
    },
    notifBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifBadgeText: {
        fontSize: 10,
        fontFamily: 'Poppins_700Bold',
        color: '#FFF',
    },
    scrollContent: {
        padding: 24,
    },
    heroCard: {
        backgroundColor: Colors.primary,
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    heroLeft: {
        flex: 1,
        zIndex: 1,
    },
    heroTitle: {
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        color: '#FFF',
    },
    heroSubtitle: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    heroIcon: {
        position: 'absolute',
        right: -10,
        bottom: -10,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.secondary,
    },
    pubsSection: {
        marginBottom: 24,
        overflow: 'visible',
    },
    pubCard: {
        width: width * 0.78,
        marginRight: 12,
    },
    pubImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 20,
    },
    pubInfo: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    pubTitle: {
        fontSize: 14,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    pubDesc: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        marginTop: 2,
        lineHeight: 17,
    },
    grid: {
        marginBottom: 24,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 1,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        backgroundColor: Colors.secondary + '15', // Fond marron très clair
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
    },
    cardSubtitle: {
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
    callButton: {
        backgroundColor: Colors.secondary,
        borderRadius: 16,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    callButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    footerInfo: {
        marginTop: 32,
        alignItems: 'center',
        opacity: 0.5,
    },
    footerText: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
    productStackSection: {
        marginBottom: 24,
    },
    productStackList: {
        height: 292,           // carte 240px + gap 12px + peek 40px
        overflow: 'hidden',
    },
    productStackCard: {
        height: 240,           // hauteur réduite pour que la suivante dépasse
        borderRadius: 20,
        backgroundColor: Colors.surface,
        overflow: 'hidden',
        flexDirection: 'row',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        marginBottom: 12,      // espace + peek visible
    },
    productStackImage: {
        width: 140,
        height: '100%',
    },
    productStackImagePlaceholder: {
        width: 140,
        height: '100%',
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productStackInfo: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    productStackMeta: {
        flex: 1,
        justifyContent: 'center',
    },
    productStackName: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginBottom: 8,
    },
    productStackPrice: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        color: Colors.secondary,
    },
    productStackBtn: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
    },
    productStackBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
    },
});

export default HomeScreen;
