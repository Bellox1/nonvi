import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView,
    ActivityIndicator, Alert, Dimensions, StatusBar
} from 'react-native';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
    const [tel, setTel] = useState('+229');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [step, setStep] = useState(0); // 0: Phone, 1: Choice, 2: OTP, 3: New Password
    const [otpArray, setOtpArray] = useState(['', '', '', '']);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const otpInputs = React.useRef([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSendOtp = async (type) => {
        if (tel.length < 8) {
            Alert.alert('Erreur', 'Veuillez entrer un numéro valide');
            return;
        }

        setOtpLoading(true);
        try {
            await client.post('/auth/password/forgot', { tel, type });
            setStep(2);
        } catch (error) {
            const msg = error.response?.data?.message || "Échec de l'envoi du code.";
            Alert.alert('Erreur', msg);
        } finally {
            setOtpLoading(false);
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
            setStep(3);
        }
    };

    const handleOtpKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otpArray[index] && index > 0) {
            otpInputs.current[index - 1].focus();
            setFocusedIndex(index - 1);
        }
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

    const handleResetPassword = async () => {
        if (!password || !passwordConfirmation) {
            Alert.alert('Erreur', 'Veuillez remplir les deux champs');
            return;
        }

        if (!isPasswordValid(password)) {
            Alert.alert('Mot de passe trop faible', 'Le mot de passe doit respecter tous les critères.');
            return;
        }

        if (password !== passwordConfirmation) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);
        try {
            await client.post('/auth/password/reset', {
                tel,
                otp: otpArray.join(''),
                password,
                password_confirmation: passwordConfirmation
            });
            Alert.alert('Succès', 'Votre mot de passe a été réinitialisé !', [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error) {
            const msg = error.response?.data?.message || "Erreur lors de la réinitialisation";
            Alert.alert('Erreur', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="always"
            >
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="lock-open-outline" size={40} color={Colors.secondary} />
                    </View>
                    <Text style={styles.title}>Récupération</Text>
                    <Text style={styles.subtitle}>
                        {step === 0 && "Entrez votre numéro pour recevoir un code"}
                        {step === 1 && "Choisissez comment recevoir le code"}
                        {step === 2 && "Saisissez le code reçu au " + tel}
                        {step === 3 && "Définissez votre nouveau mot de passe"}
                    </Text>
                </View>

                {step === 0 && (
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Ionicons name="call-outline" size={20} color={Colors.textLight} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Téléphone"
                                value={tel}
                                onChangeText={setTel}
                                keyboardType="phone-pad"
                                selectionColor={Colors.tertiary}
                            />
                        </View>
                        <TouchableOpacity style={styles.btn} onPress={() => setStep(1)}>
                            <Text style={styles.btnText}>Continuer</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {step === 1 && (
                    <View style={styles.form}>
                        <TouchableOpacity
                            style={[styles.otpBtn, { backgroundColor: '#25D366' }]}
                            onPress={() => handleSendOtp('whatsapp')}
                            disabled={otpLoading}
                        >
                            <Ionicons name="logo-whatsapp" size={22} color="#FFF" />
                            <Text style={styles.otpBtnText}>Par WhatsApp</Text>
                            {otpLoading && <ActivityIndicator size="small" color="#FFF" />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.otpBtn, { backgroundColor: Colors.tertiary }]}
                            onPress={() => handleSendOtp('sms')}
                            disabled={otpLoading}
                        >
                            <Ionicons name="chatbox-ellipses-outline" size={22} color="#FFF" />
                            <Text style={styles.otpBtnText}>Par SMS</Text>
                            {otpLoading && <ActivityIndicator size="small" color="#FFF" />}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep(0)}>
                            <Text style={styles.cancelLink}>Changer de numéro</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {step === 2 && (
                    <View style={styles.form}>
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
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep(1)}>
                            <Text style={styles.cancelLink}>Renvoyer le code</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {step === 3 && (
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nouveau mot de passe"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                textContentType="oneTimeCode"
                                selectionColor={Colors.tertiary}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textLight} />
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
                                value={passwordConfirmation}
                                onChangeText={setPasswordConfirmation}
                                secureTextEntry={!showConfirmPassword}
                                textContentType="oneTimeCode"
                                selectionColor={Colors.tertiary}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textLight} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.btn} onPress={handleResetPassword} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Enregistrer</Text>}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { padding: 25, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
    backBtn: { marginBottom: 30 },
    header: { alignItems: 'center', marginBottom: 40 },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.secondary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    title: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: Colors.primary, marginBottom: 8 },
    subtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textLight, textAlign: 'center' },
    form: { width: '100%' },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 14,
        paddingHorizontal: 16,
        marginBottom: 15,
        height: 54,
        borderWidth: 1,
        borderColor: Colors.border
    },
    icon: { marginRight: 12 },
    input: { flex: 1, height: '100%', fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.primary, backgroundColor: 'transparent' },
    eyeBtn: { padding: 5 },
    btn: {
        backgroundColor: Colors.secondary,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5
    },
    btnText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_700Bold' },
    otpBtn: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        gap: 12
    },
    otpBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
    cancelBtn: { marginTop: 10, alignItems: 'center' },
    cancelLink: { color: Colors.textLight, textDecorationLine: 'underline' },
    otpSplitRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 20, gap: 12 },
    otpBox: {
        width: 55, height: 55, backgroundColor: Colors.surface, borderRadius: 12,
        borderWidth: 1.5, borderColor: Colors.border, textAlign: 'center',
        fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.primary
    },
    otpBoxActive: { borderColor: Colors.secondary, backgroundColor: '#FFF' },
    pwdCriteriaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, paddingHorizontal: 5 },
    criteriaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    criteriaText: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textLight },
});

export default ForgotPasswordScreen;
