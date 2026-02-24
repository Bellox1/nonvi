import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/Colors';

const PrivacyPolicyScreen = ({ navigation }) => {
    const sections = [
        {
            title: "1. Gestion de vos services",
            content: "Les informations que vous renseignez (nom, numéro de téléphone, email) sont strictement nécessaires à l'exécution des services Nonvi : traitement de vos réservations de transport et livraison de vos commandes Santé Plus."
        },
        {
            title: "2. Communication et Sécurité",
            content: "Votre numéro de téléphone est utilisé pour vous transmettre vos tickets et confirmations de voyage via SMS/WhatsApp, ainsi que pour sécuriser votre compte grâce aux codes de vérification."
        },
        {
            title: "3. Partage des informations",
            content: "Nonvi Voyage Plus ne vend jamais vos données personnelles. Elles ne sont partagées qu'avec nos partenaires techniques (paiement FedaPay, services OTP Twilio) uniquement pour le bon fonctionnement de l'application."
        },
        {
            title: "4. Sécurité",
            content: "Nous mettons en œuvre des mesures de sécurité rigoureuses pour protéger vos informations contre tout accès non autorisé. L'utilisation de codes OTP pour les actions sensibles garantit une couche de protection supplémentaire."
        },
        {
            title: "5. Vos droits",
            content: "Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles directement depuis les réglages de votre profil dans l'application."
        },
        {
            title: "6. Contact",
            content: "Pour toute question concernant notre politique de confidentialité, vous pouvez nous contacter via la section Aide & Support de l'application."
        }
    ];

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerBox}>
                    <Ionicons name="shield-checkmark" size={40} color={Colors.secondary} />
                    <Text style={styles.headerTitle}>Politique de Confidentialité</Text>
                    <Text style={styles.headerSubtitle}>Dernière mise à jour : 24 Février 2026</Text>
                </View>

                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        En utilisant l'application Nonvi Voyage Plus, vous acceptez les termes de cette politique de confidentialité.
                    </Text>
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
        paddingBottom: 40,
    },
    headerBox: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: Colors.surface,
        padding: 25,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginTop: 15,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        marginTop: 5,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
        marginBottom: 10,
    },
    sectionContent: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.text,
        lineHeight: 22,
        textAlign: 'justify',
    },
    footer: {
        marginTop: 20,
        padding: 20,
        backgroundColor: 'rgba(52, 152, 219, 0.05)',
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: Colors.secondary,
    },
    footerText: {
        fontSize: 13,
        fontFamily: 'Poppins_500Medium',
        color: Colors.primary,
        textAlign: 'center',
        lineHeight: 18,
    }
});

export default PrivacyPolicyScreen;
