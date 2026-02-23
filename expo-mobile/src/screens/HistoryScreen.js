import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Platform,
    StatusBar
} from 'react-native';
import client from '../api/client';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect, DrawerActions } from '@react-navigation/native';

const HistoryScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('transport'); // 'transport' or 'orders'
    const [transports, setTransports] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [transRes, ordRes] = await Promise.all([
                client.get('/transport'),
                client.get('/commandes')
            ]);
            setTransports(transRes.data);
            setOrders(ordRes.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirme':
            case 'paye':
            case 'termine':
                return '#10B981';
            case 'en_attente':
                return '#F59E0B';
            case 'annule':
                return '#EF4444';
            default:
                return Colors.primary;
        }
    };

    const getStatusLabel = (status, type = 'transport') => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'confirme': return 'Confirmé';
            case 'paye': return 'Payé';
            case 'termine': return 'Terminé';
            case 'en_attente': return type === 'transport' ? 'À Venir' : 'En attente';
            case 'annule': return 'Annulé';
            default: return status;
        }
    };

    const renderTransportItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Receipt', { reservation: item })} activeOpacity={0.7}><View style={styles.cardHeader}><View style={styles.iconBg}><Ionicons name="bus" size={24} color={Colors.primary} /></View><View style={styles.headerInfoStyle}><Text style={styles.routeText}>{`${item.station_depart?.nom || ""} ➔ ${item.station_arrivee?.nom || ""}`}</Text><Text style={styles.dateText}>{`Code: ${item.tickets?.[0]?.code || "---"} • ${item.heure_depart?.substring(0, 5) || ""} • ${new Date(item.created_at).toLocaleDateString('fr-FR')}`}</Text></View><View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) + '15' }]}><Text style={[styles.statusText, { color: getStatusColor(item.statut) }]}>{getStatusLabel(item.statut, 'transport')}</Text></View></View><View style={styles.cardFooter}><View style={styles.deliveryInfo}><Text style={styles.detailsText}>{`${item.nombre_tickets} ticket(s) • ${item.moyen_paiement}`}</Text></View><Text style={styles.priceText}>{`${item.prix} CFA`}</Text></View></TouchableOpacity>
    );

    const renderOrderItem = ({ item }) => (
        <View style={styles.card}><View style={styles.cardHeader}><View style={[styles.iconBg, { backgroundColor: '#E1F5FE' }]}><Ionicons name="basket" size={24} color="#0288D1" /></View><View style={styles.headerInfo}><Text style={styles.routeText}>{`Commande #${item.id}`}</Text><Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text></View><View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) + '15' }]}><Text style={[styles.statusText, { color: getStatusColor(item.statut) }]}>{getStatusLabel(item.statut, 'order')}</Text></View></View><View style={styles.itemsList}>{(item.items || []).map((subItem, idx) => (<View key={idx} style={styles.itemRow}><View style={styles.itemDot} /><View style={styles.itemInfo}><Text><Text style={styles.itemName}>{subItem.produit?.nom || ""}</Text><Text style={styles.itemQty}>{`  x${subItem.quantite}`}</Text></Text></View><Text style={styles.itemPrice}>{`${Number(subItem.prix_unitaire) * Number(subItem.quantite)} CFA`}</Text></View>))}</View><View style={styles.cardFooter}><View style={styles.deliveryInfo}><Ionicons name="business-outline" size={14} color={Colors.textLight} /><Text style={styles.detailsText}>Retrait en station</Text></View><Text style={styles.priceText}>{`${item.prix_total} CFA`}</Text></View></View>
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
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => navigation.getParent()?.dispatch(DrawerActions.openDrawer())} style={styles.menuButton}>
                    <Ionicons name="apps" size={28} color={Colors.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.welcomeText}>Activités</Text>
                    <Text style={styles.userName}>Historique</Text>
                </View>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'transport' && styles.activeTab]}
                    onPress={() => setActiveTab('transport')}
                >
                    <Text style={[styles.tabText, activeTab === 'transport' && styles.activeTabText]}>Réservations</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
                    onPress={() => setActiveTab('orders')}
                >
                    <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Boutique</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={activeTab === 'transport' ? transports : orders}
                renderItem={activeTab === 'transport' ? renderTransportItem : renderOrderItem}
                keyExtractor={item => `${activeTab}-${item.id}`}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="calendar-outline" size={80} color={Colors.border} /><Text style={styles.emptyText}>Aucun historique trouvé</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    refreshBtn: {
        padding: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        padding: 5,
        margin: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: Colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'Poppins_500Medium',
        color: Colors.textLight,
    },
    activeTabText: {
        color: '#FFF',
        fontFamily: 'Poppins_600SemiBold',
    },
    list: { paddingHorizontal: 20, paddingBottom: 40 },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: Colors.secondary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerInfoStyle: { flex: 1 }, // Changed from headerInfo to avoid conflict
    routeText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
    dateText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textLight },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 11, fontFamily: 'Poppins_700Bold' },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 12,
    },
    detailsText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textLight, marginLeft: 6 },
    priceText: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    itemsList: {
        marginBottom: 15,
        paddingHorizontal: 4,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.secondary,
        marginRight: 10,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 13,
        fontFamily: 'Poppins_500Medium',
        color: Colors.text,
    },
    itemQty: {
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
        color: Colors.textLight,
    },
    itemPrice: {
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, color: Colors.textLight, fontFamily: 'Poppins_400Regular' }
});

export default HistoryScreen;
