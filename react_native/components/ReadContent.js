import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  TextInput 
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ReadContent() {
  const navigation = useNavigation();
  const route = useRoute();
  const { boardNo } = route.params;
  const [board, setBoard] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadBoard();
    loadComments();
  }, [currentPage]);

  const loadBoard = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/board/read?board_no=${boardNo}`);
      setBoard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('게시글 로딩 실패:', error);
      Alert.alert('오류', '게시글을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/board/comments/${boardNo}`, {
        params: { page: currentPage }
      });
      setComments(response.data.comments);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('댓글 로딩 실패:', error);
    }
  };

  const handleAddComment = async () => {
    try {
      const memberNo = await AsyncStorage.getItem('member_no');
      if (!memberNo) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const response = await axios.post(`${SERVER_URL}/board/comment`, {
        boardNo,
        memberNo,
        content: newComment
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setNewComment('');
        loadComments();
        Alert.alert('성공', '댓글이 등록되었습니다.');
      } else {
        Alert.alert('실패', '댓글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 등록 실패:', error);
      Alert.alert('오류', '댓글 등록 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = () => {
    navigation.navigate('BoardEdit', { boardNo });
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
      <View style={styles.boardContent}>
        <Text style={styles.title}>{board?.board_title}</Text>
        <Text style={styles.author}>작성자: {board?.member_nick}</Text>
        <Text style={styles.date}>
          작성일: {new Date(board?.board_writedate).toLocaleDateString()}
        </Text>
        <Text style={styles.content}>{board?.board_content}</Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Text style={styles.buttonText}>수정</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>목록</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>댓글</Text>
        
        <View style={styles.commentForm}>
          <TextInput
            style={styles.commentInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="댓글을 입력하세요"
            multiline
          />
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleAddComment}
          >
            <Text style={styles.buttonText}>등록</Text>
          </TouchableOpacity>
        </View>

        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentItem}>
            <Text style={styles.commentAuthor}>{comment.member_nick}</Text>
            <Text style={styles.commentContent}>{comment.content}</Text>
            <Text style={styles.commentDate}>
              {new Date(comment.writedate).toLocaleDateString()}
            </Text>
          </View>
        ))}

        <View style={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <TouchableOpacity
              key={i + 1}
              style={[
                styles.pageButton,
                currentPage === i + 1 && styles.activePageButton
              ]}
              onPress={() => setCurrentPage(i + 1)}
            >
              <Text style={styles.pageButtonText}>{i + 1}</Text>
            </TouchableOpacity>
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
  boardContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  commentsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentsTitle: {
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
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  commentItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentContent: {
    marginBottom: 5,
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  pageButton: {
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    minWidth: 35,
    alignItems: 'center',
  },
  activePageButton: {
    backgroundColor: '#007AFF',
  },
  pageButtonText: {
    color: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ReadContent;
