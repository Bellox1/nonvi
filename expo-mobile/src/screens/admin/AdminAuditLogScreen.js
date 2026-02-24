import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    ScrollView,
    Platform,
    StatusBar,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Toast, { useToast } from '../../components/Toast';
import client from '../../api/client';
import Colors from '../../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import { exportToCsv } from '../../utils/export';
import { SafeAreaView } from 'react-native-safe-area-context';

// Map backend description to human-readable French + icon
const ACTION_MAP = {
    'audit:created': { label: 'Création', icon: 'add-circle', color: '#27AE60' },
    'audit:updated': { label: 'Modification', icon: 'pencil-outline', color: '#E67E22' },
    'audit:deleted': { label: 'Suppression', icon: 'trash-outline', color: '#C0392B' },
};

const getAction = (desc) => ACTION_MAP[desc] || { label: desc, icon: 'list-circle-outline', color: Colors.textLight };

// Extract model name from subject_type e.g. "App\Models\Station#3" -> "Station"
const getModel = (subjectType) => subjectType?.split('\\').pop()?.split('#')[0] || '?';

import { useAuth } from '../../context/AuthContext';

const AdminAuditLogScreen = ({ navigation }) => {
    const { hasPermission } = useAuth();
    const { toastRef, showToast } = useToast();
    const canShowDetails = hasPermission('audit_log_show');
    const canExport = hasPermission('export_csv');

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    const handleCopy = async (data) => {
        try {
            const text = JSON.stringify(data, null, 2);
            await Clipboard.setStringAsync(text);
            showToast('Données copiées !', 'info');
        } catch (e) {
            showToast('Erreur de copie', 'error');
        }
    };

    const fetchLogs = async () => {
        try {
            const response = await client.get('/admin/logs');
            setLogs(response.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // Auto-refresh every 10 seconds for real-time monitoring
        const interval = setInterval(() => {
            fetchLogs();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const renderItem = ({ item }) => {
        const action = getAction(item.description);
        const model = getModel(item.subject_type);
        const userName = item.user?.name || 'Système';
        return (
            <TouchableOpacity
                style={[styles.card, !canShowDetails && { opacity: 0.9 }]}
                onPress={() => canShowDetails && setSelectedLog(item)}
                activeOpacity={canShowDetails ? 0.7 : 1}
            >
                <View style={styles.logHeader}>
                    <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
                    <Text style={styles.time}>{new Date(item.created_at).toLocaleTimeString()}</Text>
                </View>
                <View style={styles.logBody}>
                    <Text style={styles.modelText}>{model} #{item.subject_id}</Text>
                    <Text style={styles.userText}>{userName}</Text>
                </View>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('fr-FR')}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
            <Toast ref={toastRef} />
            <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.surface }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title} numberOfLines={1}>Logs d'Audit</Text>
                    <View style={{ flex: 1 }} />
                    {canExport && (
                        <TouchableOpacity
                            onPress={() => exportToCsv('admin/logs-export', 'logs')}
                        >
                            <Ionicons name="download-outline" size={24} color={Colors.secondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>

            {loading ? <ActivityIndicator size="large" color={Colors.secondary} style={{ marginTop: 50 }} /> :
                <FlatList
                    data={logs}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    onRefresh={fetchLogs}
                    refreshing={refreshing}
                />
            }

            <Modal visible={!!selectedLog} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <View style={styles.mHeader}>
                            <Text style={styles.mTitle}>Log Détails</Text>
                            <TouchableOpacity onPress={() => setSelectedLog(null)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {selectedLog && (
                                <View style={styles.logFull}>
                                    <Text style={styles.label}>Action</Text>
                                    <Text style={[styles.value, { color: getAction(selectedLog.description).color, fontWeight: '700' }]}>
                                        {getAction(selectedLog.description).label}
                                    </Text>

                                    <Text style={styles.label}>Utilisateur</Text>
                                    <Text style={styles.value}>{selectedLog.user?.name || 'Système'}</Text>

                                    <Text style={styles.label}>Date & Heure</Text>
                                    <Text style={styles.value}>
                                        {new Date(selectedLog.created_at).toLocaleString('fr-FR')}
                                    </Text>

                                    <Text style={styles.label}>Objet concerné</Text>
                                    <Text style={styles.value}>{getModel(selectedLog.subject_type)} #{selectedLog.subject_id}</Text>

                                    <Text style={styles.label}>Host / IP</Text>
                                    <Text style={styles.value}>{selectedLog.host}</Text>

                                    <Text style={styles.label}>Données</Text>
                                    <View style={styles.jsonContainer}>
                                        <Text style={styles.json}>{JSON.stringify(selectedLog.properties, null, 2)}</Text>
                                        <TouchableOpacity
                                            onPress={() => handleCopy(selectedLog.properties)}
                                            style={styles.copyIconInside}
                                        >
                                            <Ionicons name="copy-outline" size={18} color={Colors.secondary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
    list: { padding: 15, paddingBottom: 100 },
    card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 15, marginBottom: 10, elevation: 1 },
    logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    actionBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionLabel: { fontSize: 13, fontWeight: '700' },
    time: { fontSize: 12, color: Colors.textLight },
    logBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    modelText: { fontSize: 12, color: Colors.textLight },
    userText: { fontSize: 12, color: Colors.textLight, fontWeight: '600' },
    date: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
    // Modal
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '75%', padding: 20 },
    mHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    mTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
    logFull: { paddingBottom: 30 },
    label: { fontSize: 12, fontWeight: '700', color: Colors.textLight, marginTop: 16, textTransform: 'uppercase' },
    value: { fontSize: 15, color: Colors.primary, marginTop: 5 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 6, alignSelf: 'flex-start' },
    badgeText: { fontSize: 14, fontWeight: '700' },
    jsonContainer: { marginTop: 10, position: 'relative' },
    json: { backgroundColor: Colors.background, padding: 15, borderRadius: 10, fontSize: 12, color: Colors.text, fontFamily: 'monospace' },
    copyIconInside: { position: 'absolute', top: 10, right: 10, padding: 5 }
});

export default AdminAuditLogScreen;
