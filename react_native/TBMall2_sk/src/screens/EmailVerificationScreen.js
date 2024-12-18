import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useEmailVerification } from '../context/EmailVerificationContext';

const EmailVerificationScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const { sendVerificationCode, verifyCode } = useEmailVerification();

  const handleSendCode = () => {
    const code = sendVerificationCode(email);
    setSentCode(code);
    Alert.alert('알림', `인증번호가 발송되었습니다: ${code}`);
  };

  const handleVerify = () => {
    if (verifyCode(email, verificationCode)) {
      Alert.alert('성공', '이메일 인증이 완료되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        }
      ]);
    } else {
      Alert.alert('실패', '인증번호가 일치하지 않습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>이메일 인증</Text>
      <Text style={styles.email}>{email}</Text>

      <TouchableOpacity 
        style={styles.sendButton}
        onPress={handleSendCode}
      >
        <Text style={styles.sendButtonText}>인증번호 발송</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="인증번호 6자리 입력"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <TouchableOpacity 
          style={styles.verifyButton}
          onPress={handleVerify}
        >
          <Text style={styles.verifyButtonText}>확인</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.notice}>
        * 이메일로 발송된 인증번호 6자리를 입력해주세요.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: '#5f0080',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    marginRight: 10,
  },
  verifyButton: {
    backgroundColor: '#5f0080',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notice: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
  },
});

export default EmailVerificationScreen; 