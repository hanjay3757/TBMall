import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import SocialLoginButtons from '../../components/SocialLoginButtons';
import Icon from 'react-native-vector-icons/Ionicons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    // 테스트용 로그인 체크
    if (email === '1234' && password === '1234') {
      // 임시 사용자 정보
      const mockUserData = {
        id: '1',
        email: '1234',
        name: '테스트 사용자',
      };
      
      // 임시 토큰
      const mockToken = 'test_token_123';
      
      // 로그인 처리
      login(mockToken, mockUserData, keepLoggedIn);
    } else {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.keepLoggedInContainer}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            {
              backgroundColor: keepLoggedIn ? '#5f0080' : 'transparent',
              borderColor: keepLoggedIn ? '#5f0080' : '#666',
            },
          ]}
          onPress={() => setKeepLoggedIn(!keepLoggedIn)}
        >
          {keepLoggedIn && (
            <Icon name="checkmark" size={16} color="#fff" />
          )}
        </TouchableOpacity>
        <Text style={styles.keepLoggedInText}>로그인 상태 유지</Text>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.line} />
      </View>

      <SocialLoginButtons />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('회원가입')}>
          <Text style={styles.footerText}>회원가입</Text>
        </TouchableOpacity>
        <Text style={styles.footerDivider}>|</Text>
        <TouchableOpacity onPress={() => navigation.navigate('비밀번호찾기')}>
          <Text style={styles.footerText}>비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  inputContainer: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
  },
  loginButton: {
    backgroundColor: '#5f0080',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
    marginHorizontal: 10,
  },
  footerDivider: {
    color: '#ddd',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  keepLoggedInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  keepLoggedInText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen; 