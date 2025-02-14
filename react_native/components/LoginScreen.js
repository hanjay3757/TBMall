import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const params = new URLSearchParams();
      params.append('staffId', username);
      params.append('password', password);

      const response = await axios.post('/staff/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('로그인 응답:', response.data);  // 로그 추가

      if (response.data.success) {
        const userInfo = {
          member_no: response.data.member_no || 0,
          member_nick: response.data.member_nick,
          points: response.data.points || 0,
          position_no: response.data.position_no || 0,
          isAdmin: response.data.isAdmin,
        };

        console.log('저장할 userInfo:', userInfo);  // 로그 추가
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));

        // Home 화면으로 이동하면서 필요한 정보 전달
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Home',
              params: {
                isLoggedIn: true,
                isAdmin: userInfo.isAdmin,
                userInfo: userInfo
              }
            }
          ]
        });
      } else {
        Alert.alert('로그인 실패', response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 요청 실패:', error);
      Alert.alert('오류', '로그인에 실패했습니다.');
    }
  };

  // ... 나머지 코드
};

export default LoginScreen; 