import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Platform,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import Colors from '../theme/Colors';

const StationsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [groupedStations, setGroupedStations] = useState([]);

    const fetchStations = async () => {
        try {
            const response = await client.get('/stations');
            const stations = response.data.data || response.data;

            // Group stations by city
            const grouped = stations.reduce((acc, station) => {
                const city = station.ville || 'Inconnu';
                if (!acc[city]) {
                    acc[city] = [];
                }
                acc[city].push(station);
                return acc;
            }, {});

            // Convert to array for FlatList
            const groupedArray = Object.keys(grouped).sort().map(city => ({
                city,
                stations: grouped[city]
            }));

            setGroupedStations(groupedArray);
        } catch (error) {
            console.error('Fetch stations failed:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStations();
    };

    const renderCityGroup = ({ item }) => (
        <View style={styles.citySection}>
            <View style={styles.cityHeader}>
                <Ionicons name="location" size={20} color={Colors.secondary} />
                <Text style={styles.cityTitle}>{item.city}</Text>
            </View>
            <View style={styles.stationsList}>
                {item.stations.map((station, index) => (
                    <View key={station.id} style={[
                        styles.stationItem,
                        index === item.stations.length - 1 && { borderBottomWidth: 0 }
                    ]}>
                        <View style={styles.stationInfo}>
                            <Text style={styles.stationName}>{station.nom}</Text>
                            <Text style={styles.stationDetail}>Point de retrait & embarquement disponible</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.secondary} />
                </View>
            ) : (
                <FlatList
                    data={groupedStations}
                    keyExtractor={(item) => item.city}
                    renderItem={renderCityGroup}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.secondary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="map-outline" size={60} color={Colors.border} />
                            <Text style={styles.emptyText}>Aucune station trouvée</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    citySection: {
        marginBottom: 25,
    },
    cityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    cityTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    stationsList: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    stationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.background,
    },
    stationInfo: {
        flex: 1,
    },
    stationName: {
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
    },
    stationDetail: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        marginTop: 2,
    },
    emptyContainer: {
        paddingTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 15,
        fontSize: 15,
        fontFamily: 'Poppins_500Medium',
        color: Colors.textLight,
    },
});

export default StationsScreen;
