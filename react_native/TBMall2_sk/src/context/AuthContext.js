import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  useEffect(() => {
    // 앱 시작시 로그인 상태 체크
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const savedUserInfo = await AsyncStorage.getItem('userInfo');
      const savedKeepLoggedIn = await AsyncStorage.getItem('keepLoggedIn');
      
      if (token && savedUserInfo && savedKeepLoggedIn === 'true') {
        setUserToken(token);
        setUserInfo(JSON.parse(savedUserInfo));
        setKeepLoggedIn(true);
      }
    } catch (error) {
      console.error('로그인 상태 체크 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token, user, keep = false) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
      await AsyncStorage.setItem('keepLoggedIn', keep.toString());
      setUserToken(token);
      setUserInfo(user);
      setKeepLoggedIn(keep);
    } catch (error) {
      console.error('로그인 정보 저장 실패:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      await AsyncStorage.removeItem('keepLoggedIn');
      setUserToken(null);
      setUserInfo(null);
      setKeepLoggedIn(false);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userInfo,
        keepLoggedIn,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 