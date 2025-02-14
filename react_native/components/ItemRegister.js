import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert 
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ItemRegister() {
  const navigation = useNavigation();
  const [itemData, setItemData] = useState({
    item_name: '',
    item_price: '',
    item_stock: '',
    item_description: '',
    image_url: '',
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

      setItemData(prev => ({
        ...prev,
        admin_no: userInfo.member_no
      }));
    } catch (error) {
      console.error('관리자 권한 확인 실패:', error);
      navigation.navigate('Home');
    }
  };

  const handleSubmit = async () => {
    try {
      // 필수 필드 검증
      if (!itemData.item_name || !itemData.item_price || !itemData.item_stock) {
        Alert.alert('오류', '모든 필수 항목을 입력해주세요.');
        return;
      }

      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      
      // FormData 생성
      const formData = new URLSearchParams();
      Object.keys(itemData).forEach(key => {
        formData.append(key, itemData[key]);
      });
      formData.append('admin_no', userInfo.member_no);

      const response = await axios.post('/stuff/item/register', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        Alert.alert('성공', '물건이 등록되었습니다.', [
          { 
            text: 'OK', 
            onPress: () => {
              navigation.navigate('ItemList');  // 등록 후 목록으로 이동
            }
          }
        ]);
      } else {
        Alert.alert('실패', response.data.message || '물건 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('물건 등록 실패:', error);
      Alert.alert('오류', '물건 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>물건 이름 *</Text>
        <TextInput
          style={styles.input}
          value={itemData.item_name}
          onChangeText={(text) => setItemData({...itemData, item_name: text})}
          placeholder="물건 이름을 입력하세요"
        />

        <Text style={styles.label}>가격 *</Text>
        <TextInput
          style={styles.input}
          value={itemData.item_price}
          onChangeText={(text) => setItemData({...itemData, item_price: text})}
          placeholder="가격을 입력하세요"
          keyboardType="numeric"
        />

        <Text style={styles.label}>재고 수량 *</Text>
        <TextInput
          style={styles.input}
          value={itemData.item_stock}
          onChangeText={(text) => setItemData({...itemData, item_stock: text})}
          placeholder="재고 수량을 입력하세요"
          keyboardType="numeric"
        />

        <Text style={styles.label}>설명</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={itemData.item_description}
          onChangeText={(text) => setItemData({...itemData, item_description: text})}
          placeholder="물건에 대한 설명을 입력하세요"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>이미지 URL</Text>
        <TextInput
          style={styles.input}
          value={itemData.image_url}
          onChangeText={(text) => setItemData({...itemData, image_url: text})}
          placeholder="이미지 URL을 입력하세요"
        />

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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default ItemRegister;