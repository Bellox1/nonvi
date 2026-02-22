import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();


const CACHE_VERSION = 'v6';
const DEEPL_API_KEY = 'dc90c4fc-cea6-402b-bd00-0a50e933c577:fx';

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('fr');
    const [cacheEn, setCacheEn] = useState({});

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem('user_language');
            const savedVersion = await AsyncStorage.getItem('translation_cache_version');

            if (savedVersion !== CACHE_VERSION) {
                await AsyncStorage.removeItem('translation_cache_en');
                await AsyncStorage.setItem('translation_cache_version', CACHE_VERSION);
                setCacheEn({});
            } else {
                const savedCache = await AsyncStorage.getItem('translation_cache_en');
                if (savedCache) setCacheEn(JSON.parse(savedCache));
            }

            if (savedLanguage) setLanguage(savedLanguage);
        } catch (error) {
            console.error('Error loading language', error);
        }
    };

    const changeLanguage = async (newLang) => {
        setLanguage(newLang);
        await AsyncStorage.setItem('user_language', newLang);
    };

    const translateText = async (text) => {
        if (!text || language === 'fr') return text;
        if (cacheEn[text]) return cacheEn[text];

        try {
            const response = await fetch("https://api-free.deepl.com/v2/translate", {
                method: "POST",
                headers: {
                    "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    text: text,
                    target_lang: "EN",
                    source_lang: "FR"
                }).toString()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.translations && data.translations[0]) {
                    const translated = data.translations[0].text;
                    setCacheEn(prev => {
                        const newCache = { ...prev, [text]: translated };
                        AsyncStorage.setItem('translation_cache_en', JSON.stringify(newCache));
                        return newCache;
                    });
                    return translated;
                }
            }
        } catch (e) {
            console.error("DeepL Fetch Error:", e);
        }

        return text;
    };

    const t = (text) => {
        // On retourne le texte tel quel pour le français
        if (language === 'fr') return text;

        // Pour l'anglais, on regarde dans le cache
        if (cacheEn[text]) return cacheEn[text];

        // On lance la traduction en tâche de fond si nécessaire
        // (Note: Dans une app réelle, on utiliserait un état de chargement ou i18next)
        translateText(text);

        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, translateText, cacheEn }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
