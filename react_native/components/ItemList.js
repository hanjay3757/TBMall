import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  TextInput,
  Alert,
  ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ItemList({ isLoggedIn, isAdmin }) {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      console.log('ItemList 화면 포커스 - 데이터 새로고침');
      loadItems(currentPage);
    }, [currentPage])
  );

  const loadItems = async (page) => {
    try {
      setLoading(true);
      console.log('아이템 목록 로딩 시작 - 페이지:', page);
      
      const response = await axios.get('/stuff/item/list', {
        params: {
          currentPage: page,
          pageSize
        }
      });

      console.log('아이템 목록 응답:', response.data);

      if (response.data && response.data.items) {
        setItems(response.data.items);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.log('아이템 데이터 없음');
        setItems([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('아이템 로딩 실패:', error);
      Alert.alert('오류', '물품 목록을 불러오는데 실패했습니다.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (itemId) => {
    try {
      const quantity = quantities[itemId] || 1;
      const response = await axios.post('/stuff/api/cart/add', {
        itemId,
        quantity
      });

      if (response.data.success) {
        Alert.alert('성공', '장바구니에 추가되었습니다.');
        setQuantities(prev => ({ ...prev, [itemId]: 1 }));
      }
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      Alert.alert('오류', '장바구니 추가에 실패했습니다.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('ItemDetail', { itemId: item.item_id })}
      >
        <Image 
          source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
          style={styles.itemImage}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          <Text style={styles.itemPrice}>
            가격: {item.item_price ? item.item_price.toLocaleString() : '0'}원
          </Text>
          <Text style={styles.itemStock}>
            재고: {item.item_stock ? item.item_stock.toLocaleString() : '0'}개
          </Text>
        </View>
      </TouchableOpacity>
      {isLoggedIn && (
        <View style={styles.cartControls}>
          <TextInput
            style={styles.quantityInput}
            value={quantities[item.item_id]?.toString() || '1'}
            onChangeText={(text) => {
              const num = parseInt(text) || 1;
              setQuantities({...quantities, [item.item_id]: num});
            }}
            keyboardType="numeric"
          />
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item.item_id)}
          >
            <Text style={styles.buttonText}>장바구니 담기</Text>
          </TouchableOpacity>
        </View>
      )}
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
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.item_id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>등록된 물건이 없습니다.</Text>
        }
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
  listContainer: {
    padding: 10,
  },
  itemCard: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    padding: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemStock: {
    fontSize: 14,
    color: '#666',
  },
  cartControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 4,
    width: 50,
    marginRight: 8,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  }
});

export default ItemList;