import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView 
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function BoardWrite() {
  const navigation = useNavigation();
  const [boardData, setBoardData] = useState({
    board_title: '',
    board_content: ''
  });

  const handleSubmit = async () => {
    try {
      // 필수 필드 검증
      if (!boardData.board_title.trim() || !boardData.board_content.trim()) {
        Alert.alert('오류', '제목과 내용을 모두 입력해주세요.');
        return;
      }

      // 사용자 정보 가져오기
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }
      const userInfo = JSON.parse(userInfoStr);

      // 게시글 목록 조회하여 마지막 번호 확인
      const boardListResponse = await axios.get('/board/list');
      const boards = boardListResponse.data.boards || [];
      const lastBoardNo = boards.length > 0 ? Math.max(...boards.map(b => parseInt(b.board_no))) : 0;
      
      // URLSearchParams 사용
      const params = new URLSearchParams();
      params.append('member_no', userInfo.member_no.toString());
      params.append('board_title', boardData.board_title);
      params.append('board_content', boardData.board_content);
      params.append('board_no', (lastBoardNo + 1).toString()); // 마지막 번호 + 1

      console.log('=== 게시글 작성 요청 ===');
      console.log('전송 데이터:', Object.fromEntries(params));

      const response = await axios.post('/board/write', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true
      });

      console.log('서버 응답:', response.data);

      if (response.data.success) {
        Alert.alert('성공', response.data.message || '게시글이 등록되었습니다.', [
          { 
            text: 'OK', 
            onPress: () => {
              // BoardList로 이동하면서 새로고침 파라미터 전달
              navigation.navigate('BoardList', { 
                refresh: true,
                timestamp: new Date().getTime()
              });
            }
          }
        ]);
      } else {
        Alert.alert('실패', response.data.message || '게시글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      console.error('에러 응답:', error.response?.data);
      Alert.alert('오류', error.response?.data?.message || '게시글 작성 중 오류가 발생했습니다.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>게시글 작성</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.input}
            value={boardData.board_title}
            onChangeText={(text) => setBoardData(prev => ({
              ...prev,
              board_title: text
            }))}
            placeholder="제목을 입력하세요"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>내용</Text>
          <TextInput
            style={styles.textArea}
            value={boardData.board_content}
            onChangeText={(text) => setBoardData(prev => ({
              ...prev,
              board_content: text
            }))}
            placeholder="내용을 입력하세요"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>등록</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>취소</Text>
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
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    minHeight: 200,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BoardWrite;
