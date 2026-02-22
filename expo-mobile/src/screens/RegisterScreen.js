import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, Image,
    ActivityIndicator, Alert, Dimensions, StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

const { width, height } = Dimensions.get('window');

const IMG_H = height * 0.36;

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [tel, setTel] = useState('+229');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [step, setStep] = useState(0); // 0: Form, 1: Choice, 2: OTP
    const [otpArray, setOtpArray] = useState(['', '', '', '']);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const otpInputs = React.useRef([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useAuth();

    const handleSendOtp = async (type) => {
        let formattedTel = tel.trim();
        if (!formattedTel.startsWith('+')) {
            formattedTel = '+' + formattedTel;
        }

        setOtpLoading(true);
        try {
            await client.post('/auth/otp/send', { tel: formattedTel, type });
            setStep(2);
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', "Échec de l'envoi du code. Vérifiez le numéro.");
        } finally {
            setOtpLoading(false);
        }
    };

    const validatePassword = (pass) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d^A-Za-z0-9]{8,}$/;
        return regex.test(pass);
    };

    const validatePasswordFull = (pass) => {
        return {
            length: pass.length >= 8,
            case: /(?=.*[a-z])(?=.*[A-Z])/.test(pass),
            number: /\d/.test(pass),
            symbol: /[^A-Za-z0-9]/.test(pass),
        };
    };

    const isPasswordValid = (pass) => {
        const v = validatePasswordFull(pass);
        return v.length && v.case && v.number && v.symbol;
    };

    const handleContinue = () => {
        if (!name || !tel || !password || !passwordConfirmation) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }
        if (!isPasswordValid(password)) {
            Alert.alert(
                'Mot de passe trop faible',
                'Le mot de passe doit respecter tous les critères de sécurité.'
            );
            return;
        }
        if (password !== passwordConfirmation) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }
        setStep(1);
    };

    const handleRegister = async (otpCode) => {
        setLoading(true);
        try {
            await register(name, tel, password, passwordConfirmation, otpCode);
        } catch (error) {
            if (error.response?.status !== 422) console.error(error);
            const errors = error.response?.data?.errors;
            let message = "Une erreur est survenue lors de l'inscription";
            if (errors) {
                message = errors[Object.keys(errors)[0]][0];
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }
            Alert.alert("Échec de l'inscription", message);
            setStep(2); // Stay on OTP step if error
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (value, index) => {
        const newOtpArray = [...otpArray];
        newOtpArray[index] = value;
        setOtpArray(newOtpArray);

        if (value && index < 3) {
            otpInputs.current[index + 1].focus();
            setFocusedIndex(index + 1);
        }

        const fullOtp = newOtpArray.join('');
        if (fullOtp.length === 4) {
            handleRegister(fullOtp);
        }
    };

    const handleOtpKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otpArray[index] && index > 0) {
            otpInputs.current[index - 1].focus();
            setFocusedIndex(index - 1);
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
                    source={require('../../assets/app/horaire.webp')}
                    style={styles.img}
                    resizeMode="cover"
                />
                <View style={styles.imgOverlay} />


                {/* Branding en bas de l'image */}
                <View style={styles.branding}>
                    <Image
                        source={require('../../assets/app_image.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View>
                        <Text style={styles.appName}>Nonvi Voyage Plus</Text>
                        <Text style={styles.appSub}>Créez votre compte gratuitement</Text>
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
                <Text style={styles.title}>Créer un compte 🚌</Text>

                {step === 0 && (
                    <>
                        <View style={styles.inputGroup}>
                            <Ionicons name="person-outline" size={20} color={Colors.textLight} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nom complet"
                                placeholderTextColor={Colors.textLight}
                                value={name}
                                onChangeText={setName}
                                selectionColor={Colors.secondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Ionicons name="call-outline" size={20} color={Colors.textLight} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Téléphone (ex: +229...)"
                                placeholderTextColor={Colors.textLight}
                                value={tel}
                                onChangeText={setTel}
                                keyboardType="phone-pad"
                                selectionColor={Colors.secondary}
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
                                selectionColor={Colors.secondary}
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

                        {password.length > 0 && (
                            <View style={styles.pwdCriteriaRow}>
                                {Object.entries(validatePasswordFull(password)).map(([key, valid]) => (
                                    <View key={key} style={styles.criteriaItem}>
                                        <Ionicons
                                            name={valid ? "checkmark-circle" : "ellipse-outline"}
                                            size={14}
                                            color={valid ? Colors.success : Colors.textLight}
                                        />
                                        <Text style={[styles.criteriaText, valid && { color: Colors.success }]}>
                                            {key === 'length' ? '8+ car.' :
                                                key === 'case' ? 'Aa' :
                                                    key === 'number' ? '123' : '#$&'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirmer le mot de passe"
                                placeholderTextColor={Colors.textLight}
                                value={passwordConfirmation}
                                onChangeText={setPasswordConfirmation}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="oneTimeCode"
                                selectionColor={Colors.secondary}
                            />
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color={Colors.textLight}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.btn} onPress={handleContinue}>
                            <Text style={styles.btnText}>S'inscrire</Text>
                        </TouchableOpacity>
                    </>
                )}

                {step === 1 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Vérification du numéro</Text>
                        <Text style={styles.stepSub}>Comment souhaitez-vous recevoir votre code ?</Text>

                        <View style={styles.otpActionRow}>
                            <TouchableOpacity
                                style={[styles.otpBtn, { backgroundColor: '#25D366' }]}
                                onPress={() => handleSendOtp('whatsapp')}
                                disabled={otpLoading}
                            >
                                <Ionicons name="logo-whatsapp" size={22} color="#FFF" style={{ marginRight: 10 }} />
                                <Text style={styles.otpBtnLongText}>Par WhatsApp</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.otpActionRow}>
                            <TouchableOpacity
                                style={[styles.otpBtn, { backgroundColor: Colors.tertiary }]}
                                onPress={() => handleSendOtp('sms')}
                                disabled={otpLoading}
                            >
                                <Ionicons name="chatbubble-outline" size={22} color="#FFF" style={{ marginRight: 10 }} />
                                <Text style={styles.otpBtnLongText}>Par SMS</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.backLink} onPress={() => setStep(0)}>
                            <Text style={styles.backLinkText}>Retour</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {step === 2 && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Code de validation</Text>
                        <Text style={styles.stepSub}>Veuillez saisir le code reçu sur {tel}</Text>

                        <View style={styles.otpSplitRow}>
                            {otpArray.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (otpInputs.current[index] = ref)}
                                    style={[
                                        styles.otpBox,
                                        (digit || focusedIndex === index) ? styles.otpBoxActive : null
                                    ]}
                                    value={digit}
                                    onFocus={() => setFocusedIndex(index)}
                                    onChangeText={(val) => handleOtpChange(val, index)}
                                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    autoFocus={index === 0}
                                    selectionColor={Colors.tertiary}
                                />
                            ))}
                        </View>

                        {loading && <ActivityIndicator color={Colors.secondary} style={{ marginTop: 20 }} />}

                        <TouchableOpacity style={styles.backLink} onPress={() => { setStep(1); setOtpArray(['', '', '', '']); }} disabled={loading}>
                            <Text style={styles.backLinkText}>Changer de méthode / Renvoyer</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Déjà un compte ? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.footerLink}>Se connecter</Text>
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
        width: 44,
        height: 44,
        borderRadius: 10,
    },
    appName: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        color: '#FFF',
    },
    appSub: {
        fontSize: 11,
        fontFamily: 'Poppins_400Regular',
        color: 'rgba(255,255,255,0.75)',
    },
    form: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        marginTop: -70,
    },
    formContent: {
        padding: 28,
        paddingTop: 28,
        paddingBottom: 40,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginBottom: 22,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
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
        backgroundColor: 'transparent', // Prevent OS tinting
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
        marginTop: 20,
        marginBottom: 10,
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
    otpActionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 8,
    },
    otpBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    otpBtnLongText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    stepContainer: {
        paddingVertical: 10,
    },
    stepTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
        marginBottom: 4,
    },
    stepSub: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
        marginBottom: 24,
    },
    backLink: {
        marginTop: 15,
        alignItems: 'center',
    },
    backLinkText: {
        color: Colors.textLight,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    otpSplitRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 15,
        gap: 12,
    },
    otpBox: {
        width: 55,
        height: 55,
        backgroundColor: Colors.background,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.border,
        textAlign: 'center',
        fontSize: 22,
        fontFamily: 'Poppins_700Bold',
        color: Colors.primary,
    },
    otpBoxActive: {
        borderColor: Colors.secondary,
        backgroundColor: Colors.surface,
    },
    pwdCriteriaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    criteriaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    criteriaText: {
        fontSize: 11,
        fontFamily: 'Poppins_400Regular',
        color: Colors.textLight,
    },
});

export default RegisterScreen;
