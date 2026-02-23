import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';

const CustomDrawerContent = (props) => {
    const { user, logout, hasPermission } = useAuth();
    const { state, navigation } = props;
    const [language, setLanguage] = React.useState('fr');

    // Find the current active route in the whole drawer
    const activeRouteName = state.routeNames[state.index];

    // If we are in MainTabs, we need to know WHICH tab is active
    let activeTab = '';
    if (activeRouteName === 'MainTabs') {
        const mainTabsRoute = state.routes[state.index];
        const tabState = mainTabsRoute.state;
        if (tabState) {
            activeTab = tabState.routeNames[tabState.index];
        } else {
            activeTab = 'Home';
        }
    }

    const canAccessAdmin = hasPermission('dashboard_access');

    const navigationItems = [
        { label: 'Accueil', icon: 'home-outline', activeIcon: 'home', screen: 'Home', type: 'tab' },
        { label: 'Réservation', icon: 'bus-outline', activeIcon: 'bus', screen: 'Transport', type: 'tab' },
        { label: 'Santé Plus', icon: 'basket-outline', activeIcon: 'basket', screen: 'Store', type: 'tab' },
        { label: 'Historique', icon: 'time-outline', activeIcon: 'time', screen: 'History', type: 'tab' },
        { label: 'Mon Profil', icon: 'person-outline', activeIcon: 'person', screen: 'Profile', type: 'tab' },
    ];

    const extraItems = [
        { label: 'À Propos', icon: 'information-circle-outline', screen: 'DrawerAbout', type: 'drawer' },
        { label: 'Aide & Support', icon: 'help-circle-outline', screen: 'DrawerHelp', type: 'drawer' },
    ];

    const handleNavigate = (item) => {
        if (item.type === 'tab') {
            navigation.navigate('MainTabs', { screen: item.screen });
        } else {
            navigation.navigate(item.screen);
        }
    };

    const isItemActive = (item) => {
        if (item.type === 'tab') {
            return activeRouteName === 'MainTabs' && activeTab === item.screen;
        }
        return activeRouteName === item.screen;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>{user?.name}</Text>
                    <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
                </View>
            </View>

            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerItems}>
                {navigationItems.map((item, index) => {
                    const active = isItemActive(item);
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.drawerItem, active && styles.activeDrawerItem]}
                            onPress={() => handleNavigate(item)}
                        >
                            <Ionicons
                                name={active ? item.activeIcon : item.icon}
                                size={22}
                                color={active ? Colors.secondary : 'rgba(255,255,255,0.6)'}
                            />
                            <Text style={[styles.drawerLabel, active && styles.activeDrawerLabel]}>{item.label}</Text>
                        </TouchableOpacity>
                    );
                })}

                <View style={styles.divider} />

                {canAccessAdmin && (
                    <TouchableOpacity
                        style={[styles.drawerItem, activeRouteName === 'Admin' && styles.activeDrawerItem]}
                        onPress={() => navigation.navigate('Admin')}
                    >
                        <Ionicons
                            name={activeRouteName === 'Admin' ? "settings" : "settings-outline"}
                            size={22}
                            color={activeRouteName === 'Admin' ? Colors.secondary : 'rgba(255,255,255,0.6)'}
                        />
                        <Text style={[styles.drawerLabel, activeRouteName === 'Admin' && styles.activeDrawerLabel]}>Administration</Text>
                    </TouchableOpacity>
                )}

                {extraItems.map((item, index) => {
                    const active = isItemActive(item);
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.drawerItem, active && styles.activeDrawerItem]}
                            onPress={() => handleNavigate(item)}
                        >
                            <Ionicons
                                name={item.icon}
                                size={22}
                                color={active ? Colors.secondary : 'rgba(255,255,255,0.6)'}
                            />
                            <Text style={[styles.drawerLabel, active && styles.activeDrawerLabel]}>{item.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </DrawerContentScrollView>

            <View style={styles.footer}>
                <View style={styles.langSelector}>
                    <TouchableOpacity
                        style={[styles.langBtn, language === 'fr' && styles.langBtnActive]}
                        onPress={() => setLanguage('fr')}
                    >
                        <Text style={[styles.langText, language === 'fr' && styles.langTextActive]}>FR</Text>
                    </TouchableOpacity>
                    <View style={styles.langDivider} />
                    <TouchableOpacity
                        style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
                        onPress={() => setLanguage('en')}
                    >
                        <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>EN</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Ionicons name="log-out-outline" size={22} color={Colors.error} />
                    <Text style={styles.logoutText}>Déconnexion</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontFamily: 'Poppins_700Bold',
        color: '#FFF',
    },
    userInfo: {
        marginLeft: 16,
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        color: '#FFF',
    },
    userEmail: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
        color: 'rgba(255,255,255,0.6)',
    },
    drawerItems: {
        paddingTop: 8,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginVertical: 4,
        marginHorizontal: 8,
        borderRadius: 12,
    },
    activeDrawerItem: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    drawerLabel: {
        marginLeft: 16,
        fontSize: 15,
        fontFamily: 'Poppins_500Medium',
        color: 'rgba(255,255,255,0.8)',
    },
    activeDrawerLabel: {
        color: Colors.secondary,
        fontFamily: 'Poppins_600SemiBold',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 12,
        marginHorizontal: 24,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    logoutText: {
        marginLeft: 12,
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: Colors.error,
    },
    langSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: 3,
        marginBottom: 20,
        width: 80, // Fixed smaller width
    },
    langBtn: {
        flex: 1,
        height: 28, // Smaller height
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
    },
    langBtnActive: {
        backgroundColor: Colors.secondary,
    },
    langText: {
        fontSize: 12, // Smaller font
        fontFamily: 'Poppins_600SemiBold',
        color: 'rgba(255,255,255,0.5)',
    },
    langTextActive: {
        color: '#FFF',
    },
    langDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});

export default CustomDrawerContent;
