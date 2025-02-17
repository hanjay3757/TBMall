import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function BoardEdit() {
  const navigation = useNavigation();
  const route = useRoute();
  const { boardNo } = route.params;
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const [boardData, setBoardData] = useState({
    board_no: boardNo,
    member_no: '',
    board_title: '',
    board_content: '',
    board_readcount: '',
    board_writedate: new Date().toISOString(),
    board_delete: 0,
    board_delete_at: '',
  });

  useEffect(() => {
    checkPermissionAndLoadData();
  }, []);

  const checkPermissionAndLoadData = async () => {
    try {
      // 사용자 정보 로드
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      const userInfo = JSON.parse(userInfoStr);
      setUserInfo(userInfo);

      // 게시글 정보 로드
      const response = await axios.get(`/board/read?board_no=${boardNo}`);
      setBoardData(response.data);

      console.log('=== 수정 권한 체크 ===');
      console.log('userInfo:', userInfo);
      console.log('board:', response.data);
      console.log('isAdmin:', userInfo.isAdmin);
      console.log('isAuthor:', userInfo.member_no === response.data.member_no);

      // isAdmin만으로 관리자 권한 체크
      if (userInfo.isAdmin || userInfo.member_no === response.data.member_no) {
        setHasPermission(true);
      } else {
        Alert.alert('권한 없음', '게시글을 수정할 권한이 없습니다.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      Alert.alert('오류', '게시글 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        board_no: boardNo,
        member_no: userInfo.member_no,
        board_title: boardData.board_title,
        board_content: boardData.board_content,
      };

      const response = await axios.post('/board/editContent', JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        Alert.alert('성공', '글 수정 완료', [
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
        Alert.alert('실패', response.data.message || '글 수정에 실패하였습니다.');
      }
    } catch (error) {
      console.error('글 수정 실패:', error.response?.data || error.message);
      Alert.alert('오류', '글 수정에 실패하였습니다.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!hasPermission) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>게시글 수정</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.input}
            value={boardData.board_title}
            onChangeText={(text) => setBoardData(prev => ({
              ...prev,
              board_title: text
            }))}
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
            <Text style={styles.buttonText}>수정</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
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
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BoardEdit;
