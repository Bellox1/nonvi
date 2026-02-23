import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, icon, bgColor = Colors.secondary, fullWidth = false }) => (
    <View style={[
        styles.statCard,
        { backgroundColor: bgColor, shadowColor: bgColor },
        fullWidth && { width: '100%' }
    ]}>
        <View style={fullWidth ? { flexDirection: 'row', alignItems: 'center', gap: 20 } : null}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={22} color="#FFF" />
            </View>
            <View style={styles.statInfo}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </View>
    </View>
);

const ModuleCard = ({ title, icon, onPress }) => (
    <TouchableOpacity style={styles.moduleCard} onPress={onPress}>
        <View style={styles.moduleIcon}>
            <Ionicons name={icon} size={22} color={Colors.primary} />
        </View>
        <Text style={styles.moduleTitle} numberOfLines={1}>{title}</Text>
    </TouchableOpacity>
);

const AdminDashboardScreen = () => {
    const navigation = useNavigation();
    const { hasPermission, refreshUser } = useAuth();
    const openDrawer = () => navigation.getParent()?.dispatch(DrawerActions.openDrawer());

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);

    const fetchStats = async () => {
        try {
            const response = await client.get('/admin/stats');
            setData(response.data);
        } catch (error) {
            if (error.response?.status === 403) {
                navigation.navigate('MainTabs', { screen: 'Home' });
            }
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };



    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                fetchStats(),
                refreshUser()
            ]);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            onRefresh();
        }, [])
    );

    return (
        <View style={styles.safeArea}>
            {/* Custom Header */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
                    <Ionicons name="apps" size={28} color={Colors.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.welcomeText}>Administration</Text>
                    <Text style={styles.userName}>Tableau de Bord</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.secondary} />
                </View>
            ) : (
                <ScrollView
                    style={styles.container}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* Scanner Flash - Priorité Haute */}
                    {hasPermission('reservation_access') && (
                        <TouchableOpacity
                            style={styles.scannerHero}
                            onPress={() => navigation.navigate('AdminScanner')}
                        >
                            <View style={styles.scannerHeroContent}>
                                <View style={styles.scannerHeroIcon}>
                                    <Ionicons name="scan-circle" size={40} color="#FFF" />
                                </View>
                                <View>
                                    <Text style={styles.scannerHeroTitle}>Scanner un Ticket</Text>
                                    <Text style={styles.scannerHeroSubtitle}>Valider l'embarquement client</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                        </TouchableOpacity>
                    )}

                    {/* Statistiques */}
                    <View style={styles.statsGrid}>
                        <StatCard title="Réservations" value={data?.stats?.total_reservations || 0} icon="car" />
                        <StatCard title="En attente" value={data?.stats?.pending_reservations || 0} icon="time" />
                        {hasPermission('produit_access') && <StatCard title="Produits" value={data?.stats?.total_products || 0} icon="basket" />}
                        {hasPermission('client_access') && <StatCard title="Clients" value={data?.stats?.total_clients || 0} icon="person-add" />}
                        {hasPermission('revenue_show') && <StatCard title="Revenus" value={`${data?.stats?.revenue || 0} CFA`} icon="wallet" bgColor={Colors.tertiary} fullWidth={true} />}
                    </View>

                    {/* Modules */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Modules de Gestion</Text>
                        <View style={styles.moduleGrid}>
                            {hasPermission('station_access') && <ModuleCard title="Stations" icon="location" onPress={() => navigation.navigate('AdminStations')} />}
                            {hasPermission('produit_access') && <ModuleCard title="Produits" icon="cart" onPress={() => navigation.navigate('AdminProducts')} />}
                            {hasPermission('client_access') && <ModuleCard title="Clients" icon="people" onPress={() => navigation.navigate('AdminClients')} />}
                            {hasPermission('coli_access') && <ModuleCard title="Colis" icon="cube" onPress={() => navigation.navigate('AdminColis')} />}
                            {hasPermission('user_access') && <ModuleCard title="Comptes" icon="person-add" onPress={() => navigation.navigate('AdminUsers')} />}
                            {hasPermission('reservation_access') && <ModuleCard title="Réservations" icon="book" onPress={() => navigation.navigate('AdminReservations')} />}
                            {hasPermission('role_access') && <ModuleCard title="Rôles" icon="shield-checkmark" onPress={() => navigation.navigate('AdminRoles')} />}
                            {hasPermission('audit_log_access') && <ModuleCard title="Logs" icon="list" onPress={() => navigation.navigate('AdminLogs')} />}
                            {hasPermission('setting_access') && <ModuleCard title="Tarification" icon="cash" onPress={() => navigation.navigate('AdminTarifs')} />}
                            {hasPermission('pub_access') && <ModuleCard title="Publicités" icon="megaphone" onPress={() => navigation.navigate('AdminPubs')} />}
                        </View>
                    </View>

                    {/* Réservations récentes */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Dernières Réservations</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('AdminReservations')}>
                                <Text style={styles.seeAll}>Toutes</Text>
                            </TouchableOpacity>
                        </View>

                        {data?.recent_reservations?.map((item) => (
                            <View key={item.id} style={styles.recentItem}>
                                <View style={styles.recentHeader}>
                                    <Text style={styles.clientName}>
                                        {item.user?.name || item.client?.nom || 'Client Inconnu'}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: item.statut === 'en_attente' ? Colors.warning + '20' : Colors.success + '20' }]}>
                                        <Text style={[styles.statusText, { color: item.statut === 'en_attente' ? Colors.warning : Colors.success }]}>
                                            {item.statut === 'en_attente' ? 'À VENIR' : item.statut}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.routeText}>{item.station_depart?.nom} → {item.station_arrivee?.nom}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    topBar: {
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 15,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    menuBtn: {
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
    container: { flex: 1, backgroundColor: Colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 16, justifyContent: 'space-between' },
    statCard: { backgroundColor: Colors.secondary, width: '47%', padding: 16, borderRadius: 20, marginBottom: 16, elevation: 4, shadowColor: Colors.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    statInfo: { marginTop: 10 },
    statValue: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
    statTitle: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' },

    section: { paddingHorizontal: 20, paddingTop: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, marginBottom: 12 },
    seeAll: { color: Colors.secondary, fontWeight: '600' },

    moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    moduleCard: { backgroundColor: Colors.surface, width: '47%', padding: 14, borderRadius: 15, marginBottom: 14, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
    moduleIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: Colors.secondary + '12', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    moduleTitle: { fontSize: 12, fontWeight: '600', color: Colors.primary, flex: 1 },

    recentItem: { backgroundColor: Colors.surface, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
    recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    clientName: { fontSize: 15, fontWeight: '600', color: Colors.primary },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    routeText: { fontSize: 13, color: Colors.text },

    // Hero Scanner Style
    scannerHero: {
        backgroundColor: Colors.primary,
        margin: 16,
        padding: 24,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    scannerHeroContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scannerHeroIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    scannerHeroTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: '#FFF',
    },
    scannerHeroSubtitle: {
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
        color: 'rgba(255,255,255,0.7)',
    },
});

export default AdminDashboardScreen;
