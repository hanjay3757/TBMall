import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { userToken } = useAuth();

  useEffect(() => {
    // 앱 시작시 저장된 장바구니 데이터 로드
    loadCartItems();
  }, []);

  // 로그아웃 시 장바구니 비우기
  useEffect(() => {
    if (!userToken) {
      clearCart();
    }
  }, [userToken]);

  // 장바구니 데이터 로드
  const loadCartItems = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cartItems');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('장바구니 데이터 로드 실패:', error);
    }
  };

  // 장바구니 데이터 저장
  const saveCartItems = async (items) => {
    try {
      await AsyncStorage.setItem('cartItems', JSON.stringify(items));
    } catch (error) {
      console.error('장바구니 데이터 저장 실패:', error);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // 동일한 상품과 옵션을 가진 아이템 찾기
      const existingItem = prevItems.find(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(product.selectedOptions)
      );

      if (existingItem) {
        const updatedItems = prevItems.map(item =>
          item.id === product.id &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(product.selectedOptions)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        saveCartItems(updatedItems);
        return updatedItems;
      }

      const newItems = [...prevItems, { ...product, quantity }];
      saveCartItems(newItems);
      return newItems;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== productId);
      saveCartItems(newItems);
      return newItems;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
      saveCartItems(newItems);
      return newItems;
    });
  };

  const clearCart = async () => {
    try {
      await AsyncStorage.removeItem('cartItems');
      setCartItems([]);
    } catch (error) {
      console.error('장바구니 비우기 실패:', error);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 