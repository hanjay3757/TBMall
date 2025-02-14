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

function ItemList() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log('ItemList 화면 포커스 - 데이터 새로고침');
      loadItems(currentPage);
    }, [currentPage])
  );

  useEffect(() => {
    console.log('=== ItemList Props 확인 ===');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('isAdmin:', isAdmin);
  }, [isLoggedIn, isAdmin]);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfoStr = await AsyncStorage.getItem('userInfo');
        if (userInfoStr) {
          const parsedUserInfo = JSON.parse(userInfoStr);
          setUserInfo(parsedUserInfo);
          setIsAdmin(parsedUserInfo.isAdmin);
          setIsLoggedIn(true);
          console.log('로드된 userInfo:', parsedUserInfo);
        }
      } catch (error) {
        console.error('userInfo 로드 실패:', error);
      }
    };

    loadUserInfo();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // 화면이 포커스를 받을 때마다 아이템 목록을 새로고침
      loadItems(currentPage);
    });

    return unsubscribe;
  }, [navigation, currentPage]);

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

      if (response.data && response.data.items) {
        // 중복 제거를 위해 item_id 기준으로 그룹화
        const uniqueItems = response.data.items.reduce((acc, curr) => {
          if (!acc[curr.item_id]) {
            acc[curr.item_id] = curr;
          }
          return acc;
        }, {});

        // 재고가 0인 아이템은 장바구니에 있는 경우에만 표시
        const cartResponse = await axios.get('/stuff/api/cart');
        const cartItems = cartResponse.data || [];

        // 모든 아이템을 표시하되, 재고가 0이면서 장바구니에 없는 것만 삭제 처리
        const activeItems = Object.values(uniqueItems).filter(item => {
          if (item.item_stock === 0) {
            // 장바구니에 있는지 확인
            const isInCart = cartItems.some(cartItem => cartItem.itemId === item.item_id);
            if (!isInCart && !item.item_delete) {
              // 장바구니에 없고 아직 삭제되지 않은 경우에만 삭제 처리
              const params = new URLSearchParams();
              params.append('item_id', item.item_id);
              axios.post('/stuff/item/delete', params, {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
              });
              return false;
            }
            return isInCart; // 장바구니에 있으면 표시
          }
          return !item.item_delete; // 재고가 있고 삭제되지 않은 아이템은 표시
        });

        setItems(activeItems);
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
      if (!userInfo) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      // 현재 아이템 찾기
      const item = items.find(item => item.item_id === itemId);
      const quantity = quantities[itemId] || 1;

      // 재고 체크
      if (!item || item.item_stock < quantity) {
        Alert.alert('오류', '재고가 부족합니다.');
        return;
      }

      const params = new URLSearchParams();
      params.append('itemId', itemId);
      params.append('quantity', quantity);

      console.log('장바구니 추가 요청:', Object.fromEntries(params));

      const response = await axios.post('/stuff/api/cart/add', params, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('장바구니 응답:', response.data);

      if (response.data.status === 'success' || response.data.success) {
        Alert.alert('성공', response.data.message || '장바구니에 추가되었습니다.');
        setQuantities(prev => ({ ...prev, [itemId]: 1 }));
        
        // 장바구니 추가 성공 후 아이템 목록 새로고침
        await loadItems(currentPage);
      } else {
        throw new Error(response.data.message || '장바구니 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      console.error('에러 응답:', error.response?.data);
      Alert.alert('오류', error.response?.data?.message || '장바구니 추가에 실패했습니다.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      // 관리자 권한 체크
      if (!isAdmin) {
        Alert.alert('오류', '관리자만 삭제할 수 있습니다.');
        return;
      }

      if (!itemId) {
        Alert.alert('오류', '삭제할 물건이 없습니다.');
        return;
      }

      // 삭제 확인 다이얼로그
      Alert.alert(
        '물건 삭제',
        '정말 이 물건을 삭제하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel'
          },
          {
            text: '삭제',
            onPress: async () => {
              // URLSearchParams 사용하여 form 데이터로 전송
              const params = new URLSearchParams();
              params.append('item_id', itemId);

              const response = await axios.post('/stuff/item/delete', params, {
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
              });

              // 응답 체크 로직 수정
              if (response.data === 'redirect:/stuff/item/list' || 
                  response.status === 200 || 
                  response.data.success) {
                Alert.alert('성공', '물건이 삭제되었습니다.');
                loadItems(currentPage);
              } else {
                Alert.alert('실패', response.data.message || '삭제에 실패했습니다.');
              }
            },
            style: 'destructive'
          }
        ]
      );
    } catch (error) {
      console.error('물건 삭제 실패:', error);
      Alert.alert('오류', '물건 삭제 중 오류가 발생했습니다.');
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
      
      <View style={styles.buttonContainer}>
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
        
        {isAdmin && (
          <View style={styles.adminControls}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('ItemEdit', { itemId: item.item_id })}
            >
              <Text style={styles.buttonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item.item_id)}
            >
              <Text style={styles.buttonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
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
  },
  buttonContainer: {
    marginTop: 10,
  },
  adminControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
});

export default ItemList;