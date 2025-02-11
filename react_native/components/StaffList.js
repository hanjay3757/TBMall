import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';  // react-router-dom 대신 사용
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StaffList = () => {
  const navigation = useNavigation();  // useNavigate 대신 사용
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    try {
      const response = await axios.get('/staff/list');
      setStaffList(response.data.staffList || []);
    } catch (error) {
      console.error('직원 목록 로딩 실패:', error);
      Alert.alert('오류', '직원 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.staffCard}>
      <Text style={styles.staffName}>{item.member_nick}</Text>
      <Text style={styles.staffInfo}>ID: {item.member_id}</Text>
      <Text style={styles.staffInfo}>직급: {item.position_name}</Text>
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => navigation.navigate('StaffEdit', { member_no: item.member_no })}
      >
        <Text style={styles.buttonText}>수정</Text>
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
      <FlatList
        data={staffList}
        renderItem={renderItem}
        keyExtractor={item => item.member_no.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>등록된 직원이 없습니다.</Text>
        }
      />
    </View>
  );
};

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
  staffCard: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  staffName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  staffInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  }
});

export default StaffList; 