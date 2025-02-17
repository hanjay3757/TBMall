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
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StarRating = ({ rating }) => {
  const numericRating = Number(rating) || 0;
  
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= Math.floor(numericRating)) {
          // 완전한 별
          return <Text key={star} style={styles.star}>⭐</Text>;
        } else if (star === Math.ceil(numericRating) && numericRating % 1 !== 0) {
          // 반개 별 (소수점이 있는 경우)
          return <Text key={star} style={styles.star}>★</Text>;
        } else {
          // 빈 별
          return <Text key={star} style={styles.star}>☆</Text>;
        }
      })}
      <Text style={styles.ratingText}>({numericRating.toFixed(1)})</Text>
    </View>
  );
};

function ItemList() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(1);
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const screenWidth = Dimensions.get('window').width;

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
      loadItems(currentPage);
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadItems(currentPage);
  }, [currentPage]);

  useFocusEffect(
    React.useCallback(() => {
      console.log('ItemList 화면 포커스 - 데이터 새로고침');
      loadItems(currentPage);
    }, [])  // 의존성 배열을 비워서 매번 새로고침되도록 함
  );

  const loadItems = async (page) => {
    try {
      setLoading(true);
      console.log('아이템 로딩 시작 - 페이지:', page);
      
      const allItemsResponse = await axios.get('/stuff/item/list', {
        params: {
          currentPage: 1,
          pageSize: 100,
          timestamp: new Date().getTime()
        }
      });

      // 중복 제거를 위해 Map 사용
      const uniqueItemsMap = new Map();
      
      // 각 아이템의 댓글과 평점 정보 가져오기
      for (const item of allItemsResponse.data.items) {
        try {
          // 각 아이템의 댓글 목록 가져오기
          const commentResponse = await axios.get('/board/commentlist', {
            params: {
              item_id: item.item_id,
              currentComment: 1,
              cpageSize: 100
            }
          });

          // 평균 평점 계산
          let avgRating = 0;
          if (commentResponse.data && Array.isArray(commentResponse.data.comments)) {
            const validRatings = commentResponse.data.comments.filter(comment => 
              comment.reviewpoint_amount !== null && 
              comment.reviewpoint_amount !== undefined && 
              !isNaN(comment.reviewpoint_amount)
            );

            if (validRatings.length > 0) {
              const totalRating = validRatings.reduce((sum, comment) => 
                sum + Number(comment.reviewpoint_amount), 0
              );
              avgRating = Number((totalRating / validRatings.length).toFixed(1));
            }
          }

          // item_id를 키로 사용하여 가장 최신 항목만 유지
          if (!uniqueItemsMap.has(item.item_id) || 
              item.reg_date > uniqueItemsMap.get(item.item_id).reg_date) {
            uniqueItemsMap.set(item.item_id, {
              ...item,
              avg_review_score: avgRating
            });
          }
        } catch (error) {
          console.error(`아이템 ${item.item_id}의 댓글 로딩 실패:`, error);
        }
      }

      // 중복이 제거된 활성 아이템만 필터링
      const activeItems = Array.from(uniqueItemsMap.values())
        .filter(item => item.item_delete === 0 && item.item_stock > 0);

      // 페이지네이션 계산
      const calculatedTotalPages = Math.ceil(activeItems.length / pageSize);
      setTotalPages(calculatedTotalPages);
      
      console.log('전체 활성 아이템:', activeItems.length);
      console.log('계산된 전체 페이지:', calculatedTotalPages);

      // 현재 페이지의 아이템 가져오기
      const currentPageItem = activeItems[page - 1];
      if (currentPageItem) {
        console.log('현재 페이지 아이템 평균 별점:', currentPageItem.avg_review_score);
        setItems([currentPageItem]);
      } else {
        setItems([]);
        if (page > 1 && calculatedTotalPages > 0) {
          setCurrentPage(calculatedTotalPages);
        }
      }
    } catch (error) {
      console.error('아이템 로딩 실패:', error);
      Alert.alert('오류', '물품 목록을 불러오는데 실패했습니다.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageWidth = screenWidth;
    const newPage = Math.round(offsetX / pageWidth) + 1;
    
    console.log('Scroll Event:', {
      offsetX,
      currentPage,
      totalPages,
      newPage
    });

    if (newPage !== currentPage && newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAddToCart = async (itemId) => {
    try {
      if (!userInfo) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const item = items.find(item => item.item_id === itemId);
      const quantity = quantities[itemId] || 1;

      if (!item) {
        Alert.alert('오류', '상품을 찾을 수 없습니다.');
        return;
      }
      
      if (item.item_stock < quantity) {
        setQuantities(prev => ({ ...prev, [itemId]: item.item_stock }));
        Alert.alert('알림', `재고가 ${item.item_stock}개 남아있어 수량이 조정되었습니다.`);
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
      if (!isAdmin) {
        Alert.alert('오류', '관리자만 삭제할 수 있습니다.');
        return;
      }

      if (!itemId) {
        Alert.alert('오류', '삭제할 물건이 없습니다.');
        return;
      }

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
      const params = new URLSearchParams();
              params.append('item_id', itemId);

              const response = await axios.post('/stuff/item/delete', params, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
              });

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
    <View style={[styles.itemCard, { width: screenWidth - 20 }]}>
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
          <StarRating rating={item.avg_review_score || 0} />
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

  // 페이지 이동 버튼 컴포넌트 추가
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (event) => {
    setStartX(event.nativeEvent.pageX);
    setIsDragging(true);
  };

  const handleTouchMove = (event) => {
    if (!isDragging) return;

    const currentX = event.nativeEvent.pageX;
    const diff = startX - currentX;
    if (Math.abs(diff) > 50) { // 50픽셀 이상 드래그했을 때
      if (diff > 0) {
        if (currentPage < totalPages) {
          // 오른쪽으로 드래그하면 다음 페이지로 이동
          setCurrentPage(prev => prev + 1);
        } else {
          // 마지막 페이지에서 오른쪽으로 드래그하면 첫 페이지로
          setCurrentPage(1);
        }
      } else if (diff < 0) {
        if (currentPage > 1) {
          // 왼쪽으로 드래그하면 이전 페이지로 이동
          setCurrentPage(prev => prev - 1);
        } else {
          // 첫 페이지에서 왼쪽으로 드래그하면 마지막 페이지로
          setCurrentPage(totalPages);
        }
      }
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View 
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <View style={styles.content}>
        {items.length > 0 ? (
          renderItem({ item: items[0] })
        ) : (
          <Text style={styles.emptyText}>등록된 물품이 없습니다.</Text>
        )}
      </View>
    {/*   <View style={styles.pageIndicator}>
        <Text style={styles.pageText}>{currentPage} / {totalPages}</Text>
      </View> */}
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
    margin: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: 450,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    padding: 8,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },
  itemName: {
    fontSize: 26,
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
  pageButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  pageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  pageButtonDisabled: {
    backgroundColor: '#ccc',
  },
  pageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  pageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  star: {
    fontSize: 16,
    marginRight: 2,
    color: '#FFD700', // 별 색상 (금색)
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

export default ItemList;