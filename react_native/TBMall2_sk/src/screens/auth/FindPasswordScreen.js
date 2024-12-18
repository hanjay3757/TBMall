import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useEmailVerification } from '../../context/EmailVerificationContext';

const FindPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 인증번호 확인, 3: 새 비밀번호 설정
  const { sendVerificationCode, verifyCode } = useEmailVerification();

  const handleSendCode = () => {
    if (!email) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    // 실제로는 서버에서 해당 이메일이 존재하는지 확인해야 합니다
    const code = sendVerificationCode(email);
    Alert.alert('알림', `인증번호가 발송되었습니다: ${code}`);
    setStep(2);
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      Alert.alert('알림', '인증번호를 입력해주세요.');
      return;
    }
    if (verifyCode(email, verificationCode)) {
      setStep(3);
    } else {
      Alert.alert('실패', '인증번호가 일치하지 않습니다.');
    }
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('알림', '새 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }
    // 실제로는 서버에 새 비밀번호를 전송하여 업데이트해야 합니다
    Alert.alert('성공', '비밀번호가 변경되었습니다.', [
      {
        text: '확인',
        onPress: () => navigation.navigate('로그인'),
      },
    ]);
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.label}>이메일</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="이메일 주소를 입력하세요"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleSendCode}>
        <Text style={styles.buttonText}>인증번호 받기</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.label}>인증번호</Text>
      <TextInput
        style={styles.input}
        value={verificationCode}
        onChangeText={setVerificationCode}
        placeholder="인증번호 6자리를 입력하세요"
        keyboardType="number-pad"
        maxLength={6}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
        <Text style={styles.buttonText}>확인</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.label}>새 비밀번호</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="새 비밀번호를 입력하세요"
        secureTextEntry
      />
      <Text style={styles.label}>비밀번호 확인</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="비밀번호를 다시 입력하세요"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>비밀번호 변경</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 찾기</Text>
      <View style={styles.stepIndicator}>
        <View style={[styles.step, step >= 1 && styles.activeStep]} />
        <View style={[styles.step, step >= 2 && styles.activeStep]} />
        <View style={[styles.step, step >= 3 && styles.activeStep]} />
      </View>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
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
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 8,
  },
  step: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  activeStep: {
    backgroundColor: '#5f0080',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5f0080',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FindPasswordScreen; 