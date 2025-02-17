import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert 
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

function BoardList({ isLoggedIn }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();

  const loadUserInfo = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        const parsedUserInfo = JSON.parse(userInfoStr);
        console.log('로드된 userInfo:', parsedUserInfo);
        setUserInfo(parsedUserInfo);
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (route.params?.refresh) {
      console.log('게시판 새로고침 요청 감지');
      loadBoards();
      navigation.setParams({ refresh: undefined, timestamp: undefined });
    }
  }, [route.params]);

  const loadBoards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/board/list', {
        params: { 
          currentPage, 
          pageSize,
          timestamp: new Date().getTime()
        },
        withCredentials: true
      });

      if (response.data) {
        const { boards = [], totalPages = 0 } = response.data;
        const sortedBoards = boards
          .filter(board => board.board_delete === 0)
          .sort((a, b) => a.board_no - b.board_no); // board_no 기준으로 오름차순 정렬
        
        setBoards(sortedBoards);
        setTotalPages(totalPages);
      }
    } catch (error) {
      console.error('게시판 목록을 불러오는 중 오류 발생:', error);
      Alert.alert('오류', '게시판 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const handleWrite = () => {
    navigation.navigate('BoardWrite');
  };

  const readContent = (board_no) => {
    navigation.navigate('ReadContent', { boardNo: board_no });
  };

  const handleDelete = async (board_no) => {
    try {
      if (!userInfo?.isAdmin) {
        Alert.alert('권한 없음', '관리자만 삭제할 수 있습니다.');
        return;
      }

      if (!board_no) {
        Alert.alert('오류', '삭제할 글이 없습니다.');
        return;
      }

      Alert.alert(
        '글 삭제',
        '이 글을 삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            onPress: async () => {
              const response = await axios.post('/board/deleteOneContent', 
                { board_no: board_no },
                {
                  withCredentials: true,
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (response.data.success) {
                Alert.alert('성공', response.data.message || '게시글이 삭제되었습니다.');
                loadBoards();
              } else {
                Alert.alert('실패', response.data.message || '게시글 삭제에 실패했습니다.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('글 삭제 실패:', error);
      console.error('에러 응답:', error.response?.data);
      Alert.alert('오류', error.response?.data?.message || '게시글 삭제 중 오류가 발생했습니다.');
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
    <View style={styles.container}>
      <Text style={styles.title}>TBmall 공지 사항</Text>
      <ScrollView>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>번호</Text>
          <Text style={styles.headerCell}>제목</Text>
          <Text style={styles.headerCell}>작성일</Text>
          {userInfo?.isAdmin && <Text style={styles.headerCell}>관리</Text>}
        </View>

        {boards.map((board, index) => (
          <TouchableOpacity 
            key={board.board_no}
            style={styles.row}
            onPress={() => readContent(board.board_no)}
          >
            <Text style={styles.cell}>{index + 1}</Text>
            <Text style={styles.cell}>{board.board_title}</Text>
            <Text style={styles.cell}>{board.board_writedate}</Text>
            {userInfo?.isAdmin && (
              <View style={styles.cell}>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(board.board_no)}
                >
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        <TouchableOpacity 
          style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
          onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <Text>이전</Text>
        </TouchableOpacity>

        {Array.from({ length: totalPages }, (_, i) => (
          <TouchableOpacity
            key={i + 1}
            style={[styles.pageButton, currentPage === i + 1 && styles.activeButton]}
            onPress={() => setCurrentPage(i + 1)}
          >
            <Text>{i + 1}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
          onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          <Text>다음</Text>
        </TouchableOpacity>
      </View>

      {userInfo?.isAdmin && (
        <TouchableOpacity 
          style={styles.writeButton}
          onPress={handleWrite}
        >
          <Text style={styles.writeButtonText}>글 작성</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  pageButton: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  writeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    margin: 10,
    alignItems: 'center',
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default BoardList;
