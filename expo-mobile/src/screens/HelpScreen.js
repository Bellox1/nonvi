import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/Colors';

const HelpScreen = ({ navigation }) => {
    const helpItems = [
        {
            icon: "bus-outline",
            title: "Réserver un voyage",
            description: "1. Allez dans 'Réservation'.\n2. Choisissez votre ville de départ et d'arrivée.\n3. Sélectionnez la date et cliquez sur 'Rechercher'.\n4. Payez via Momo ou Carte.\n5. Votre ticket (QR Code) est généré dans l'Historique."
        },
        {
            icon: "basket-outline",
            title: "Acheter sur Santé Plus",
            description: "1. Allez dans 'Santé Plus' et ajoutez vos produits au panier.\n2. Sélectionnez votre Ville et Station de retrait.\n3. Validez le paiement.\n4. Retirez vos produits en station sur présentation de votre preuve d'achat."
        },
        {
            icon: "qr-code-outline",
            title: "Utiliser mon ticket",
            description: "Le jour du départ, ouvrez 'Historique' et cliquez sur votre réservation. Présentez le QR Code qui s'affiche au contrôleur lors de l'embarquement."
        },
        {
            icon: "person-outline",
            title: "Gérer mon profil",
            description: "Allez dans 'Profil' pour modifier vos infos (nom, tel, mot de passe). Toute modification sensible nécessite une validation par code OTP."
        },
        {
            icon: "id-card-outline",
            title: "Identifiant Unique (ID)",
            description: "Votre identifiant unique (ex: ID: 12345678) est votre numéro personnel de client. Il est visible dans le menu latéral et sur votre profil. Utilisez ce numéro lors de vos échanges avec notre support pour une assistance plus rapide."
        },
        {
            icon: "headset-outline",
            title: "Assistance & Support",
            description: "En cas de souci, contactez l'administration via les numéros officiels ou utilisez le bouton 'Aide' dans votre profil pour nous envoyer un message."
        },
    ];

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.introBox}>
                    <Text style={styles.introTitle}>Guide d'utilisation</Text>
                    <Text style={styles.introText}>Retrouvez ici toutes les informations nécessaires pour utiliser les services Nonvi.</Text>
                </View>

                {helpItems.map((item, index) => (
                    <View key={index} style={styles.helpSection}>
                        <View style={styles.helpHeaderRow}>
                            <Ionicons name={item.icon} size={22} color={Colors.secondary} style={{ marginRight: 10 }} />
                            <Text style={styles.helpTitle}>{item.title}</Text>
                        </View>
                        <Text style={styles.helpDescription}>{item.description}</Text>
                    </View>
                ))}

                <TouchableOpacity
                    style={styles.aboutLink}
                    onPress={() => navigation.navigate('DrawerAbout')}
                >
                    <View style={styles.aboutContent}>
                        <Ionicons name="information-circle-outline" size={22} color={Colors.secondary} />
                        <Text style={styles.aboutText}>En savoir plus sur Nonvi</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.poweredByText}>Powered by</Text>
                    <Image
                        source={require('../../assets/app/by.png')}
                        style={styles.footerImage}
                        resizeMode="contain"
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: 20,
    },
    introBox: {
        backgroundColor: Colors.primary,
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    introTitle: {
        color: '#FFF',
        fontSize: 17,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 5,
    },
    introText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
    },
    helpSection: {
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    helpHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    helpTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
        marginBottom: 8,
    },
    helpDescription: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.text,
        lineHeight: 22,
    },
    aboutLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 18,
        marginTop: 10,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    aboutContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    aboutText: {
        fontSize: 15,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
        paddingBottom: 40,
    },
    poweredByText: {
        fontSize: 10,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        marginBottom: 4,
        opacity: 0.7,
    },
    footerImage: {
        width: 80,
        height: 28,
        opacity: 0.6,
    }
});

export default HelpScreen;
