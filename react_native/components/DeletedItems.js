import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../config';

function DeletedItems() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDeletedItems = async () => {
    try {
      const response = await axios.post('/stuff/item/deleted', {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        setItems(response.data.data || []);
      } else {
        throw new Error(response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error('삭제된 물건 목록 로딩 실패:', error);
      setError(error.response?.data?.message || '삭제된 물건 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDeletedItems();
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const handleRestore = async (itemId) => {
    try {
      const params = new URLSearchParams();
      params.append('itemId', itemId);
      params.append('itemStock', 1);

      console.log('=== 물건 복구 요청 정보 ===');
      console.log('복구할 itemId:', itemId);
      console.log('요청 URL:', `${SERVER_URL}/stuff/item/restore`);
      console.log('요청 파라미터:', Object.fromEntries(params));

      const response = await axios.post(
        `${SERVER_URL}/stuff/item/restore`,
        params,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('=== 복구 요청 응답 ===');
      console.log('응답 상태:', response.status);
      console.log('응답 데이터:', response.data);
      console.log('응답 헤더:', response.headers);

      if (response.data === 'redirect:/stuff/item/list' || response.status === 200) {
        Alert.alert('성공', '물건이 복구되었습니다.');
        loadDeletedItems();  // 목록 새로고침
      } else {
        throw new Error('복구에 실패했습니다.');
      }
    } catch (error) {
      console.error('=== 물건 복구 실패 ===');
      console.error('에러 메시지:', error.message);
      console.error('에러 응답 상태:', error.response?.status);
      console.error('에러 응답 데이터:', error.response?.data);
      console.error('요청 설정:', error.config);
      console.error('요청 URL:', error.config?.url);
      console.error('요청 메소드:', error.config?.method);
      console.error('요청 헤더:', error.config?.headers);
      console.error('요청 데이터:', error.config?.data);
      Alert.alert('오류', '물건 복구에 실패했습니다.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemName}>{item.item_name}</Text>
      <Text style={styles.itemInfo}>가격: {item.item_price.toLocaleString()}원</Text>
      <Text style={styles.itemInfo}>재고: {item.item_stock.toLocaleString()}개</Text>
      <Text style={styles.itemDescription}>{item.item_description}</Text>
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

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>삭제된 물건 목록</Text>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.item_id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>삭제된 물건이 없습니다.</Text>
        }
      />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate('ItemList')}
      >
        <Text style={styles.buttonText}>목록으로 돌아가기</Text>
      </TouchableOpacity>
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
  itemDescription: {
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
  backButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    padding: 20,
    textAlign: 'center',
  },
});

export default DeletedItems;