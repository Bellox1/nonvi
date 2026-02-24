import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Linking,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = ({ navigation }) => {
    const contactInfo = [
        { icon: 'location', label: 'Siège social', value: 'Ave Van Vollenhoven, Cotonou', action: null },
        { icon: 'call', label: 'Téléphone', value: '01 69 34 33 33', action: () => Linking.openURL('tel:0169343333') },
        { icon: 'mail', label: 'Email', value: 'nonvivoyageplus@beenonvi.bj', action: () => Linking.openURL('mailto:nonvivoyageplus@beenonvi.bj') },
        { icon: 'time', label: 'Horaires', value: 'Lun - Sam: 08:00 - 19:00\nDim: Fermé', action: null },
    ];

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/image_app.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Nonvi Voyage Plus</Text>
                    <Text style={styles.version}>Version 1.0.0</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>À propos de nous</Text>
                    <Text style={styles.description}>Nonvi Voyage Plus est une entreprise leader dans le domaine du transport et de la logistique au Bénin. Notre mission est de simplifier vos déplacements et de vous offrir un accès rapide à vos produits préférés grâce à notre réseau étendu.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact & Informations</Text>
                    {contactInfo.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.contactItem}
                            onPress={item.action}
                            disabled={!item.action}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name={item.icon} size={20} color={Colors.secondary} />
                            </View>
                            <View style={styles.contactDetails}>
                                <Text style={styles.contactLabel}>{item.label}</Text>
                                <Text style={styles.contactValue}>{item.value}</Text>
                            </View>
                            {item.action && <Ionicons name="chevron-forward" size={20} color={Colors.border} />}
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => Linking.openURL('tel:0169343333')}
                >
                    <Ionicons name="call" size={20} color="#FFF" style={{ marginRight: 12 }} />
                    <Text style={styles.callButtonText}>Nous appeler maintenant</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 15,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    version: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
    section: {
        padding: 24,
        backgroundColor: Colors.surface,
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.primary,
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        lineHeight: 22,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.background,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: Colors.secondary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactDetails: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
    contactValue: {
        fontSize: 14,
        fontFamily: 'Poppins_500Medium',
        color: Colors.primary,
    },
    callButton: {
        margin: 24,
        backgroundColor: Colors.secondary,
        borderRadius: 12,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    callButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    footer: {
        padding: 24,
        alignItems: 'center',
        marginBottom: 40,
    },
    copyright: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        marginBottom: 16,
    },
    poweredBy: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    poweredByText: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
    poweredByLogo: {
        width: 100,
        height: 32,
    },
});

export default AboutScreen;
