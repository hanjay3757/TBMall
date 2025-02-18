import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  TextInput,
  Image
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../App';

// axios 기본 설정
axios.defaults.baseURL = 'http://192.168.0.148:8080/mvc';
axios.defaults.withCredentials = true;

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { userInfo, updateUserPoints, loadUserInfo } = useContext(UserContext);

  useEffect(() => {
    loadUserInfo();
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const response = await axios.get('/stuff/api/cart');
      console.log('장바구니 데이터:', response.data);
      
      // 같은 item_id를 가진 아이템들의 수량을 합치기
      const mergedItems = response.data.reduce((acc, curr) => {
        const existingItem = acc.find(item => item.itemId === curr.itemId);
        if (existingItem) {
          existingItem.quantity += curr.quantity;
        } else {
          acc.push({...curr});
        }
        return acc;
      }, []);

      setCartItems(mergedItems);
      setLoading(false);
    } catch (error) {
      console.error('장바구니 로딩 실패:', error);
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartId) => {
    try {
      const response = await axios.delete(
        `/stuff/api/cart/${cartId}`
      );

      if (response.data.status === 'success') {
        loadCartItems();
      }
    } catch (error) {
      Alert.alert('오류', '장바구니 아이템 삭제에 실패했습니다.');
    }
  };

  const handleUpdateQuantity = async (cart_id, newQuantity) => {
    try {
      const response = await axios.patch(
        `/stuff/api/cart/${cart_id}`,
        { quantity: newQuantity }
      );
      
      if (response.data.status === 'success') {
        loadCartItems();
      }
    } catch (error) {
      console.error('수량 업데이트 실패:', error);
      Alert.alert('오류', '재고가 부족합니다.');
    }
  };

  const handleCheckout = async () => {
    try {
      if (cartItems.length === 0) {
        console.log('장바구니 비어있음');
        Alert.alert('알림', '장바구니가 비어있습니다.');
        return;
      }

      // 사용자 정보 가져오기
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }
      const userInfo = JSON.parse(userInfoStr);

      // 총 구매 금액 계산
      const totalAmount = cartItems.reduce((sum, item) => 
        sum + (item.itemPrice * item.quantity), 0
      );

      // 사용자의 포인트가 부족한 경우
      if (totalAmount > userInfo.points) {
        Alert.alert(
          '포인트 부족',
          `보유 포인트(${userInfo.points.toLocaleString()}P)가 부족합니다.\n필요 포인트: ${totalAmount.toLocaleString()}P`
        );
        return;
      }

      // 서버가 기대하는 형식으로 데이터 구성
      const requestData = {
        itemIds: cartItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity
        })),
        member_no: userInfo.member_no
      };

      console.log('=== 주문 처리 시작 ===');
      console.log('주문할 장바구니 아이템:', cartItems);
      console.log('주문 요청 데이터:', requestData);

      const response = await axios.post(
        '/stuff/api/cart/checkout',
        requestData,
        { 
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('=== 주문 처리 응답 ===');
      console.log('서버 응답 상태:', response.status);
      console.log('서버 응답 데이터:', response.data);

      if (response.data.status === 'success') {
        // 장바구니 아이템 삭제
        await Promise.all(cartItems.map(async item => {
          console.log(`장바구니 아이템 삭제 중: ${item.cartId}`);
          const deleteResponse = await axios.delete(`/stuff/api/cart/${item.cartId}`);
          console.log(`장바구니 아이템 삭제 응답:`, deleteResponse.data);
          return deleteResponse;
        }));

        // 새로운 포인트 계산
        const newPoints = userInfo.points - totalAmount;
        
        // 포인트 업데이트
        await updateUserPoints(newPoints);
        
        // AsyncStorage 업데이트
        const updatedUserInfo = {
          ...userInfo,
          points: newPoints
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

        Alert.alert('성공', '주문이 완료되었습니다.', [
          {
            text: 'OK',
            onPress: () => {
              setCartItems([]);
              // Home으로 이동하면서 새로운 포인트 정보 전달
              navigation.reset({
                index: 0,
                routes: [
                  { 
                    name: 'Home',
                    params: { 
                      refresh: true,
                      updatedPoints: newPoints
                    }
                  }
                ],
              });
            }
          }
        ]);
      }
    } catch (error) {
      console.error('주문 처리 실패:', error);
      Alert.alert('오류', '주문 처리 중 오류가 발생했습니다.');
    }
  };

  const handlePurchase = async () => {
    try {
      if (!userInfo) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      // 총 구매 금액 계산
      const totalAmount = cartItems.reduce((sum, item) => 
        sum + (item.item_price * item.quantity), 0
      );

      // 사용자의 포인트가 부족한 경우
      if (totalAmount > userInfo.points) {
        Alert.alert(
          '포인트 부족',
          `보유 포인트(${userInfo.points}P)가 부족합니다.\n필요 포인트: ${totalAmount}P`
        );
        return;
      }

      const params = new URLSearchParams();
      params.append('member_no', userInfo.member_no);

      const response = await axios.post('/stuff/api/cart/purchase', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        Alert.alert('성공', '구매가 완료되었습니다.');
        
        // 구매 후 사용자 정보(포인트) 업데이트
        const updatedUserInfo = {
          ...userInfo,
          points: userInfo.points - totalAmount
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        updateUserPoints(updatedUserInfo.points);
        
        loadCartItems(); // 장바구니 새로고침
      } else {
        Alert.alert('실패', response.data.message || '구매에 실패했습니다.');
      }
    } catch (error) {
      console.error('구매 실패:', error);
      Alert.alert('오류', '구매 중 오류가 발생했습니다.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x200' }}
        style={styles.itemImage}
        defaultSource={require('../assets/placeholder.png')}
      />
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={styles.itemPrice}>가격: {item.itemPrice.toLocaleString()}원</Text>
        <View style={styles.quantityControls}>
          <TextInput
            style={styles.quantityInput}
            value={String(item.quantity)}
            onChangeText={(text) => handleUpdateQuantity(item.cartId, parseInt(text) || 1)}
            keyboardType="numeric"
          />
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleRemoveItem(item.cartId)}
          >
            <Text style={styles.buttonText}>삭제</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.totalPrice}>
          총 가격: {(item.itemPrice * item.quantity).toLocaleString()}원
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>장바구니</Text>
      {userInfo && (
        <Text style={styles.pointInfo}>
          보유 포인트: {userInfo.points.toLocaleString()}P
        </Text>
      )}
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => String(item.cartId)}
        contentContainerStyle={styles.listContainer}
      />
      {cartItems.length > 0 && (
        <View style={styles.checkoutContainer}>
          <Text style={styles.totalPrice}>
            총 결제 금액: {cartItems.reduce((total, item) => 
              total + (item.itemPrice * item.quantity), 0).toLocaleString()}원
          </Text>
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.buttonText}>주문하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
  },
  pointInfo: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  listContainer: {
    padding: 10,
  },
  cartItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  quantityInput: {
    width: 50,
    height: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    minWidth: 70,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
});

export default Cart;
