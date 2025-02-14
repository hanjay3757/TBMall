import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { SERVER_URL } from '../config';

function StaffRegister() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState({
    member_id: '',
    member_pw: '',
    member_nick: '',
    member_gender: '',
    member_birth: '',
    member_phone: '',
    member_email: '',
    email_domain: 'naver.com',
    position_no: '3',
    admin_no: null
  });

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigation.navigate('Home');
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      if (!userInfo.isAdmin) {
        Alert.alert('오류', '관리자만 접근할 수 있습니다.');
        navigation.navigate('Home');
        return;
      }

      setStaffData(prev => ({
        ...prev,
        admin_no: userInfo.member_no
      }));
      setLoading(false);
    } catch (error) {
      console.error('관리자 권한 확인 실패:', error);
      Alert.alert('오류', '권한 확인 중 오류가 발생했습니다.');
      navigation.navigate('Home');
    }
  };

  const handlePhoneChange = (text) => {
    const value = text.replace(/[^0-9]/g, '');
    let formattedNumber = '';
    
    if (value.length <= 11) {
      if (value.length <= 3) {
        formattedNumber = value;
      } else if (value.length <= 7) {
        formattedNumber = `${value.slice(0, 3)}-${value.slice(3)}`;
      } else {
        formattedNumber = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
      }
      
      setStaffData(prev => ({
        ...prev,
        member_phone: formattedNumber
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!staffData.admin_no) {
        Alert.alert('오류', '관리자 권한이 필요합니다.');
        return;
      }

      // 필수 필드 검증
      if (!staffData.member_id || !staffData.member_pw || !staffData.member_nick ||
          !staffData.member_gender || !staffData.member_birth || !staffData.member_phone ||
          !staffData.member_email) {
        Alert.alert('오류', '모든 필수 항목을 입력해주세요.');
        return;
      }

      const fullEmail = `${staffData.member_email}@${staffData.email_domain}`;
      const submitData = {
        ...staffData,
        member_email: fullEmail
      };

      const response = await axios.post(
        '/staff/register',
        submitData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        Alert.alert('성공', '직원이 등록되었습니다.', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        Alert.alert('실패', response.data.message || '직원 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('직원 등록 실패:', error.response || error);
      Alert.alert('오류', '직원 등록 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>직원 등록</Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={staffData.member_id}
            onChangeText={(text) => setStaffData({...staffData, member_id: text})}
            placeholder="아이디 (5~20자)"
          />
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={staffData.member_pw}
            onChangeText={(text) => setStaffData({...staffData, member_pw: text})}
            placeholder="비밀번호 (문자, 숫자, 특수문자 포함 8~20자)"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={staffData.member_nick}
            onChangeText={(text) => setStaffData({...staffData, member_nick: text})}
            placeholder="이름을 입력하세요"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={[
                styles.radioButton,
                staffData.member_gender === 'M' && styles.radioButtonSelected
              ]}
              onPress={() => setStaffData(prev => ({ ...prev, member_gender: 'M' }))}
            >
              <Text style={styles.radioText}>남성</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.radioButton,
                staffData.member_gender === 'F' && styles.radioButtonSelected
              ]}
              onPress={() => setStaffData(prev => ({ ...prev, member_gender: 'F' }))}
            >
              <Text style={styles.radioText}>여성</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={staffData.member_birth}
            onChangeText={(text) => setStaffData({...staffData, member_birth: text})}
            placeholder="생년월일 (YYYY-MM-DD)"
          />
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={staffData.member_phone}
            onChangeText={handlePhoneChange}
            placeholder="전화번호를 입력하세요"
            keyboardType="numeric"
            maxLength={13}
          />
        </View>

        <View style={styles.emailGroup}>
          <TextInput
            style={[styles.input, styles.emailInput]}
            value={staffData.member_email}
            onChangeText={(text) => setStaffData({...staffData, member_email: text})}
            placeholder="이메일"
          />
          <Text style={styles.emailAt}>@</Text>
          <View style={styles.emailDomainPicker}>
            <Picker
              selectedValue={staffData.email_domain}
              onValueChange={(value) => setStaffData({...staffData, email_domain: value})}
              style={styles.picker}
            >
              <Picker.Item label="naver.com" value="naver.com" />
              <Picker.Item label="gmail.com" value="gmail.com" />
              <Picker.Item label="daum.net" value="daum.net" />
            </Picker>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>등록</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  radioButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  radioTextSelected: {
    color: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  emailInput: {
    flex: 1,
  },
  emailAt: {
    marginHorizontal: 10,
  },
  emailDomainPicker: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center'
  },
  picker: {
    height: 50
  }
});

export default StaffRegister; 