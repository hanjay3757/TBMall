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
      const memberNo = await AsyncStorage.getItem('member_no');
      const response = await axios.get(`/board/read?board_no=${boardNo}`);
      
      if (response.data.member_no === memberNo) {
        setHasPermission(true);
        setBoardData(response.data);
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
      const response = await axios.post('/board/edit', boardData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        Alert.alert('성공', '게시글이 수정되었습니다.', [
          { text: 'OK', onPress: () => navigation.navigate('BoardList') }
        ]);
      } else {
        Alert.alert('실패', '게시글 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      Alert.alert('오류', '게시글 수정 중 오류가 발생했습니다.');
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
