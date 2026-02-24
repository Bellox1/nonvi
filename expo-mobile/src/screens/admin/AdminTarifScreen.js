import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    ScrollView,
    Platform,
    StatusBar,
    KeyboardAvoidingView,
} from 'react-native';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast, { useToast } from '../../components/Toast';

import { useAuth } from '../../context/AuthContext';

const AdminTarifScreen = ({ navigation }) => {
    const { hasPermission } = useAuth();
    const canEdit = hasPermission('setting_edit');

    const [prix, setPrix] = useState('');
    const [capacity, setCapacity] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingCapacity, setSavingCapacity] = useState(false);
    const { toastRef, showToast } = useToast();

    const fetchData = async () => {
        try {
            const [priceRes, capacityRes] = await Promise.all([
                client.get('/admin/settings/price'),
                client.get('/admin/settings/capacity')
            ]);
            setPrix(priceRes.data.prix.toString());
            setCapacity(capacityRes.data.capacity.toString());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSavePrice = async () => {
        if (!prix || isNaN(prix)) {
            showToast('Veuillez entrer un prix valide', 'error');
            return;
        }

        setSaving(true);
        try {
            await client.post('/admin/settings/price', { prix: parseFloat(prix) });
            showToast('Le prix du ticket a été mis à jour');
        } catch (e) {
            showToast('Échec de la mise à jour', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveCapacity = async () => {
        if (!capacity || isNaN(capacity) || parseInt(capacity) < 1) {
            showToast('Veuillez entrer une capacité valide', 'error');
            return;
        }

        setSavingCapacity(true);
        try {
            await client.post('/admin/settings/capacity', { capacity: parseInt(capacity) });
            showToast('La capacité du bus a été mise à jour');
        } catch (e) {
            showToast('Échec de la mise à jour', 'error');
        } finally {
            setSavingCapacity(false);
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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configuration Générale</Text>
            </View>

            <Toast ref={toastRef} />
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                {/* Section Prix du Ticket */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconBg}>
                            <Ionicons name="cash-outline" size={24} color={Colors.secondary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>Tarif du Ticket</Text>
                            <Text style={styles.cardSubtitle}>Ce prix s'appliquera à toutes les réservations</Text>
                        </View>
                    </View>

                    <Text style={styles.label}>Montant unique (CFA)</Text>
                    <TextInput
                        style={[styles.input, !canEdit && { opacity: 0.6 }]}
                        value={prix}
                        onChangeText={setPrix}
                        keyboardType="numeric"
                        placeholder="Ex: 5000"
                        placeholderTextColor={Colors.textLight}
                        editable={canEdit}
                    />

                    {canEdit && (
                        <TouchableOpacity
                            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                            onPress={handleSavePrice}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.saveText}>Enregistrer le tarif</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Section Capacité du Bus */}
                <View style={[styles.card, { marginTop: 24 }]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBg, { backgroundColor: Colors.primary + '15' }]}>
                            <Ionicons name="bus-outline" size={24} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>Capacité du Bus</Text>
                            <Text style={styles.cardSubtitle}>Nombre de places disponibles par bus</Text>
                        </View>
                    </View>

                    <Text style={styles.label}>Nombre de places</Text>
                    <TextInput
                        style={[styles.input, !canEdit && { opacity: 0.6 }]}
                        value={capacity}
                        onChangeText={setCapacity}
                        keyboardType="numeric"
                        placeholder="Ex: 50"
                        placeholderTextColor={Colors.textLight}
                        editable={canEdit}
                    />

                    {canEdit && (
                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: Colors.primary }, savingCapacity && { opacity: 0.7 }]}
                            onPress={handleSaveCapacity}
                            disabled={savingCapacity}
                        >
                            {savingCapacity ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.saveText}>Enregistrer la capacité</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                    <Text style={styles.infoText}>
                        La capacité définit le nombre maximum de réservations possibles pour un départ (date et heure précises).
                        Une fois ce quota atteint, les clients ne pourront plus réserver sur ce créneau.
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 15,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    iconBg: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: Colors.secondary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    cardTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.primary },
    cardSubtitle: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textLight, marginTop: 2 },
    label: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.textLight, marginBottom: 8, textTransform: 'uppercase' },
    input: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 24
    },
    saveBtn: {
        backgroundColor: Colors.secondary,
        borderRadius: 12,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2
    },
    saveText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: Colors.primary + '08',
        padding: 16,
        borderRadius: 15,
        marginTop: 24,
        alignItems: 'center'
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.primary,
        marginLeft: 12,
        lineHeight: 18
    }
});

export default AdminTarifScreen;
