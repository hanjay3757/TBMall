import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

const EmployeeDetailScreen = ({ route, navigation }) => {
  const initialEmployee = route.params?.employee || {
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    joinDate: '',
    salary: '',
    address: '',
  };

  const [employeeData, setEmployeeData] = useState(initialEmployee);
  const isEditing = route.params?.employee != null;

  const handleSave = () => {
    if (!employeeData.name || !employeeData.position || !employeeData.department) {
      Alert.alert('알림', '이름, 직급, 부서는 필수 입력사항입니다.');
      return;
    }

    // 여기에 API 호출 로직 구현
    Alert.alert(
      '성공',
      `직원 정보가 ${isEditing ? '수정' : '등록'}되었습니다.`,
      [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>
          {isEditing ? '직원 정보 수정' : '신규 직원 등록'}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이름 *</Text>
          <TextInput
            style={styles.input}
            value={employeeData.name}
            onChangeText={(text) => setEmployeeData({...employeeData, name: text})}
            placeholder="이름을 입력하세요"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>직급 *</Text>
          <TextInput
            style={styles.input}
            value={employeeData.position}
            onChangeText={(text) => setEmployeeData({...employeeData, position: text})}
            placeholder="직급을 입력하세요"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>부서 *</Text>
          <TextInput
            style={styles.input}
            value={employeeData.department}
            onChangeText={(text) => setEmployeeData({...employeeData, department: text})}
            placeholder="부서를 입력하세요"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            value={employeeData.email}
            onChangeText={(text) => setEmployeeData({...employeeData, email: text})}
            placeholder="이메일을 입력하세요"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>연락처</Text>
          <TextInput
            style={styles.input}
            value={employeeData.phone}
            onChangeText={(text) => setEmployeeData({...employeeData, phone: text})}
            placeholder="연락처를 입력하세요"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>입사일</Text>
          <TextInput
            style={styles.input}
            value={employeeData.joinDate}
            onChangeText={(text) => setEmployeeData({...employeeData, joinDate: text})}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>급여</Text>
          <TextInput
            style={styles.input}
            value={employeeData.salary}
            onChangeText={(text) => setEmployeeData({...employeeData, salary: text})}
            placeholder="급여를 입력하세요"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>주소</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={employeeData.address}
            onChangeText={(text) => setEmployeeData({...employeeData, address: text})}
            placeholder="주소를 입력하세요"
            multiline
            numberOfLines={2}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {isEditing ? '수정하기' : '등록하기'}
          </Text>
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
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#5f0080',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmployeeDetailScreen; 