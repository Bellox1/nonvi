import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    async function loadStorageData() {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const savedUser = await AsyncStorage.getItem('user');

            if (token && savedUser) {
                setUser(JSON.parse(savedUser));
                // Verify token validity
                client.get('/me').then(res => {
                    setUser(res.data);
                    AsyncStorage.setItem('user', JSON.stringify(res.data));
                }).catch(() => {
                    logout();
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const login = async (tel, password) => {
        const response = await client.post('/login', { tel, password });
        const { token, user: userData } = response.data;

        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const register = async (name, tel, password, password_confirmation, otp) => {
        const response = await client.post('/register', {
            name,
            tel,
            password,
            password_confirmation,
            otp
        });
        const { token, user: userData } = response.data;

        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try {
            await client.post('/logout');
        } catch (e) { }
        await AsyncStorage.clear();
        setUser(null);
    };

    const updateProfile = async (data) => {
        const response = await client.put('/profile', data);
        setUser(response.data.user);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
    };

    const hasPermission = (permission) => {
        if (!user || !user.roles) return false;
        return user.roles.some(role =>
            role.permissions && role.permissions.some(p => p.title === permission)
        );
    };

    const refreshUser = async () => {
        try {
            const res = await client.get('/me');
            setUser(res.data);
            await AsyncStorage.setItem('user', JSON.stringify(res.data));
            return res.data;
        } catch (e) {
            console.error('Refresh user failed', e);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateProfile,
            refreshUser,
            isAuthenticated: !!user,
            hasPermission
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
