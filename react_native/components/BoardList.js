import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

function BoardList({ isLoggedIn, isAdmin }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const navigation = useNavigation();

  const loadBoards = useCallback(async () => {
    try {
      const response = await axios.get('/board/list', {
        params: {
          currentPage,
          pageSize
        }
      });
      setBoards(response.data.boards);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('게시글 로딩 실패:', error);
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.boardItem}
      onPress={() => navigation.navigate('ReadContent', { boardNo: item.board_no })}
    >
      <Text style={styles.title}>{item.board_title}</Text>
      <Text style={styles.info}>
        작성자: {item.member_nick} | 조회수: {item.board_readcount}
      </Text>
      <Text style={styles.date}>
        {new Date(item.board_writedate).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>게시판</Text>
        {isLoggedIn && (
          <TouchableOpacity 
            style={styles.writeButton}
            onPress={() => navigation.navigate('BoardWrite')}
          >
            <Text style={styles.writeButtonText}>글쓰기</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={boards}
        renderItem={renderItem}
        keyExtractor={item => item.board_no.toString()}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.pagination}>
        <TouchableOpacity 
          style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
          onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <Text style={styles.pageButtonText}>이전</Text>
        </TouchableOpacity>
        
        {/* 페이지 번호 버튼들 */}
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

        <TouchableOpacity 
          style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
          onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.pageButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  writeButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  boardItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  info: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  pageButton: {
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  activePageButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageButtonText: {
    color: '#333',
  },
});

export default BoardList;

