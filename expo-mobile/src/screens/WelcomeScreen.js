import React, { useRef, useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Image, Dimensions, ScrollView, Platform
} from 'react-native';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../api/client';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const scrollRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slides, setSlides] = useState([
        {
            image: require('../../assets/app/nonvivoyageplus_cover.webp'),
            title: 'Bienvenue sur\nNonvi Voyage Plus',
            subtitle: 'Votre partenaire de voyage au Bénin',
        },
        {
            image: require('../../assets/app/reservation.webp'),
            title: 'Réservez votre\nvoyage en 1 clic',
            subtitle: 'Choisissez votre départ, votre destination et partez sereinement',
        },
        {
            image: require('../../assets/app/vue1.webp'),
            title: 'Nos Stations',
            subtitle: 'Un réseau de stations pour vous servir dans tout le pays',
        },
    ]);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await client.get('/stations');
                if (response.data && Array.isArray(response.data)) {
                    const uniqueCities = [...new Set(response.data.map(s => s.ville))].sort();
                    if (uniqueCities.length > 0) {
                        const cityList = uniqueCities.join(', ');
                        setSlides(prev => {
                            const newSlides = [...prev];
                            newSlides[2].title = `Naviguer entre ${cityList}`;
                            newSlides[2].subtitle = 'Un réseau de stations pour vous servir partout au Bénin';
                            return newSlides;
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching stations for welcome slider:', error);
            }
        };

        fetchStations();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const next = (currentIndex + 1) % slides.length;
            scrollRef.current?.scrollTo({ x: next * width, animated: true });
            setCurrentIndex(next);
        }, 3500);
        return () => clearInterval(timer);
    }, [currentIndex, slides.length]);

    const handleScroll = (e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
        setCurrentIndex(idx);
    };

    return (
        <View style={styles.container}>
            {/* Background Image Carousel */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
                style={StyleSheet.absoluteFill}
            >
                {slides.map((slide, i) => (
                    <Image
                        key={i}
                        source={slide.image}
                        style={styles.bgImage}
                        resizeMode="cover"
                    />
                ))}
            </ScrollView>

            {/* Dark overlay */}
            <View style={styles.overlay} />

            {/* Logo */}
            <View style={[styles.logoContainer, { paddingTop: Math.max(insets.top, 20) }]}>
                <Image
                    source={require('../../assets/app_image.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* Text content */}
            <View style={styles.content}>
                <Text style={styles.title}>{slides[currentIndex].title}</Text>
                <Text style={styles.subtitle}>{slides[currentIndex].subtitle}</Text>

                {/* Dots */}
                <View style={styles.dots}>
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, i === currentIndex && styles.dotActive]}
                        />
                    ))}
                </View>
            </View>

            {/* Buttons */}
            <View style={[styles.buttons, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.btnPrimaryText}>Se connecter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.btnSecondary}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.btnSecondaryText}>Créer un compte</Text>
                    <Ionicons name="arrow-forward" size={18} color={Colors.secondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    bgImage: {
        width,
        height,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.52)',
    },
    logoContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 20,
    },
    content: {
        position: 'absolute',
        bottom: 250,
        left: 28,
        right: 28,
    },
    title: {
        fontSize: 34,
        fontFamily: 'Poppins_700Bold',
        color: '#FFF',
        lineHeight: 42,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'Poppins_400Regular',
        color: 'rgba(255,255,255,0.78)',
        lineHeight: 22,
        marginBottom: 24,
    },
    dots: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    dotActive: {
        width: 24,
        backgroundColor: Colors.secondary,
    },
    buttons: {
        position: 'absolute',
        bottom: 0,
        left: 28,
        right: 28,
        gap: 12,
    },
    btnPrimary: {
        backgroundColor: Colors.secondary,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    btnPrimaryText: {
        color: '#FFF',
        fontSize: 17,
        fontFamily: 'Poppins_700Bold',
    },
    btnSecondary: {
        height: 56,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    btnSecondaryText: {
        color: '#FFF',
        fontSize: 17,
        fontFamily: 'Poppins_600SemiBold',
    },
});

export default WelcomeScreen;
