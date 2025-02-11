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
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function StaffEdit() {
  const navigation = useNavigation();
  const route = useRoute();
  const { member_no } = route.params;
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState({
    member_id: '',
    member_pw: '',
    member_nick: '',
    position_no: '',
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

      loadStaffDetails();
    } catch (error) {
      console.error('관리자 권한 확인 실패:', error);
      Alert.alert('오류', '권한 확인 중 오류가 발생했습니다.');
      navigation.navigate('Home');
    }
  };

  const loadStaffDetails = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/staff/detail/${member_no}`);
      setStaffData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('직원 정보 로딩 실패:', error);
      Alert.alert('오류', '직원 정보를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const adminNo = await AsyncStorage.getItem('member_no');
      if (!adminNo) {
        Alert.alert('오류', '관리자 권한이 필요합니다.');
        return;
      }

      const params = new URLSearchParams();
      Object.keys(staffData).forEach(key => {
        params.append(key, staffData[key]);
      });
      params.append('admin_no', adminNo);

      const response = await axios.post(`${SERVER_URL}/staff/edit`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        Alert.alert('성공', '직원 정보가 수정되었습니다.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('실패', response.data.message || '직원 정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('오류', '직원 정보 수정 중 오류가 발생했습니다.');
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
        <Text style={styles.title}>직원 정보 수정</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>아이디</Text>
          <TextInput
            style={styles.input}
            value={staffData.member_id}
            onChangeText={(text) => setStaffData(prev => ({
              ...prev,
              member_id: text
            }))}
            editable={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>새 비밀번호</Text>
          <TextInput
            style={styles.input}
            value={staffData.member_pw}
            onChangeText={(text) => setStaffData(prev => ({
              ...prev,
              member_pw: text
            }))}
            placeholder="새 비밀번호를 입력하세요"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            value={staffData.member_nick}
            onChangeText={(text) => setStaffData(prev => ({
              ...prev,
              member_nick: text
            }))}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>직급</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={[
                styles.radioButton,
                staffData.position_no === '2' && styles.radioButtonSelected
              ]}
              onPress={() => setStaffData(prev => ({ ...prev, position_no: '2' }))}
            >
              <Text style={styles.radioText}>관리자</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.radioButton,
                staffData.position_no === '3' && styles.radioButtonSelected
              ]}
              onPress={() => setStaffData(prev => ({ ...prev, position_no: '3' }))}
            >
              <Text style={styles.radioText}>일반 직원</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>수정</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default StaffEdit;