import React from 'react';
import { View, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Colors from '../theme/Colors';
import { Ionicons } from '@expo/vector-icons';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import TransportScreen from '../screens/TransportScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AboutScreen from '../screens/AboutScreen';
import CartScreen from '../screens/CartScreen';
import HelpScreen from '../screens/HelpScreen';
import CustomDrawerContent from './CustomDrawerContent';
import ReceiptScreen from '../screens/ReceiptScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminReservationScreen from '../screens/admin/AdminReservationScreen';
import AdminUserScreen from '../screens/admin/AdminUserScreen';
import AdminStationScreen from '../screens/admin/AdminStationScreen';
import AdminProductScreen from '../screens/admin/AdminProductScreen';
import AdminClientScreen from '../screens/admin/AdminClientScreen';
import AdminColisScreen from '../screens/admin/AdminColisScreen';
import AdminAuditLogScreen from '../screens/admin/AdminAuditLogScreen';
import AdminRoleScreen from '../screens/admin/AdminRoleScreen';
import AdminTarifScreen from '../screens/admin/AdminTarifScreen';
import AdminPubScreen from '../screens/admin/AdminPubScreen';
import AdminScannerScreen from '../screens/admin/AdminScannerScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import PubsNotifScreen from '../screens/PubsNotifScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const AdminStack = createStackNavigator();

const TabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Transport') iconName = focused ? 'bus' : 'bus-outline';
                    else if (route.name === 'Store') iconName = focused ? 'basket' : 'basket-outline';
                    else if (route.name === 'History') iconName = focused ? 'time' : 'time-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: Colors.secondary,
                tabBarInactiveTintColor: Colors.textLight,
                tabBarStyle: {
                    height: Platform.OS === 'ios' ? 88 : 65 + (insets.bottom > 0 ? insets.bottom - 10 : 0),
                    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
                    paddingTop: 8,
                    backgroundColor: Colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: Colors.border,
                },
                headerShown: false
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
            <Tab.Screen name="Transport" component={TransportScreen} options={{ title: 'Réservation' }} />
            <Tab.Screen name="Store" component={ProductListScreen} options={{ title: 'Santé Plus' }} />
            <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Historique' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
        </Tab.Navigator>
    );
};

const AdminNavigator = () => (
    <AdminStack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.primary,
            headerTitleStyle: { fontFamily: 'Poppins_600SemiBold' },
            headerBackTitle: '',
            headerBackTitleVisible: false,
        }}
    >
        <AdminStack.Screen name="Dashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
        <AdminStack.Screen name="AdminReservations" component={AdminReservationScreen} options={{ headerShown: false }} />
        <AdminStack.Screen name="AdminUsers" component={AdminUserScreen} options={{ headerShown: false }} />
        <AdminStack.Screen name="AdminStations" component={AdminStationScreen} options={{ headerShown: false }} />
        <AdminStack.Screen name="AdminProducts" component={AdminProductScreen} options={{ headerShown: false }} />
        <AdminStack.Screen name="AdminClients" component={AdminClientScreen} options={{ headerShown: false }} />
        <AdminStack.Screen name="AdminColis" component={AdminColisScreen} options={{ headerShown: false }} />
        <AdminStack.Screen name="AdminLogs" component={AdminAuditLogScreen} options={{ headerShown: false }} />
        <AdminStack.Screen name="AdminRoles" component={AdminRoleScreen} options={{ headerShown: false }} />
        <AdminStack.Screen name="AdminTarifs" component={AdminTarifScreen} options={{ headerShown: false }} />
        <AdminStack.Screen name="AdminPubs" component={AdminPubScreen} options={{ headerShown: false }} />
        <AdminStack.Screen name="AdminScanner" component={AdminScannerScreen} options={{ headerShown: false }} />
    </AdminStack.Navigator>
);

const DrawerNavigator = () => {
    const { user, hasPermission } = useAuth();
    const canAccessAdmin = hasPermission('dashboard_access');

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: Colors.surface },
                headerTintColor: Colors.primary,
                headerTitleStyle: { fontFamily: 'Poppins_600SemiBold' },
                drawerActiveTintColor: Colors.secondary,
                drawerLabelStyle: { fontFamily: 'Poppins_500Medium', marginLeft: -10 }
            }}
        >
            <Drawer.Screen
                name="MainTabs"
                component={TabNavigator}
                options={{
                    title: 'Accueil',
                    headerShown: false,
                }}
            />

            {canAccessAdmin && (
                <Drawer.Screen
                    name="Admin"
                    component={AdminNavigator}
                    options={{
                        title: 'Administration',
                        headerShown: false,
                    }}
                />
            )}

            <Drawer.Screen
                name="DrawerAbout"
                component={AboutScreen}
                options={({ navigation }) => ({
                    title: 'À Propos',
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => navigation.toggleDrawer()}>
                            <Ionicons name="apps" size={28} color={Colors.primary} />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Drawer.Screen
                name="DrawerHelp"
                component={HelpScreen}
                options={({ navigation }) => ({
                    title: 'Aide & Support',
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => navigation.toggleDrawer()}>
                            <Ionicons name="apps" size={28} color={Colors.primary} />
                        </TouchableOpacity>
                    ),
                })}
            />
        </Drawer.Navigator>
    );
};

const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.secondary} />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{
            headerShown: false,
            headerBackTitleVisible: false,
            headerBackTitle: '',
            cardStyle: { backgroundColor: Colors.background },
            cardOverlayEnabled: false,
            animationEnabled: true,
        }}>
            {user ? (
                <>
                    <Stack.Screen name="Drawer" component={DrawerNavigator} />
                    <Stack.Screen name="Receipt" component={ReceiptScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="PubsNotif" component={PubsNotifScreen} options={{ headerShown: false }} />
                    <Stack.Screen
                        name="ProductDetail"
                        component={ProductDetailScreen}
                        options={{
                            headerShown: true,
                            title: 'Détail Produit',
                            headerStyle: { backgroundColor: Colors.surface },
                            headerTitleStyle: { fontFamily: 'Poppins_600SemiBold' },
                            headerBackTitle: '',
                            headerBackTitleVisible: false,
                        }}
                    />
                    <Stack.Screen
                        name="Cart"
                        component={CartScreen}
                        options={{
                            headerShown: true,
                            title: 'Mon Panier',
                            headerStyle: { backgroundColor: Colors.surface },
                            headerTitleStyle: { fontFamily: 'Poppins_600SemiBold' },
                            headerBackTitle: '',
                            headerBackTitleVisible: false,
                        }}
                    />
                    <Stack.Screen
                        name="Help"
                        component={HelpScreen}
                        options={({ navigation }) => ({
                            title: 'Aide & Support',
                            headerShown: true,
                            headerStyle: { backgroundColor: Colors.surface },
                            headerTitleStyle: { fontFamily: 'Poppins_600SemiBold' },
                            headerLeft: () => (
                                <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => navigation.goBack()}>
                                    <Ionicons name="apps" size={28} color={Colors.primary} />
                                </TouchableOpacity>
                            ),
                        })}
                    />
                    <Stack.Screen
                        name="About"
                        component={AboutScreen}
                        options={({ navigation }) => ({
                            title: 'À Propos',
                            headerShown: true,
                            headerStyle: { backgroundColor: Colors.surface },
                            headerTitleStyle: { fontFamily: 'Poppins_600SemiBold' },
                            headerLeft: () => (
                                <TouchableOpacity style={{ marginLeft: 20 }} onPress={() => navigation.goBack()}>
                                    <Ionicons name="apps" size={28} color={Colors.primary} />
                                </TouchableOpacity>
                            ),
                        })}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
