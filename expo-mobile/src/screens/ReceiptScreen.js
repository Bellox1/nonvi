import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
    StatusBar,
    ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import Colors from '../theme/Colors';
import base64 from 'base-64';

const { width } = Dimensions.get('window');

const ReceiptScreen = ({ route, navigation }) => {
    const { reservation } = route.params;
    const [currentIndex, setCurrentIndex] = React.useState(1);
    const totalTickets = parseInt(reservation.nombre_tickets) || 1;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header with Background Gradient Effect */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ticket de Voyage</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.ticketContainer}>
                    {/* Upper Part */}
                    <View style={styles.ticketTop}>
                        <View style={styles.companyInfo}>
                            <Text style={styles.companyName}>NONVI VOYAGE PLUS</Text>
                            <Text style={styles.receiptLabel}>REÇU DE RÉSERVATION</Text>
                        </View>

                        <View style={styles.idRow}>
                            <Text style={styles.idLabel}>{"Code: "}</Text>
                            <Text style={styles.idValue}>{String(reservation.tickets?.[currentIndex - 1]?.code || "---")}</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Route Info */}
                        <View style={styles.routeContainer}>
                            <View style={styles.routeItem}>
                                <Text style={styles.routeLabel}>Départ</Text>
                                <Text style={styles.cityName}>{reservation.station_depart?.ville || '...'}</Text>
                                <Text style={styles.stationName}>{reservation.station_depart?.nom}</Text>
                            </View>

                            <View style={styles.routeIconContainer}>
                                <Ionicons name="bus" size={24} color={Colors.secondary} />
                                <View style={styles.dottedLine} />
                            </View>

                            <View style={[styles.routeItem, { alignItems: 'flex-end' }]}>
                                <Text style={styles.routeLabel}>Arrivée</Text>
                                <Text style={styles.cityName}>{reservation.station_arrivee?.ville || '...'}</Text>
                                <Text style={styles.stationName}>{reservation.station_arrivee?.nom}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Details Grid */}
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Date</Text>
                                <Text style={styles.detailValue}>{formatDate(reservation.date_depart)}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Heure</Text>
                                <Text style={styles.detailValue}>{reservation.heure_depart?.substring(0, 5)}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Billet</Text>
                                <Text style={styles.detailValue}>{currentIndex} / {totalTickets}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Statut</Text>
                                <Text style={[styles.detailValue, {
                                    color: (reservation.tickets?.[currentIndex - 1]?.is_scanned || reservation.is_scanned) ? Colors.error : Colors.success,
                                    fontWeight: '700'
                                }]}>
                                    {(reservation.tickets?.[currentIndex - 1]?.is_scanned || reservation.is_scanned)
                                        ? 'TERMINÉ'
                                        : (reservation.statut === 'en_attente'
                                            ? 'À VENIR'
                                            : (reservation.statut === 'confirme' ? 'CONFIRMÉ' : (reservation.statut === 'paye' ? 'PAYÉ' : reservation.statut.toUpperCase()))
                                        )
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Jagged Divider Effect */}
                    <View style={styles.jaggedContainer}>
                        <View style={styles.sideCuts} />
                        <View style={styles.dashedTicketDivider} />
                        <View style={[styles.sideCuts, { right: -15 }]} />
                    </View>

                    {/* Bottom Part (QR Code) */}
                    <View style={styles.ticketBottom}>
                        <View style={[styles.qrContainer, !!(reservation.tickets?.[currentIndex - 1]?.is_scanned || reservation.is_scanned) && styles.qrContainerDisabled]}>
                            <QRCode
                                value={`NVT_SECURE_v1:${base64.encode("NV_HASH_92_" + (reservation.tickets?.[currentIndex - 1]?.code || reservation.qr_code || "INVALID") + "_31_NONVI")}`}
                                size={200}
                                color={Colors.primary}
                                backgroundColor="#FFF"
                            />
                            {!!(reservation.tickets?.[currentIndex - 1]?.is_scanned || reservation.is_scanned) && (
                                <View style={styles.scannedOverlay}>
                                    <View style={styles.scannedBadge}><Ionicons name="checkmark-circle" size={24} color="#FFF" /><Text style={styles.scannedText}>DÉJÀ UTILISÉ</Text></View>
                                </View>
                            )}
                        </View>
                        <Text style={styles.qrInstructions}>{reservation.is_scanned ? 'Ce ticket a déjà été scanné et utilisé pour un voyage.' : 'Présentez ce code à l\'agent de la station pour l\'embarquement.'}</Text>
                        <Text style={styles.qrNote}>
                            Code à usage unique.
                        </Text>

                        <View style={styles.totalSection}>
                            <Text style={styles.totalLabel}>Total Payé</Text>
                            <Text style={styles.totalValue}>{`${reservation.prix} CFA`}</Text>
                        </View>
                    </View>

                    {totalTickets > 1 && (
                        <View style={styles.navigationContainer}>
                            <TouchableOpacity
                                style={[styles.navButton, currentIndex === 1 && styles.navButtonDisabled]}
                                onPress={() => setCurrentIndex(prev => Math.max(1, prev - 1))}
                                disabled={currentIndex === 1}
                            >
                                <Ionicons name="chevron-back" size={20} color={currentIndex === 1 ? Colors.textLight : Colors.primary} />
                                <Text style={[styles.navButtonText, currentIndex === 1 && { color: Colors.textLight }]}>Précédent</Text>
                            </TouchableOpacity>

                            <Text style={styles.navCount}>{currentIndex} / {totalTickets}</Text>

                            <TouchableOpacity
                                style={[styles.navButton, currentIndex === totalTickets && styles.navButtonDisabled]}
                                onPress={() => setCurrentIndex(prev => Math.min(totalTickets, prev + 1))}
                                disabled={currentIndex === totalTickets}
                            >
                                <Text style={[styles.navButtonText, currentIndex === totalTickets && { color: Colors.textLight }]}>Suivant</Text>
                                <Ionicons name="chevron-forward" size={20} color={currentIndex === totalTickets ? Colors.textLight : Colors.primary} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => navigation.navigate('Drawer', { screen: 'MainTabs', params: { screen: 'History' } })}
                >
                    <Text style={styles.doneButtonText}>Voir l'historique</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={() => navigation.navigate('Drawer', { screen: 'MainTabs', params: { screen: 'Home' } })}
                >
                    <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_600SemiBold',
        color: '#FFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    ticketContainer: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    ticketTop: {
        padding: 24,
    },
    companyInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    companyName: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    receiptLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
        color: Colors.secondary,
        letterSpacing: 1,
    },
    idRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    idLabel: {
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
    idValue: {
        fontSize: 13,
        fontFamily: 'Poppins_700Bold',
        color: Colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 15,
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    routeItem: {
        flex: 1,
    },
    routeLabel: {
        fontSize: 11,
        fontFamily: 'Poppins_500Medium',
        color: Colors.textLight,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    cityName: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    stationName: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
    routeIconContainer: {
        width: 50,
        alignItems: 'center',
    },
    dottedLine: {
        width: 1,
        height: 20,
        borderStyle: 'dotted',
        borderWidth: 1,
        borderColor: Colors.border,
        marginTop: 5,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    detailItem: {
        width: '50%',
        marginBottom: 15,
    },
    detailLabel: {
        fontSize: 11,
        fontFamily: 'Poppins_500Medium',
        color: Colors.textLight,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
        marginTop: 2,
    },
    jaggedContainer: {
        height: 30,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sideCuts: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.primary,
        left: -15,
    },
    dashedTicketDivider: {
        flex: 1,
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#DDD',
        marginHorizontal: 20,
    },
    ticketBottom: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    qrContainer: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 20,
    },
    qrInstructions: {
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
        color: Colors.text,
        textAlign: 'center',
        lineHeight: 20,
    },
    qrNote: {
        fontSize: 11,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.secondary,
        marginTop: 6,
    },
    totalSection: {
        width: '100%',
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    totalLabel: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.text,
    },
    totalValue: {
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    doneButton: {
        backgroundColor: Colors.secondary,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        width: '100%',
    },
    doneButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    homeButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        width: '100%',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    homeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    qrContainerDisabled: {
        opacity: 0.5,
    },
    scannedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    scannedBadge: {
        backgroundColor: Colors.error,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        transform: [{ rotate: '-15deg' }],
    },
    scannedText: {
        color: '#FFF',
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
        marginLeft: 6,
    },
    navigationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    navButtonText: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
        marginHorizontal: 8,
    },
    navCount: {
        fontSize: 15,
        fontFamily: 'Poppins_700Bold',
        color: Colors.secondary,
    },
});

export default ReceiptScreen;
