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
    StatusBar,
    SafeAreaView
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

    // Multi-selection states
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);

    const fetchReservations = async () => {
        try {
            const response = await client.get('/admin/reservations');
            setReservations(response.data.data || response.data);
            setSelectedIds([]);
            setSelectionMode(false);
        } catch (e) {
            console.error(e);
            Alert.alert('Erreur', 'Impossible de charger les réservations');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const toggleSelection = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                const updated = prev.filter(i => i !== id);
                if (updated.length === 0) setSelectionMode(false);
                return updated;
            } else {
                return [...prev, id];
            }
        });
    };

    const selectEnTrajet = () => {
        const enTrajetIds = reservations
            .filter(r => r.statut === 'en_trajet')
            .map(r => r.id);

        if (enTrajetIds.length === 0) {
            Alert.alert('Info', 'Aucune réservation "En trajet" à sélectionner.');
            return;
        }

        setSelectionMode(true);
        setSelectedIds(enTrajetIds);
    };

    const handleBulkComplete = async () => {
        if (selectedIds.length === 0) return;

        Alert.alert(
            'Action groupée',
            `Marquer ${selectedIds.length} réservation(s) comme TERMINÉES ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Confirmer',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await client.post('/admin/reservations/bulk-status', {
                                ids: selectedIds,
                                statut: 'termine'
                            });
                            fetchReservations();
                        } catch (e) {
                            Alert.alert('Erreur', 'L\'opération a échoué');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

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

    const renderItem = ({ item }) => {
        const isSelected = selectedIds.includes(item.id);

        return (
            <TouchableOpacity
                style={[styles.card, isSelected && styles.selectedCard]}
                onLongPress={() => {
                    if (!selectionMode) {
                        setSelectionMode(true);
                        toggleSelection(item.id);
                    }
                }}
                onPress={() => {
                    if (selectionMode) {
                        toggleSelection(item.id);
                    } else if (canShow || canEdit) {
                        setSelectedRes(item);
                        setModalVisible(true);
                    }
                }}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        {selectionMode && (
                            <Ionicons
                                name={isSelected ? "checkbox" : "square-outline"}
                                size={24}
                                color={isSelected ? Colors.secondary : Colors.textLight}
                                style={{ marginRight: 12 }}
                            />
                        )}
                        <Text style={styles.clientName} numberOfLines={1}>
                            {item.user?.name || item.client?.nom || 'Client Inconnu'}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.statut) }]}>
                            {item.statut === 'en_attente' ? 'À VENIR' : item.statut === 'en_trajet' ? 'EN TRAJET' : item.statut}
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

                {!selectionMode && canDelete && (
                    <View style={styles.cardFooter}>
                        <TouchableOpacity onPress={() => deleteReservation(item.id)} style={styles.actionBtn}>
                            <Ionicons name="trash-outline" size={20} color={Colors.error} />
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'en_attente': return Colors.warning;
            case 'confirme': return Colors.success;
            case 'en_trajet': return '#2196F3';
            case 'annule': return Colors.error;
            case 'termine': return Colors.primary;
            default: return Colors.textLight;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <SafeAreaView style={{ backgroundColor: Colors.surface }}>
                <View style={styles.topHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.welcomeText}>Administration</Text>
                        <Text style={styles.userName}>Réservations</Text>
                    </View>
                    <View style={styles.headerActions}>
                        {!selectionMode && (
                            <TouchableOpacity onPress={selectEnTrajet} style={styles.bulkIconBtn}>
                                <Ionicons name="copy-outline" size={20} color={Colors.secondary} />
                                <Text style={styles.bulkIconText}>Sélection</Text>
                            </TouchableOpacity>
                        )}
                        {selectionMode ? (
                            <TouchableOpacity
                                onPress={() => { setSelectionMode(false); setSelectedIds([]); }}
                                style={styles.cancelBtn}
                            >
                                <Text style={styles.cancelText}>Annuler</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={fetchReservations} style={styles.refreshBtn}>
                                <Ionicons name="refresh" size={22} color={Colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </SafeAreaView>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.secondary} />
                </View>
            ) : (
                <FlatList
                    data={reservations}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    onRefresh={fetchReservations}
                    refreshing={refreshing}
                    extraData={selectedIds}
                    ListEmptyComponent={<Text style={styles.empty}>Aucune réservation trouvée</Text>}
                />
            )}

            {selectionMode && (
                <View style={styles.bulkActionContainer}>
                    <TouchableOpacity style={styles.bulkActionBtn} onPress={handleBulkComplete}>
                        <Ionicons name="checkmark-done" size={24} color="#FFF" />
                        <Text style={styles.bulkActionText}>Marquer comme Terminé ({selectedIds.length})</Text>
                    </TouchableOpacity>
                </View>
            )}

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
                            <View style={styles.modalBody}>
                                <TouchableOpacity
                                    style={[styles.statusButton, { backgroundColor: Colors.warning + '15' }]}
                                    onPress={() => updateStatus(selectedRes?.id, 'en_attente')}
                                >
                                    <View style={styles.statusDot(Colors.warning)} />
                                    <Text style={[styles.statusButtonText, { color: Colors.warning }]}>À venir</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.statusButton, { backgroundColor: Colors.success + '15' }]}
                                    onPress={() => updateStatus(selectedRes?.id, 'confirme')}
                                >
                                    <View style={styles.statusDot(Colors.success)} />
                                    <Text style={[styles.statusButtonText, { color: Colors.success }]}>Confirmer</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.statusButton, { backgroundColor: Colors.primary + '15' }]}
                                    onPress={() => updateStatus(selectedRes?.id, 'termine')}
                                >
                                    <View style={styles.statusDot(Colors.primary)} />
                                    <Text style={[styles.statusButtonText, { color: Colors.primary }]}>Terminer</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.statusButton, { backgroundColor: Colors.error + '15' }]}
                                    onPress={() => updateStatus(selectedRes?.id, 'annule')}
                                >
                                    <View style={styles.statusDot(Colors.error)} />
                                    <Text style={[styles.statusButtonText, { color: Colors.error }]}>Annuler</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ color: Colors.textLight, textAlign: 'center' }}>
                                    Lecture seule
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
        paddingHorizontal: 24,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
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
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bulkIconBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: Colors.secondary + '15',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    bulkIconText: {
        fontSize: 12,
        color: Colors.secondary,
        fontFamily: 'Poppins_600SemiBold',
        marginLeft: 5,
    },
    cancelBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: Colors.error + '15',
        borderRadius: 8,
    },
    cancelText: {
        color: Colors.error,
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 13,
    },
    refreshBtn: {
        padding: 8,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: Colors.secondary,
        backgroundColor: Colors.secondary + '05',
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
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.text,
        marginLeft: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    actionBtn: {
        padding: 8,
    },
    empty: {
        textAlign: 'center',
        marginTop: 60,
        color: Colors.textLight,
        fontFamily: 'Poppins_400Regular',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginBottom: 25,
        textAlign: 'center',
    },
    modalBody: {
        gap: 12,
    },
    statusButton: {
        padding: 18,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: (color) => ({
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        marginRight: 15,
    }),
    statusButtonText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    closeButton: {
        marginTop: 20,
        padding: 16,
        alignItems: 'center',
    },
    closeButtonText: {
        color: Colors.textLight,
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 15,
    },
    bulkActionContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        zIndex: 100,
    },
    bulkActionBtn: {
        backgroundColor: Colors.secondary,
        padding: 20,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    bulkActionText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        marginLeft: 12,
    }
});

export default AdminReservationScreen;
