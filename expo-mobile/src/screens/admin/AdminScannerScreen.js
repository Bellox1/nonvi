import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/Colors';
import client from '../../api/client';
import base64 from 'base-64';

export default function AdminScannerScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const isScanning = useRef(false);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned || loading || isScanning.current) return;

        isScanning.current = true;
        setScanned(true);
        setLoading(true);

        try {
            console.log("Scanned raw data:", data);

            // 1. Validation locale : Eviter de scanner les liens Expo ou sites web
            if (!data || (!data.startsWith('NVT_SECURE_v1:') && !data.startsWith('NVT:'))) {
                Alert.alert(
                    "Format Invalide ❌",
                    "Ceci n'est pas un ticket Nonvi. Veuillez scanner un QR code de ticket valide.",
                    [{
                        text: "Réessayer", onPress: () => {
                            isScanning.current = false;
                            setScanned(false);
                            setLoading(false);
                        }
                    }]
                );
                return;
            }

            let ticketCode = data;
            // Decode if it's our obfuscated format
            if (data.startsWith('NVT_SECURE_v1:')) {
                try {
                    const decoded = base64.decode(data.replace('NVT_SECURE_v1:', ''));
                    ticketCode = decoded.replace('NV_HASH_92_', '').replace('_31_NONVI', '');
                    console.log("Decoded secure ticket code:", ticketCode);
                } catch (e) {
                    throw new Error("Impossible de décoder ce ticket sécurisé.");
                }
            } else if (data.startsWith('NVT:')) {
                try {
                    ticketCode = base64.decode(data.replace('NVT:', ''));
                    console.log("Decoded ticket code:", ticketCode);
                } catch (e) {
                    console.warn("Could not decode data, trying raw data");
                }
            }

            const response = await client.post('/admin/reservations/scan', {
                qr_code: ticketCode
            });

            Alert.alert(
                "Succès ✅",
                response.data.message || "Ticket validé !",
                [{
                    text: "OK", onPress: () => {
                        isScanning.current = false;
                        setScanned(false);
                    }
                }]
            );
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || error.message || "Erreur de validation du ticket";
            Alert.alert(
                "Erreur ❌",
                errorMsg,
                [{
                    text: "Réessayer", onPress: () => {
                        isScanning.current = false;
                        setScanned(false);
                    }
                }]
            );
        } finally {
            setLoading(false);
        }
    };

    if (!permission) {
        return <View style={styles.center}><Text>Demande d'autorisation de la caméra...</Text></View>;
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={{ textAlign: 'center', marginBottom: 20 }}>Nous avons besoin de votre autorisation pour utiliser la caméra.</Text>
                <TouchableOpacity style={styles.rescanBtn} onPress={requestPermission}>
                    <Text style={styles.rescanText}>Accorder l'autorisation</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Scanner un Ticket</Text>
                <View style={{ width: 28 }} />
            </View>

            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.overlay}>
                <View style={styles.unfocusedContainer} />
                <View style={styles.middleContainer}>
                    <View style={styles.unfocusedContainer} />
                    <View style={styles.focusedContainer} />
                    <View style={styles.unfocusedContainer} />
                </View>
                <View style={styles.unfocusedContainer} />
            </View>

            {scanned && (
                <TouchableOpacity style={styles.rescanBtn} onPress={() => {
                    isScanning.current = false;
                    setScanned(false);
                }}>
                    <Text style={styles.rescanText}>Scanner à nouveau</Text>
                </TouchableOpacity>
            )}

            <View style={styles.instructionsContainer}>
                <Text style={styles.instructions}>Placez le QR Code dans le carré pour le valider</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 10,
    },
    title: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backBtn: {
        padding: 5,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 250,
    },
    focusedContainer: {
        width: 250,
        borderWidth: 2,
        borderColor: Colors.secondary,
        backgroundColor: 'transparent',
    },
    rescanBtn: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5,
    },
    rescanText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    instructionsContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    instructions: {
        color: '#FFF',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        overflow: 'hidden',
    }
});
