import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, Image,
    ActivityIndicator, Alert, Dimensions, StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Image visible uniquement dans la zone du haut
const IMG_H = height * 0.36;

const LoginScreen = ({ navigation }) => {
    const [tel, setTel] = useState('+229');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!tel || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }
        setLoading(true);
        try {
            await login(tel, password);
        } catch (error) {
            if (error.response?.status !== 422) console.error(error);
            const errors = error.response?.data?.errors;
            let message = 'Téléphone ou mot de passe incorrect';
            if (errors) {
                message = errors[Object.keys(errors)[0]][0];
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }
            Alert.alert('Échec de connexion', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            style={styles.root}
        >
            <StatusBar barStyle="light-content" />

            {/* --- Zone image (haut) --- */}
            <View style={styles.imgZone}>
                <Image
                    source={require('../../assets/app/vue2.jpg')}
                    style={styles.img}
                    resizeMode="cover"
                />
                {/* Overlay léger */}
                <View style={styles.imgOverlay} />


                {/* Logo + nom en bas de la zone image */}
                <View style={styles.branding}>
                    <Image
                        source={require('../../assets/image_app.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View>
                        <Text style={styles.appName}>Nonvi Voyage Plus</Text>
                        <Text style={styles.appSub}>Connectez-vous pour commencer</Text>
                    </View>
                </View>
            </View>

            {/* --- Zone formulaire (bas) --- */}
            <ScrollView
                style={styles.form}
                contentContainerStyle={styles.formContent}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Bon Retour ! 👋</Text>

                <View style={styles.inputGroup}>
                    <Ionicons name="call-outline" size={20} color={Colors.textLight} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Téléphone"
                        placeholderTextColor={Colors.textLight}
                        value={tel}
                        onChangeText={setTel}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        selectionColor={Colors.tertiary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Mot de passe"
                        placeholderTextColor={Colors.textLight}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="oneTimeCode"
                        selectionColor={Colors.tertiary}
                    />
                    <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color={Colors.textLight}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.forgotBtn}
                    onPress={() => navigation.navigate('ForgotPassword')}
                >
                    <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
                    {loading
                        ? <ActivityIndicator color="#FFF" />
                        : <Text style={styles.btnText}>Se Connecter</Text>}
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Pas encore de compte ? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.footerLink}>S'inscrire</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    /* --- Image zone --- */
    imgZone: {
        width,
        height: IMG_H,
        overflow: 'hidden',
        backgroundColor: '#1a2a3a',
    },
    img: {
        width: '100%',
        height: '100%',
    },
    imgOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.38)',
    },
    backBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 52 : 24,
        left: 18,
        backgroundColor: 'rgba(0,0,0,0.22)',
        borderRadius: 20,
        padding: 8,
    },
    branding: {
        position: 'absolute',
        top: '50%',
        left: 20,
        transform: [{ translateY: -28 }],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    appName: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        color: '#FFF',
    },
    appSub: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: 'rgba(255,255,255,0.75)',
    },
    /* --- Form zone --- */
    form: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        marginTop: -40,         // chevauchement sur l'image
    },
    formContent: {
        padding: 28,
        paddingTop: 32,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginBottom: 24,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 14,
        paddingHorizontal: 16,
        marginBottom: 14,
        height: 54,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    icon: { marginRight: 12 },
    input: {
        flex: 1,
        height: 54,
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
        color: Colors.text,
        paddingHorizontal: 5,
        backgroundColor: 'transparent',
    },
    eyeBtn: {
        width: 44,
        height: 54,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btn: {
        backgroundColor: Colors.secondary,
        borderRadius: 14,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 4,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
    },
    btnText: {
        color: '#FFF',
        fontSize: 17,
        fontFamily: 'Poppins_700Bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 22,
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
    footerLink: {
        fontSize: 14,
        fontFamily: 'Poppins_700Bold',
        color: Colors.secondary,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotText: {
        fontSize: 13,
        fontFamily: 'Poppins_500Medium',
        color: Colors.secondary,
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
