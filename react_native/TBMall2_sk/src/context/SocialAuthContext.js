import React, { createContext, useContext } from 'react';
import { Alert } from 'react-native';
import { login as KakaoLogin } from '@react-native-seoul/kakao-login';
import NaverLogin from '@react-native-seoul/naver-login';
import { useAuth } from './AuthContext';

const SocialAuthContext = createContext();

const naverLoginConfig = {
  kConsumerKey: 'YOUR_NAVER_CLIENT_ID',
  kConsumerSecret: 'YOUR_NAVER_CLIENT_SECRET',
  kServiceAppName: '마켓컬리',
};

export const SocialAuthProvider = ({ children }) => {
  const { login } = useAuth();

  const handleKakaoLogin = async () => {
    try {
      const token = await KakaoLogin();
      // 서버에 토큰 전송 및 사용자 정보 요청
      // const userInfo = await fetchUserInfo(token);
      login(token); // AuthContext의 login 함수 호출
    } catch (error) {
      Alert.alert('로그인 실패', '카카오 로그인에 실패했습니다.');
      console.error(error);
    }
  };

  const handleNaverLogin = async () => {
    try {
      const { successResponse } = await NaverLogin.login(naverLoginConfig);
      // 서버에 토큰 전송 및 사용자 정보 ��청
      // const userInfo = await fetchUserInfo(successResponse.accessToken);
      login(successResponse.accessToken);
    } catch (error) {
      Alert.alert('로그인 실패', '네이버 로그인에 실패했습니다.');
      console.error(error);
    }
  };

  return (
    <SocialAuthContext.Provider
      value={{
        handleKakaoLogin,
        handleNaverLogin,
      }}
    >
      {children}
    </SocialAuthContext.Provider>
  );
};

export const useSocialAuth = () => useContext(SocialAuthContext); 