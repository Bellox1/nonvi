import React from 'react';
import {
    View, Text, StyleSheet, FlatList, Image,
    TouchableOpacity, Platform, StatusBar, Dimensions
} from 'react-native';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PubsNotifScreen = ({ route, navigation }) => {
    // Toutes les pubs passées depuis HomeScreen, triées du plus récent au plus ancien
    const rawPubs = route?.params?.pubs || [];
    const pubs = [...rawPubs].sort((a, b) => b.id - a.id); // plus grand id = plus récent

    const renderItem = ({ item }) => {
        const imgUrl = item.image
            ? `http://192.168.123.181:8000/storage/${item.image}`
            : null;

        return (
            <View style={styles.card}>
                {imgUrl && (
                    <Image
                        source={{ uri: imgUrl }}
                        style={styles.cardImage}
                        resizeMode="cover"
                    />
                )}
                <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{item.nom}</Text>
                    {item.description ? (
                        <Text style={styles.cardDesc}>{item.description}</Text>
                    ) : null}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Actualités & Offres</Text>
                <View style={{ width: 40 }} />
            </View>

            {pubs.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="notifications-off-outline" size={64} color={Colors.border} />
                    <Text style={styles.emptyText}>Aucune annonce disponible</Text>
                </View>
            ) : (
                <FlatList
                    data={pubs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
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
    header: {
        paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24) + 8,
        paddingHorizontal: 20,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        justifyContent: 'space-between',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    list: {
        padding: 16,
        gap: 16,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
    },
    cardImage: {
        width: '100%',
        aspectRatio: 1,
    },
    cardBody: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginBottom: 6,
    },
    cardDesc: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        lineHeight: 21,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
});

export default PubsNotifScreen;
