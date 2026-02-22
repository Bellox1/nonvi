import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const savedCart = await AsyncStorage.getItem('shopping_cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (e) {
            console.error('Failed to load cart', e);
        }
    };

    const saveCart = async (items) => {
        try {
            await AsyncStorage.setItem('shopping_cart', JSON.stringify(items));
        } catch (e) {
            console.error('Failed to save cart', e);
        }
    };

    const addToCart = (product, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            let newItems;
            if (existingItem) {
                newItems = prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newItems = [...prevItems, { ...product, quantity }];
            }
            saveCart(newItems);
            return newItems;
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => {
            const newItems = prevItems.filter(item => item.id !== productId);
            saveCart(newItems);
            return newItems;
        });
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCartItems(prevItems => {
            const newItems = prevItems.map(item =>
                item.id === productId ? { ...item, quantity } : item
            );
            saveCart(newItems);
            return newItems;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        saveCart([]);
    };

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + (item.prix * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
