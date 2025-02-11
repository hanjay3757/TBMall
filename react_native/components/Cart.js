import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadCartItems();
  }, []);

  const constructCartItems = (items) => {
    return items.reduce((acc, item) => {
      const existingItem = acc.find(i => i.itemName === item.itemName);
      
      if (existingItem) {
        existingItem.cartIds.push(item.cartId);
        existingItem.totalQuantity += item.quantity;
        existingItem.totalPrice += item.price * item.quantity;
      } else {
        acc.push({
          ...item,
          cartIds: [item.cartId],
          totalQuantity: item.quantity,
          totalPrice: item.price * item.quantity
        });
      }
      return acc;
    }, []);
  };

  const loadCartItems = async () => {
    try {
      const response = await axios.get('/stuff/api/cart');
      const constructedItems = constructCartItems(response.data);
      setCartItems(constructedItems);
      setLoading(false);
    } catch (error) {
      console.error('장바구니 로딩 실패:', error);
      Alert.alert('오류', '장바구니를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleDelete = async (cartIds) => {
    try {
      const response = await axios.post('/stuff/api/cart/delete', { cartIds });
      if (response.data.success) {
        Alert.alert('성공', '장바구니에서 삭제되었습니다.');
        loadCartItems();
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      Alert.alert('오류', '삭제에 실패했습니다.');
    }
  };

  const handlePurchase = async (cartIds) => {
    try {
      const response = await axios.post('/stuff/api/cart/purchase', { cartIds });
      if (response.data.success) {
        Alert.alert('성공', '구매가 완료되었습니다.');
        loadCartItems();
      }
    } catch (error) {
      console.error('구매 실패:', error);
      Alert.alert('오류', '구매에 실패했습니다.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.itemName}>{item.itemName}</Text>
      <Text style={styles.itemInfo}>수량: {item.totalQuantity}</Text>
      <Text style={styles.itemInfo}>가격: {item.totalPrice}원</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={styles.purchaseButton}
          onPress={() => handlePurchase(item.cartIds)}
        >
          <Text style={styles.buttonText}>구매</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDelete(item.cartIds)}
        >
          <Text style={styles.buttonText}>삭제</Text>
        </TouchableOpacity>
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
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.cartIds.join(',')}
        contentContainerStyle={styles.listContainer}
      />
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
  listContainer: {
    padding: 10,
  },
  cartItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  purchaseButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    minWidth: 70,
    alignItems: 'center',
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
});

export default Cart;
