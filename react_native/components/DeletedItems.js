import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function DeletedItems() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adminNo, setAdminNo] = useState(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (adminNo) {
      loadDeletedItems();
    }
  }, [currentPage, adminNo]);

  const checkAdminAuth = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        Alert.alert('오류', '로그인이 필요합니다.');
        navigation.navigate('Home');
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      if (!userInfo.isAdmin) {
        Alert.alert('오류', '관리자만 접근할 수 있습니다.');
        navigation.navigate('Home');
        return;
      }

      setAdminNo(userInfo.member_no);
      loadDeletedItems();
    } catch (error) {
      console.error('관리자 권한 확인 실패:', error);
      Alert.alert('오류', '권한 확인 중 오류가 발생했습니다.');
      navigation.navigate('Home');
    }
  };

  const loadDeletedItems = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/stuff/item/deleted`, {
        params: { page: currentPage }
      });
      setItems(response.data.items);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('삭제된 물건 목록 로딩 실패:', error);
      Alert.alert('오류', '삭제된 물건 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleRestore = async (itemNo) => {
    try {
      const response = await axios.post(`${SERVER_URL}/stuff/item/restore/${itemNo}`);

      if (response.data.success) {
        Alert.alert('성공', '물건이 복구되었습니다.');
        loadDeletedItems();
      } else {
        Alert.alert('실패', '물건 복구에 실패했습니다.');
      }
    } catch (error) {
      console.error('물건 복구 실패:', error);
      Alert.alert('오류', '물건 복구 중 오류가 발생했습니다.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemName}>{item.item_name}</Text>
      <Text style={styles.itemInfo}>가격: {item.item_price}원</Text>
      <Text style={styles.itemInfo}>재고: {item.item_stock}개</Text>
      <Text style={styles.itemInfo}>삭제일: {new Date(item.delete_date).toLocaleDateString()}</Text>
      <TouchableOpacity 
        style={styles.restoreButton}
        onPress={() => handleRestore(item.item_id)}
      >
        <Text style={styles.buttonText}>복구</Text>
      </TouchableOpacity>
    </View>
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
      <Text style={styles.title}>삭제된 물건 목록</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.item_id.toString()}
        contentContainerStyle={styles.listContainer}
      />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
  },
  listContainer: {
    padding: 10,
  },
  itemCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  restoreButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
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
});

export default DeletedItems;