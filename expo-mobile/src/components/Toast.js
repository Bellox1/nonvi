import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * useToast hook — to be used within a component
 * Returns: { toastRef, showToast }
 * Usage:
 *   const { toastRef, showToast } = useToast();
 *   <Toast ref={toastRef} />
 *   showToast('Message ici');
 *   showToast('Erreur !', 'error');
 */

export function useToast() {
    const toastRef = useRef(null);

    const showToast = (message, type = 'success') => {
        toastRef.current?.show(message, type);
    };

    return { toastRef, showToast };
}

const Toast = React.forwardRef((props, ref) => {
    const [visible, setVisible] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [type, setType] = React.useState('success');
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const timer = useRef(null);

    React.useImperativeHandle(ref, () => ({
        show(msg, toastType = 'success') {
            if (timer.current) clearTimeout(timer.current);
            setMessage(msg);
            setType(toastType);
            setVisible(true);

            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    speed: 20,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            timer.current = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: -100,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start(() => setVisible(false));
            }, 3000);
        }
    }));

    if (!visible) return null;

    const isError = type === 'error';
    const isWarning = type === 'warning';

    const bgColor = isError ? '#DC2626' : isWarning ? '#D97706' : '#16A34A';
    const iconName = isError ? 'close-circle' : isWarning ? 'warning' : 'checkmark-circle';

    return (
        <Animated.View
            style={[
                styles.container,
                { backgroundColor: bgColor, transform: [{ translateY }], opacity }
            ]}
        >
            <Ionicons name={iconName} size={20} color="#FFF" />
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 9999,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    text: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 10,
        flex: 1,
    },
});

export default Toast;
