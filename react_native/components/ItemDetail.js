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
  return (
    <View style={styles.starRatingDisplay}>
      <Text>{Array(rating).fill('⭐').join('')}</Text>
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
        setItem(response.data.item);
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
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('댓글 로딩 실패:', error.response || error);
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

      // URLSearchParams 사용
      const params = new URLSearchParams();
      params.append('comment_no', commentNo);
      params.append('member_no', userInfo.member_no);

      console.log('삭제 요청 URL:', '/board/deleteComment');
      console.log('삭제 요청 데이터:', Object.fromEntries(params));

      const response = await axios.post('/board/deleteComment', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('댓글 삭제 응답:', response.data);

      if (response.data.success) {
        Alert.alert('성공', '댓글이 삭제되었습니다.');
        loadComments();  // 댓글 목록 새로고침
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
        {userInfo?.isAdmin && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('ItemEdit', { itemId: item.item_id })}
          >
            <Text style={styles.buttonText}>수정</Text>
          </TouchableOpacity>
        )}

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
    marginBottom: 10,
    alignSelf: 'flex-end',
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
    marginVertical: 5,
  },
  starText: {
    fontSize: 20,
    marginHorizontal: 2,
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
});

export default ItemDetail;