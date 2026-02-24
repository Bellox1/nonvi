// Native Integration with Expo WebBrowser (Pretty native window)
import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, Dimensions, Modal, FlatList,
    Platform,
    Linking,
    Image,
    StatusBar,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import client from '../api/client';
import Colors from '../theme/Colors';
import { MapPin, ArrowDown, Ticket, ChevronRight, X, Check } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast, { useToast } from '../components/Toast';
import { useFocusEffect, DrawerActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const TransportScreen = ({ navigation }) => {
    const { toastRef, showToast } = useToast();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [startCity, setStartCity] = useState('');
    const [endCity, setEndCity] = useState('');
    const [startStation, setStartStation] = useState('');
    const [endStation, setEndStation] = useState('');
    const [numTickets, setNumTickets] = useState('1');
    const [cities, setCities] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(0);

    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerType, setPickerType] = useState('');

    const [availability, setAvailability] = useState({});
    const [busCapacity, setBusCapacity] = useState(50);
    const [loadingAvailability, setLoadingAvailability] = useState(false);

    const fetchAvailability = async () => {
        if (!selectedDate || !startStation) return;
        setLoadingAvailability(true);
        try {
            const res = await client.get('/transport/availability', {
                params: { date: selectedDate, station_id: startStation }
            });
            setAvailability(res.data.availability || {});
            setBusCapacity(res.data.capacity || 50);
        } catch (e) {
            console.error('Error fetching availability:', e);
        } finally {
            setLoadingAvailability(false);
        }
    };

    useEffect(() => {
        if (selectedDate && startStation) {
            fetchAvailability();
        }
    }, [selectedDate, startStation]);

    const getLocalDateString = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    useEffect(() => {
        const available = getAvailableDates();
        if (available.length > 0) {
            setSelectedDate(available[0].value);
        }
    }, []);

    const fetchStations = async () => {
        try {
            const [stationsRes, priceRes] = await Promise.all([
                client.get('/stations'),
                client.get('/admin/settings/price')
            ]);
            setStations(stationsRes.data);
            if (priceRes.data && priceRes.data.prix) {
                setCurrentPrice(parseFloat(priceRes.data.prix));
            }
            const uniqueCities = [...new Set(stationsRes.data.map(s => s.ville))].sort();
            setCities(uniqueCities);

            if (stationsRes.data.length >= 2) {
                const s1 = stationsRes.data[0];
                const s2 = stationsRes.data.find(s => s.id !== s1.id) || stationsRes.data[1];
                setStartCity(s1.ville); setStartStation(s1.id.toString());
                setEndCity(s2.ville); setEndStation(s2.id.toString());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => {
        fetchStations();
        fetchAvailability();
    }, [selectedDate, startStation]));

    const calculateTotal = () => currentPrice * parseInt(numTickets);

    const handleOrder = async () => {
        if (startStation === endStation) {
            showToast('Le départ et l\'arrivée doivent être différents', 'error');
            return;
        }

        if (!selectedTime) {
            showToast('Veuillez choisir une heure de départ', 'error');
            return;
        }

        // Setup listener to auto-close browser
        const subscription = Linking.addEventListener('url', (event) => {
            if (event.url.includes('nonvi://')) {
                WebBrowser.dismissBrowser();
            }
        });

        setSubmitting(true);
        try {
            const response = await client.post('/transport', {
                station_depart_id: startStation,
                station_arrivee_id: endStation,
                nombre_tickets: numTickets,
                date_depart: selectedDate,
                heure_depart: selectedTime,
                moyen_paiement: 'Portefeuille'
            });

            if (response.data && response.data.checkout_url) {
                showToast('Chargement du paiement...', 'success');

                // Open PRETTY Native Browser
                await WebBrowser.openBrowserAsync(response.data.checkout_url, {
                    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
                    toolbarColor: Colors.primary,
                    controlsColor: '#FFF',
                });

                // When we reach here, browser is closed (either by user or by dismissBrowser)
                subscription.remove();

                setSubmitting(true);
                const statusRes = await client.get(`/transport`);
                const latest = statusRes.data[0];
                if (latest && latest.payment_id === response.data.transaction_id && latest.payment_status === 'paid') {
                    showToast('Paiement réussi !', 'success');
                    navigation.navigate('Receipt', { reservation: latest });
                } else {
                    showToast('Paiement annulé', 'warning');
                    // We stay on the screen so user can try again or adjust
                }
            }
        } catch (e) {
            subscription.remove();
            const errorMsg = e.response?.data?.message || 'Une erreur est survenue lors de la réservation';
            showToast(errorMsg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const openPicker = (type) => {
        setPickerType(type);
        setPickerVisible(true);
        if (type === 'time') {
            fetchAvailability();
        }
    };

    const selectItem = (value) => {
        if (pickerType === 'city_start') {
            setStartCity(value);
            const first = stations.find(s => s.ville === value && s.id.toString() !== endStation);
            setStartStation(first ? first.id.toString() : '');
        } else if (pickerType === 'city_end') {
            setEndCity(value);
            const first = stations.find(s => s.ville === value && s.id.toString() !== startStation);
            setEndStation(first ? first.id.toString() : '');
        } else if (pickerType === 'station_start') setStartStation(value);
        else if (pickerType === 'station_end') setEndStation(value);
        else if (pickerType === 'tickets') setNumTickets(value);
        else if (pickerType === 'date') setSelectedDate(value);
        else if (pickerType === 'time') setSelectedTime(value);

        // If date changes, make sure current time is still valid
        if (pickerType === 'date') {
            const validTimes = getAvailableTimes(value);
            if (!validTimes.find(t => t.value === selectedTime)) {
                setSelectedTime('');
            }
        }

        setPickerVisible(false);
    };

    const getAvailableDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            const val = getLocalDateString(date);

            // Only add date if it has available departure times in the allowed range
            const times = getAvailableTimes(val);
            if (times.length === 0) continue;

            const dayStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
            dates.push({
                id: i.toString(),
                label: i === 0 ? `Aujourd'hui ${dayStr}` : i === 1 ? `Demain ${dayStr}` : date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
                value: val
            });
        }
        return dates;
    };

    const getAvailableTimes = (date) => {
        const times = [];
        const isToday = date === getLocalDateString();

        let h = 6, m = 0; // Mandatory start at 6:00 AM

        if (isToday) {
            const now = new Date();
            const currentH = now.getHours();
            const currentM = now.getMinutes() + (15 - (now.getMinutes() % 15));
            let startH = currentH;
            let startM = currentM;
            if (startM >= 60) { startM = 0; startH += 1; }

            // If current time is later than 6:00 AM, start from now
            if (startH > 6 || (startH === 6 && startM > 0)) {
                h = startH;
                m = startM;
            }
        }

        while (h < 21 || (h === 21 && m <= 30)) {
            const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            times.push({ id: time, label: time, value: time });
            m += 15; if (m >= 60) { m = 0; h += 1; }
        }
        return times;
    };

    const getSelectedLabel = (type) => {
        if (type === 'city_start') return startCity || 'Ville de départ';
        if (type === 'city_end') return endCity || 'Ville d\'arrivée';
        if (type === 'station_start') return stations.find(s => s.id.toString() === startStation)?.nom || 'Choisir la station';
        if (type === 'station_end') return stations.find(s => s.id.toString() === endStation)?.nom || 'Choisir la station';
        if (type === 'tickets') return `${numTickets} Ticket${numTickets > 1 ? 's' : ''}`;
        if (type === 'date') return getAvailableDates().find(d => d.value === selectedDate)?.label || selectedDate;
        if (type === 'time') return selectedTime || 'Choisir l\'heure';
        return '';
    };

    const getPickerData = () => {
        if (pickerType === 'city_start') return cities.map(c => ({ id: c, label: c, value: c }));
        if (pickerType === 'city_end') return cities.filter(c => c !== startCity).map(c => ({ id: c, label: c, value: c }));
        if (pickerType === 'station_start') return stations.filter(s => s.ville === startCity).map(s => ({ id: s.id.toString(), label: s.nom, value: s.id.toString() }));
        if (pickerType === 'station_end') return stations.filter(s => s.ville === endCity && s.id.toString() !== startStation).map(s => ({ id: s.id.toString(), label: s.nom, value: s.id.toString() }));
        if (pickerType === 'tickets') return [1, 2, 3, 4, 5].map(n => ({ id: n.toString(), label: `${n} Ticket${n > 1 ? 's' : ''}`, value: n.toString() }));
        if (pickerType === 'date') return getAvailableDates();
        if (pickerType === 'time') return getAvailableTimes(selectedDate);
        return [];
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.secondary} /></View>;

    return (
        <View style={styles.container}>
            <Toast ref={toastRef} />
            <StatusBar barStyle="dark-content" />

            <View style={styles.imageHeader}>
                <Image source={require('../../assets/app/reservation.webp')} style={styles.headerBg} resizeMode="cover" />
                <View style={styles.headerOverlay} />
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.getParent()?.dispatch(DrawerActions.openDrawer())} style={styles.menuButton}><Ionicons name="apps" size={28} color="#FFF" /></TouchableOpacity>
                    <View style={styles.headerInfo}><Text style={styles.welcomeText}>Voyage</Text><Text style={styles.userName}>Réservation</Text></View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={[styles.card, styles.elevation]}>
                        <View style={styles.cardHeader}><View style={[styles.iconBox, { backgroundColor: Colors.tertiary }]}><MapPin size={20} color="#FFF" /></View><Text style={styles.cardTitle}>DÉPART</Text></View>
                        <Text style={styles.label}>Ville</Text>
                        <TouchableOpacity style={styles.customSelect} onPress={() => openPicker('city_start')}><Text style={styles.selectText}>{getSelectedLabel('city_start')}</Text><ChevronRight size={18} color={Colors.textLight} /></TouchableOpacity>
                        <Text style={styles.label}>Station</Text>
                        <TouchableOpacity style={styles.customSelect} onPress={() => openPicker('station_start')}><Text style={styles.selectText}>{getSelectedLabel('station_start')}</Text><ChevronRight size={18} color={Colors.textLight} /></TouchableOpacity>
                    </View>
                    <View style={styles.connectorContainer}><View style={styles.dashedLine} /><View style={[styles.arrowIcon, { backgroundColor: Colors.tertiary }]}><ArrowDown size={18} color="#FFF" /></View></View>
                    <View style={[styles.card, styles.elevation]}>
                        <View style={styles.cardHeader}><View style={[styles.iconBox, { backgroundColor: Colors.tertiary }]}><MapPin size={20} color="#FFF" /></View><Text style={styles.cardTitle}>ARRIVÉE</Text></View>
                        <Text style={styles.label}>Ville</Text>
                        <TouchableOpacity style={styles.customSelect} onPress={() => openPicker('city_end')}><Text style={styles.selectText}>{getSelectedLabel('city_end')}</Text><ChevronRight size={18} color={Colors.textLight} /></TouchableOpacity>
                        <Text style={styles.label}>Station</Text>
                        <TouchableOpacity style={styles.customSelect} onPress={() => openPicker('station_end')}><Text style={styles.selectText}>{getSelectedLabel('station_end')}</Text><ChevronRight size={18} color={Colors.textLight} /></TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 20 }}>
                        <TouchableOpacity style={[styles.card, styles.elevation, { flex: 1, marginRight: 10 }]} onPress={() => openPicker('date')}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconBox, { backgroundColor: Colors.tertiary }]}>
                                    <Ionicons name="calendar-outline" size={20} color="#FFF" />
                                </View>
                                <Text style={styles.cardTitle}>DATE</Text>
                                {!!selectedDate && <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} style={{ marginLeft: 'auto' }} />}
                            </View>
                            <Text style={styles.selectText}>{getSelectedLabel('date')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.card, styles.elevation, { flex: 0.8 }]} onPress={() => openPicker('time')}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconBox, { backgroundColor: Colors.tertiary }]}>
                                    <Ionicons name="time-outline" size={20} color="#FFF" />
                                </View>
                                <Text style={styles.cardTitle}>HEURE</Text>
                                {!!selectedTime && <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} style={{ marginLeft: 'auto' }} />}
                            </View>
                            <Text style={styles.selectText}>{getSelectedLabel('time')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.summaryBox}>
                        <View style={styles.priceRow}><View><Text style={styles.totalLabel}>Total à payer</Text><Text style={styles.unitPrice}>{currentPrice} CFA / ticket</Text></View><Text style={styles.totalValue}>{calculateTotal()} CFA</Text></View>
                        <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={handleOrder} disabled={submitting}>{submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Confirmer la réservation</Text>}</TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={pickerVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setPickerVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setPickerVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sélectionner</Text>
                            <TouchableOpacity onPress={() => setPickerVisible(false)}>
                                <X size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        {loadingAvailability && pickerType === 'time' && (
                            <ActivityIndicator size="small" color={Colors.secondary} style={{ marginBottom: 10 }} />
                        )}
                        <FlatList
                            data={getPickerData()}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => {
                                const isSelected =
                                    (pickerType === 'city_start' && startCity === item.value) ||
                                    (pickerType === 'city_end' && endCity === item.value) ||
                                    (pickerType === 'station_start' && startStation === item.value) ||
                                    (pickerType === 'station_end' && endStation === item.value) ||
                                    (pickerType === 'tickets' && numTickets === item.value) ||
                                    (pickerType === 'date' && selectedDate === item.value) ||
                                    (pickerType === 'time' && selectedTime === item.value);

                                let remaining = null;
                                if (pickerType === 'time') {
                                    remaining = availability[item.value] !== undefined ? availability[item.value] : busCapacity;
                                }

                                const isFull = remaining === 0;

                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.modalItem,
                                            isSelected && styles.modalItemSelected,
                                            isFull && { opacity: 0.5 }
                                        ]}
                                        onPress={() => !isFull && selectItem(item.value)}
                                        disabled={isFull}
                                    >
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                                                {item.label}
                                            </Text>

                                            {remaining !== null && (
                                                remaining === 0 ? (
                                                    <View style={[styles.seatBadge, styles.badgeRed]}>
                                                        <Text style={styles.seatBadgeText}>Complet</Text>
                                                    </View>
                                                ) : (
                                                    <Text style={{
                                                        fontSize: 12,
                                                        color: remaining < 10 ? '#EF4444' : Colors.textLight,
                                                        fontWeight: remaining < 10 ? '700' : '400'
                                                    }}>
                                                        {remaining} places
                                                    </Text>
                                                )
                                            )}
                                        </View>
                                        {isSelected && <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} style={{ marginLeft: 10 }} />}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    imageHeader: { height: 200, overflow: 'hidden' },
    headerBg: { width: '100%', height: '100%', position: 'absolute' },
    headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    headerContent: { flex: 1, paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    menuButton: { marginRight: 15 },
    headerInfo: { flex: 1 },
    welcomeText: { fontSize: 12, color: '#DDD', textTransform: 'uppercase' },
    userName: { fontSize: 24, fontWeight: '700', color: '#FFF' },
    content: { padding: 20 },
    card: { backgroundColor: Colors.surface, borderRadius: 15, padding: 15 },
    elevation: { shadowColor: "#000", shadowOpacity: 0.1, elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    cardTitle: { fontSize: 10, fontWeight: '700', color: Colors.textLight },
    label: { fontSize: 12, fontWeight: '600', color: Colors.text, marginTop: 8 },
    customSelect: { backgroundColor: '#F9FAFB', height: 45, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 5 },
    selectText: { fontSize: 14, color: Colors.text },
    connectorContainer: { height: 25, alignItems: 'center', justifyContent: 'center' },
    dashedLine: { position: 'absolute', width: 1, height: '100%', backgroundColor: Colors.border },
    arrowIcon: { backgroundColor: Colors.background, padding: 3, borderRadius: 8 },
    summaryBox: { marginTop: 20, backgroundColor: Colors.primary, borderRadius: 20, padding: 20 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    totalLabel: { color: '#FFF', fontSize: 12 },
    unitPrice: { color: '#DDD', fontSize: 10 },
    totalValue: { color: '#FFF', fontSize: 22, fontWeight: '700' },
    button: { backgroundColor: Colors.secondary, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        maxHeight: height * 0.5,
        padding: 20,
        paddingTop: 10, // Space for handle
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: Colors.border,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 15,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#EEE',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalItemSelected: {
        backgroundColor: Colors.secondary + '05',
    },
    modalItemText: { fontSize: 15, color: Colors.text },
    modalItemTextSelected: {
        color: Colors.secondary,
        fontWeight: '700',
    },
    seatBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 10,
    },
    seatBadgeText: {
        fontSize: 10,
        fontFamily: 'System',
        fontWeight: '700',
        color: '#FFF',
    },
    badgeGreen: { backgroundColor: '#10B981' },
    badgeOrange: { backgroundColor: '#F59E0B' },
    badgeRed: { backgroundColor: '#EF4444' },
});

export default TransportScreen;
