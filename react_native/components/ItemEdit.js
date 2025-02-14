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

function ItemEdit() {
  const navigation = useNavigation();
  const route = useRoute();
  const { itemId } = route.params;
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
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

      setItem(prev => ({
        ...prev,
        admin_no: userInfo.member_no
      }));
      loadItemDetails();
    } catch (error) {
      console.error('관리자 권한 확인 실패:', error);
      navigation.navigate('Home');
    }
  };

  const loadItemDetails = async () => {
    try {
      const response = await axios.get(`/stuff/item/detail/${itemId}`);
      setItem(response.data.item);
      setLoading(false);
    } catch (error) {
      console.error('상품 정보 로딩 실패:', error);
      Alert.alert('오류', '상품 정보를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('=== 물건 수정 시작 ===');
      
      // 필수 필드 검증
      if (!item.item_name || !item.item_price || !item.item_stock) {
        console.log('필수 필드 누락:', {
          name: !!item.item_name,
          price: !!item.item_price,
          stock: !!item.item_stock
        });
        Alert.alert('오류', '모든 필수 항목을 입력해주세요.');
        return;
      }

      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        console.log('userInfo 없음');
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      console.log('로그인 유저 정보:', userInfo);
      
      // URLSearchParams 사용
      const params = new URLSearchParams();
      params.append('item_id', itemId);
      params.append('item_name', item.item_name);
      params.append('item_price', item.item_price.toString());
      params.append('item_stock', item.item_stock.toString());
      params.append('item_description', item.item_description || '');
      params.append('image_url', item.image_url || '');
      params.append('admin_no', userInfo.member_no.toString());

      console.log('전송할 데이터:', Object.fromEntries(params));

      const response = await axios.post('/stuff/item/edit', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('서버 응답 상태:', response.status);
      console.log('서버 응답 헤더:', response.headers);
      console.log('서버 응답 데이터:', response.data);

      // 리다이렉트 응답 처리
      if (typeof response.data === 'string' && response.data.includes('redirect:')) {
        console.log('리다이렉트 응답 감지');
        Alert.alert('성공', '물건이 수정되었습니다.', [
          { 
            text: 'OK', 
            onPress: () => {
              console.log('수정 완료 - ItemList로 이동');
              navigation.navigate('ItemList');
            }
          }
        ]);
        return;
      }

      // 기존 성공/실패 처리
      if (response.data.success) {
        console.log('수정 성공 응답');
        Alert.alert('성공', '물건이 수정되었습니다.', [
          { text: 'OK', onPress: () => navigation.navigate('ItemList') }
        ]);
      } else {
        console.log('수정 실패 응답:', response.data.message);
        Alert.alert('실패', response.data.message || '물건 수정에 실패했습니다.');
      }
    } catch (error) {
      console.log('=== 에러 상세 정보 ===');
      console.error('에러 객체:', error);
      console.error('에러 응답:', error.response);
      console.error('에러 메시지:', error.message);
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
        console.error('응답 헤더:', error.response.headers);
      }
      Alert.alert('오류', '물건 수정 중 오류가 발생했습니다.');
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
        <Text style={styles.title}>물건 수정</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>물건 이름</Text>
          <TextInput
            style={styles.input}
            value={item.item_name}
            onChangeText={(text) => setItem(prev => ({
              ...prev,
              item_name: text
            }))}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>가격</Text>
          <TextInput
            style={styles.input}
            value={item.item_price?.toString()}
            onChangeText={(text) => setItem(prev => ({
              ...prev,
              item_price: text
            }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>재고</Text>
          <TextInput
            style={styles.input}
            value={item.item_stock?.toString()}
            onChangeText={(text) => setItem(prev => ({
              ...prev,
              item_stock: text
            }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>설명</Text>
          <TextInput
            style={styles.textArea}
            value={item.item_description}
            onChangeText={(text) => setItem(prev => ({
              ...prev,
              item_description: text
            }))}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이미지 URL</Text>
          <TextInput
            style={styles.input}
            value={item.image_url}
            onChangeText={(text) => setItem(prev => ({
              ...prev,
              image_url: text
            }))}
          />
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
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
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

export default ItemEdit; 