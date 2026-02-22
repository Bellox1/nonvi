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
    Platform,
    StatusBar
} from 'react-native';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const AdminReservationScreen = ({ navigation }) => {
    const { hasPermission } = useAuth();
    const canShow = hasPermission('reservation_show');
    const canEdit = hasPermission('reservation_edit');
    const canDelete = hasPermission('reservation_delete');

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRes, setSelectedRes] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchReservations = async () => {
        try {
            const response = await client.get('/admin/reservations');
            setReservations(response.data.data);
        } catch (e) {
            Alert.alert('Erreur', 'Impossible de charger les réservations');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            await client.patch(`/admin/reservations/${id}/status`, { statut: newStatus });
            Alert.alert('Succès', 'Statut mis à jour');
            setModalVisible(false);
            fetchReservations();
        } catch (e) {
            Alert.alert('Erreur', 'Mise à jour échouée');
        }
    };

    const deleteReservation = (id) => {
        Alert.alert(
            'Confirmation',
            'Voulez-vous vraiment supprimer cette réservation ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.delete(`/admin/reservations/${id}`);
                            fetchReservations();
                        } catch (e) {
                            Alert.alert('Erreur', 'Suppression échouée');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                if (canShow || canEdit) {
                    setSelectedRes(item);
                    setModalVisible(true);
                }
            }}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.clientName}>{item.user?.name || item.client?.nom || 'Client Inconnu'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.statut) }]}>
                        {item.statut === 'en_attente' ? 'À VENIR' : item.statut}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color={Colors.textLight} />
                    <Text style={styles.infoText}>{item.station_depart?.nom} → {item.station_arrivee?.nom}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.textLight} />
                    <Text style={styles.infoText}>{new Date(item.created_at).toLocaleString('fr-FR')}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="key-outline" size={16} color={Colors.textLight} />
                    <Text style={styles.infoText}>{`Code: ${item.tickets?.[0]?.code || "---"}`}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="ticket-outline" size={16} color={Colors.textLight} />
                    <Text style={styles.infoText}>{item.nombre_tickets} ticket(s)</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={16} color={Colors.secondary} />
                    <Text style={[styles.infoText, { color: Colors.secondary, fontFamily: 'Poppins_700Bold' }]}>{item.prix} CFA</Text>
                </View>
            </View>

            {canDelete && (
                <View style={styles.cardFooter}>
                    <TouchableOpacity onPress={() => deleteReservation(item.id)}>
                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'en_attente': return Colors.warning;
            case 'confirme': return Colors.success;
            case 'annule': return Colors.error;
            case 'termine': return Colors.primary;
            default: return Colors.textLight;
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.secondary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.welcomeText}>Administration</Text>
                    <Text style={styles.userName}>Réservations</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={reservations}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                onRefresh={fetchReservations}
                refreshing={refreshing}
                ListEmptyComponent={<Text style={styles.empty}>Aucune réservation trouvée</Text>}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{canEdit ? 'Modifier le statut' : 'Détails de la réservation'}</Text>

                        {canEdit ? (
                            <>
                                <TouchableOpacity
                                    style={[styles.statusButton, { backgroundColor: Colors.warning + '10' }]}
                                    onPress={() => updateStatus(selectedRes?.id, 'en_attente')}
                                >
                                    <Text style={[styles.statusButtonText, { color: Colors.warning }]}>À venir</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.statusButton, { backgroundColor: Colors.success + '10' }]}
                                    onPress={() => updateStatus(selectedRes?.id, 'confirme')}
                                >
                                    <Text style={[styles.statusButtonText, { color: Colors.success }]}>Confirmer</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.statusButton, { backgroundColor: Colors.primary + '10' }]}
                                    onPress={() => updateStatus(selectedRes?.id, 'termine')}
                                >
                                    <Text style={[styles.statusButtonText, { color: Colors.primary }]}>Terminer</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.statusButton, { backgroundColor: Colors.error + '10' }]}
                                    onPress={() => updateStatus(selectedRes?.id, 'annule')}
                                >
                                    <Text style={[styles.statusButtonText, { color: Colors.error }]}>Annuler</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ color: Colors.textLight, textAlign: 'center' }}>
                                    Vous n'avez pas la permission de modifier le statut de cette réservation.
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    topHeader: {
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 15,
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 24,
    },
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    clientName: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontFamily: 'Poppins_700Bold',
        textTransform: 'uppercase',
    },
    cardBody: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.text,
        marginLeft: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: Colors.textLight,
        fontFamily: 'Poppins_400Regular',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    statusButton: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    statusButtonText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    closeButton: {
        marginTop: 10,
        padding: 16,
        alignItems: 'center',
    },
    closeButtonText: {
        color: Colors.textLight,
        fontFamily: 'Poppins_600SemiBold',
    }
});

export default AdminReservationScreen;
