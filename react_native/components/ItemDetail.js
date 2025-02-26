import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StarRating = ({ rating, setRating }) => {
  return (
    <View style={styles.starRating}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
        >
          <Text style={styles.starText}>
            {star <= rating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const StarRatingDisplay = ({ rating }) => {
  const numericRating = Number(rating) || 0;
  
  return (
    <View style={styles.starRatingDisplay}>
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= Math.floor(numericRating)) {
          // 완전한 별
          return <Text key={star} style={styles.starText}>⭐</Text>;
        } else if (star === Math.ceil(numericRating) && numericRating % 1 !== 0) {
          // 반개 별 (소수점이 있는 경우)
          return <Text key={star} style={styles.starText}>★</Text>;
        } else {
          // 빈 별
          return <Text key={star} style={styles.starText}>☆</Text>;
        }
      })}
      <Text style={styles.ratingValue}>({numericRating.toFixed(1)})</Text>
    </View>
  );
};

const StarRatingAverage = ({ rating }) => {
  const numericRating = Number(rating) || 0;
  
  return (
    <View style={styles.starRatings}>
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
      <Text style={styles.ratingValue}>({numericRating.toFixed(1)})</Text>
    </View>
  );
};

function ItemDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { itemId } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    loadUserInfo();
    loadItemDetails();
  }, [itemId]);

  const loadUserInfo = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        setUserInfo(JSON.parse(userInfoStr));
      }
    } catch (error) {
      console.error('사용자 정보 로딩 실패:', error);
    }
  };

  const loadItemDetails = async () => {
    try {
      if (!itemId) {
        Alert.alert('오류', '상품 ID가 없습니다.');
        navigation.goBack();
        return;
      }

      console.log('상품 상세 요청 ID:', itemId);

      const response = await axios.get(`/stuff/item/detail/${itemId}`);

      console.log('상품 상세 응답:', response.data);

      if (response.data && response.data.item) {
        const avgRating = response.data.item.avg_review_score || 0;
        setItem({
          ...response.data.item,
          avgRating
        });
      } else if (response.data) {
        setItem({
          ...response.data,
          item_price: parseInt(response.data.item_price) || 0,
          item_stock: parseInt(response.data.item_stock) || 0
        });
      }
      loadComments();
    } catch (error) {
      console.error('상품 상세 정보 로딩 실패:', {
        error: error,
        response: error.response,
        config: error.config,
        url: error.config?.url
      });
      Alert.alert('오류', '상품 정보를 불러오는데 실패했습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      if (!itemId) return;

      const response = await axios.get('/board/commentlist', {
        params: {
          item_id: itemId,
          currentComment: 1,
          cpageSize: 5
        }
      });

      console.log('댓글 로딩 응답:', response.data);

      if (response.data && Array.isArray(response.data.comments)) {
        const uniqueComments = Array.from(
          new Map(response.data.comments.map(comment => [comment.comment_no, comment])).values()
        );
        setComments(uniqueComments);

        // 평균 평점 계산 로직 수정
        const validRatings = uniqueComments.filter(comment => 
          comment.reviewpoint_amount !== null && 
          comment.reviewpoint_amount !== undefined && 
          !isNaN(comment.reviewpoint_amount)
        );

        if (validRatings.length > 0) {
          const totalRating = validRatings.reduce((sum, comment) => 
            sum + Number(comment.reviewpoint_amount), 0
          );
          const avgRating = totalRating / validRatings.length;
          
          // item 상태 업데이트
          setItem(prev => ({
            ...prev,
            avgRating: Number(avgRating.toFixed(1))
          }));
        } else {
          // 유효한 평점이 없는 경우 0으로 설정
          setItem(prev => ({
            ...prev,
            avgRating: 0
          }));
        }
      }
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
      setComments([]);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      Alert.alert('오류', '댓글 내용을 입력해주세요.');
      return;
    }

    if (!userInfo) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    try {
      await axios.get('/board/comment', {
        params: {
          item_id: itemId,
          member_no: userInfo.member_no
        }
      });

      const commentData = {
        item_id: itemId,
        member_no: userInfo.member_no,
        comment_content: comment.trim(),
        reviewpoint_amount: rating
      };

      console.log('댓글 등록 요청 데이터:', commentData);

      const response = await axios.post('/board/comment', commentData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('댓글 등록 응답:', response.data);

      if (response.data.success) {
        // 댓글 등록 성공 후 상품 상세 정보를 다시 불러옴
        const itemResponse = await axios.get(`/stuff/item/detail/${itemId}`);
        if (itemResponse.data && itemResponse.data.item) {
          const avgRating = itemResponse.data.item.avg_review_score || 0;
          setItem(prev => ({
            ...prev,
            avgRating
          }));
        }

        setComment('');
        setRating(5);
        loadComments();
        Alert.alert('성공', '댓글이 등록되었습니다.');
      } else {
        Alert.alert('실패', response.data.message || '댓글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 등록 실패:', error.response || error);
      Alert.alert('오류', '댓글 등록 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteComment = async (commentNo) => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      console.log('댓글 삭제 시도:', {
        commentNo,
        userInfo
      });

      // 관리자이거나 자신의 댓글인 경우만 삭제 가능
      const comment = comments.find(c => c.comment_no === commentNo);
      if (!comment) {
        console.log('댓글을 찾을 수 없음');
        return;
      }

      if (!userInfo.isAdmin && userInfo.member_no !== comment.member_no) {
        Alert.alert('오류', '자신의 댓글만 삭제할 수 있습니다.');
        return;
      }

      const params = new URLSearchParams();
      params.append('comment_no', commentNo);
      params.append('member_no', userInfo.member_no);

      const response = await axios.post('/board/deleteComment', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        // 댓글 삭제 성공 후 상품 상세 정보를 다시 불러옴
        const itemResponse = await axios.get(`/stuff/item/detail/${itemId}`);
        if (itemResponse.data && itemResponse.data.item) {
          const avgRating = itemResponse.data.item.avg_review_score || 0;
          setItem(prev => ({
            ...prev,
            avgRating
          }));
        }

        await loadComments();  // 댓글 목록 새로고침
        Alert.alert('성공', '댓글이 삭제되었습니다.');
      } else {
        Alert.alert('실패', response.data.message || '댓글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      console.error('에러 응답:', error.response?.data);
      console.error('요청 설정:', error.config);
      Alert.alert('오류', '댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAddToCart = async () => {
    try {
      if (!userInfo) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      // URLSearchParams를 사용하여 form 데이터 형식으로 전송
      const params = new URLSearchParams();
      params.append('itemId', itemId);
      params.append('quantity', 1);

      console.log('장바구니 추가 요청 데이터:', Object.fromEntries(params));

      const response = await axios.post('/stuff/api/cart/add', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'  // form 데이터 형식으로 변경
        }
      });

      console.log('장바구니 추가 응답:', response.data);

        if (response.data.success) {
        Alert.alert('성공', '장바구니에 추가되었습니다.');
        } else {
        Alert.alert('실패', response.data.message || '장바구니 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      console.error('에러 응답:', error.response?.data);
      Alert.alert('오류', '장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentContent}>{item.comment_content}</Text>
      <View style={styles.commentInfo}>
        <Text style={styles.commentDate}>
          {new Date(item.comment_writedate).toLocaleDateString()}
        </Text>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteComment(item.comment_no)}
        >
          <Text style={styles.deleteButtonText}>삭제</Text>
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

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>상품을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.itemDetail}>
        <View style={styles.buttonContainer}>
          {userInfo?.isAdmin && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('ItemEdit', { itemId: item.item_id })}
            >
              <Text style={styles.buttonText}>수정</Text>
            </TouchableOpacity>
          )}
          {userInfo && (
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.buttonText}>장바구니 추가</Text>
            </TouchableOpacity>
          )}
        </View>

        <Image 
          source={{ uri: item.image_url || 'https://via.placeholder.com/400x300' }}
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
          <Text style={styles.description}>{item.item_description}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.averageRating}>평균 평점:</Text>
            <StarRatingAverage rating={item.avgRating || 0} />
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>상품 후기</Text>
          {userInfo ? (
            <View style={styles.commentForm}>
              <StarRating rating={rating} setRating={setRating} />
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="댓글을 입력하세요"
                multiline
              />
              <TouchableOpacity 
                style={styles.commentButton}
                onPress={handleAddComment}
              >
                <Text style={styles.buttonText}>댓글 작성</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.loginRequired}>
              댓글을 작성하려면 로그인이 필요합니다.
            </Text>
          )}

          {comments.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.member_nick}</Text>
                <Text style={styles.commentDate}>
                  {new Date(comment.comment_date).toLocaleDateString()}
                </Text>
              </View>
              <StarRatingDisplay rating={comment.reviewpoint_amount || 0} />
              <Text style={styles.commentContent}>{comment.comment_content}</Text>
              <View style={styles.commentInfo}>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteComment(comment.comment_no)}
                >
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  itemDetail: {
    padding: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    gap: 10,
  },
  itemImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  itemInfo: {
    marginTop: 15,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemPrice: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  itemStock: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  cartButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  commentForm: {
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    marginBottom: 10,
  },
  commentButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginRequired: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  commentItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentAuthor: {
    fontWeight: 'bold',
  },
  commentDate: {
    color: '#666',
    fontSize: 12,
  },
  commentContent: {
    marginTop: 5,
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starRatingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  starText: {
    fontSize: 20,
    marginRight: 2,
    color: '#FFD700',
  },
  commentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  starRatings: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 20,
    marginRight: 2,
    color: '#FFD700',
  },
  selectedStar: {
    color: '#FFD700',
  },
  ratingValue: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  averageRating: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    marginTop: 15,
  },
});

export default ItemDetail;