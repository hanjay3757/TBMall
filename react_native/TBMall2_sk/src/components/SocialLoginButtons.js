import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSocialAuth } from '../context/SocialAuthContext';

const SocialLoginButtons = () => {
  const { handleKakaoLogin, handleNaverLogin } = useSocialAuth();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.kakaoButton]}
        onPress={handleKakaoLogin}
      >
        <Icon 
          name="chatbubble" 
          size={20} 
          color="#000000" 
          style={styles.icon}
        />
        <Text style={styles.kakaoText}>카카오로 시작하기</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.naverButton]}
        onPress={handleNaverLogin}
      >
        <Icon 
          name="logo-github" 
          size={20} 
          color="#FFFFFF" 
          style={styles.icon}
        />
        <Text style={styles.naverText}>네이버로 시작하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 5,
    justifyContent: 'center',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
  },
  naverButton: {
    backgroundColor: '#03C75A',
  },
  icon: {
    marginRight: 8,
  },
  kakaoText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  naverText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SocialLoginButtons; 