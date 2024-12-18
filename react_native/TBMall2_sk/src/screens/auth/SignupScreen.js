import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useEmailVerification } from '../../context/EmailVerificationContext';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
  });
  const { isEmailVerified } = useEmailVerification();

  const handleSignup = () => {
    // 유효성 검사
    if (!formData.email || !formData.password || !formData.name || !formData.phone) {
      Alert.alert('알림', '모든 필드를 입력해주세요.');
      return;
    }
    
    if (!isEmailVerified(formData.email)) {
      Alert.alert('알림', '이메일 인증이 필요합니다.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    // API 호출 로직 추가
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <View style={styles.emailContainer}>
            <TextInput
              style={[styles.input, styles.emailInput]}
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={() => navigation.navigate('이메일인증', { email: formData.email })}
            >
              <Text style={styles.verifyButtonText}>인증</Text>
            </TouchableOpacity>
          </View>
          {isEmailVerified(formData.email) && (
            <Text style={styles.verifiedText}>✓ 인증완료</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput
            style={styles.input}
            value={formData.passwordConfirm}
            onChangeText={(text) => setFormData({...formData, passwordConfirm: text})}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>휴대폰</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 5,
  },
  signupButton: {
    backgroundColor: '#5f0080',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailContainer: {
    flexDirection: 'row',
  },
  emailInput: {
    flex: 1,
    marginRight: 10,
  },
  verifyButton: {
    backgroundColor: '#5f0080',
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 5,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  verifiedText: {
    color: '#5f0080',
    marginTop: 5,
  },
});

export default SignupScreen; 