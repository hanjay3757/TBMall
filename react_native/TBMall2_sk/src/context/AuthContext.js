import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState(null);

  const login = (token) => {
    setIsLoggedIn(true);
    setUserToken(token);
    // AsyncStorage에 토큰 저장 로직 추가
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserToken(null);
    // AsyncStorage에서 토큰 제거 로직 추가
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 