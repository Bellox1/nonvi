import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/Colors';

const HelpScreen = ({ navigation }) => {
    const helpItems = [
        {
            title: "Réservations de voyage",
            description: "Pour réserver un trajet, allez dans l'onglet 'Réservation'. Sélectionnez votre ville de départ et votre destination. Vous devez ensuite choisir la date et l'heure de départ souhaitées. Une fois la réservation confirmée, elle apparaîtra dans votre historique."
        },
        {
            title: "Gestion des tickets",
            description: "Le paiement de vos tickets s'effectue directement à la station de départ avant l'embarquement. Assurez-vous d'arriver au moins 30 minutes avant l'heure de départ prévue pour valider votre réservation."
        },
        {
            title: "Livraison de colis",
            description: "Nous assurons le transport sécurisé de vos marchandises entre nos différentes stations. Le dépôt et le retrait se font au guichet colis de chaque station Nonvi."
        },
        {
            title: "Santé Plus (Boutique)",
            description: "Commandez vos produits de santé et choisissez entre le retrait en station ou la livraison à domicile. Le suivi de vos commandes est disponible dans l'historique."
        },
        {
            title: "Points de Fidélité",
            description: "Chaque ticket de transport payé et validé vous rapporte des points de fidélité. Ces points sont cumulables et visibles sur votre profil utilisateur."
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
                        <Text style={styles.helpTitle}>{item.title}</Text>
                        <Text style={styles.helpDescription}>{item.description}</Text>
                    </View>
                ))}

                <TouchableOpacity
                    style={styles.aboutLink}
                    onPress={() => navigation.navigate('About')}
                >
                    <View style={styles.aboutContent}>
                        <Ionicons name="information-circle-outline" size={22} color={Colors.secondary} />
                        <Text style={styles.aboutText}>En savoir plus sur Nonvi</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2024 Nonvi - Tous droits réservés</Text>
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
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 12,
        color: Colors.textLight,
        fontFamily: 'Poppins_400Regular',
    }
});

export default HelpScreen;
