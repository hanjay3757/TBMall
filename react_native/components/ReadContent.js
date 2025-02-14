import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../config';

function ReadContent() {
  const navigation = useNavigation();
  const route = useRoute();
  const { boardNo } = route.params;
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    loadUserInfo();
    loadBoard();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        setUserInfo(JSON.parse(userInfoStr));
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    }
  };

  const loadBoard = async () => {
    try {
      const response = await axios.get('/board/read', {
        params: { board_no: boardNo }
      });
      setBoard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('게시글 로딩 실패:', error);
      Alert.alert('오류', '게시글을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('BoardEdit', { boardNo });
  };

  // 수정 권한 체크
  const canEdit = () => {
    if (!userInfo || !board) return false;
    console.log('=== 수정 권한 체크 ===');
    console.log('userInfo:', userInfo);
    console.log('board:', board);
    console.log('isAdmin:', userInfo.isAdmin || userInfo.admins === 1);
    console.log('isAuthor:', userInfo.member_no === board.member_no);
    return (userInfo.isAdmin || userInfo.admins === 1) || userInfo.member_no === board.member_no;
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
          {canEdit() && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEdit}
            >
              <Text style={styles.buttonText}>수정</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>목록</Text>
          </TouchableOpacity>
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
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ReadContent;
