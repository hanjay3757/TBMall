// src/components/RegisterItem.js
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

function RegisterItem() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    item_name: '',
    item_price: '',
    item_stock: '',
    item_description: '',
    admin_no: null
  });
  const [loading, setLoading] = useState(true);

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

      setFormData(prev => ({
        ...prev,
        admin_no: userInfo.member_no
      }));
    } catch (error) {
      console.error('관리자 권한 확인 실패:', error);
      Alert.alert('오류', '권한 확인 중 오류가 발생했습니다.');
      navigation.navigate('Home');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.admin_no) {
        Alert.alert('오류', '관리자 권한이 필요합니다.');
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post(`${SERVER_URL}/stuff/item/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        Alert.alert('성공', '물건이 등록되었습니다.', [
          { text: 'OK', onPress: () => navigation.navigate('ItemList') }
        ]);
      } else {
        Alert.alert('실패', response.data.message || '물건 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('오류', '물건 등록 중 오류가 발생했습니다.');
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
        <Text style={styles.title}>물건 등록</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>물건 이름:</Text>
          <TextInput
            style={styles.input}
            value={formData.item_name}
            onChangeText={(text) => setFormData({...formData, item_name: text})}
            placeholder="물건 이름을 입력하세요"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>가격:</Text>
          <TextInput
            style={styles.input}
            value={formData.item_price}
            onChangeText={(text) => setFormData({...formData, item_price: text})}
            keyboardType="numeric"
            placeholder="가격을 입력하세요"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>재고:</Text>
          <TextInput
            style={styles.input}
            value={formData.item_stock}
            onChangeText={(text) => setFormData({...formData, item_stock: text})}
            keyboardType="numeric"
            placeholder="재고를 입력하세요"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>설명:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.item_description}
            onChangeText={(text) => setFormData({...formData, item_description: text})}
            multiline
            numberOfLines={4}
            placeholder="설명을 입력하세요"
          />
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
            onPress={() => navigation.navigate('ItemList')}
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
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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

export default RegisterItem;