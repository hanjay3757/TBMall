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
import { SERVER_URL } from '../config';

function RemovedStaff() {
  const navigation = useNavigation();
  const [staffList, setStaffList] = useState([]);         // 삭제된 직원 목록
  const [activeStaffList, setActiveStaffList] = useState([]); // 현재 직원 목록
  const [loading, setLoading] = useState(true);
  const [adminNo, setAdminNo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);  // 한 페이지당 보여줄 개수
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (adminNo) {
      loadRemovedStaff();
      loadActiveStaff();  // 현재 직원 목록도 로드
    }
  }, [adminNo, currentPage]);

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
      loadRemovedStaff();
    } catch (error) {
      console.error('관리자 권한 확인 실패:', error);
      Alert.alert('오류', '권한 확인 중 오류가 발생했습니다.');
      navigation.navigate('Home');
    }
  };

  const loadRemovedStaff = async () => {
    try {
      setLoading(true);
      console.log('삭제된 직원 목록 로딩 시작');

      const response = await axios.post('/staff/removelist', {}, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('삭제된 직원 목록 응답:', response.data);

      if (response.data.success) {
        setStaffList(response.data.list || []);
        console.log('직원 목록 설정 완료:', response.data.list?.length, '명');
      } else {
        console.log('데이터 없음 또는 실패:', response.data.message);
        setStaffList([]);
      }
    } catch (error) {
      console.error('삭제된 직원 목록 로딩 실패:', error);
      console.error('에러 응답:', error.response?.data);
      Alert.alert('오류', '삭제된 직원 목록을 불러오는데 실패했습니다.');
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveStaff = async (page = 1, loadMore = false) => {
    try {
      console.log('직원 목록 로딩 - 페이지:', page);
      const response = await axios.post('/staff/list', {
        currentPage: page,
        pageSize
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('현재 직원 목록 응답:', response.data);

      if (response.data && Array.isArray(response.data.staff)) {
        if (loadMore) {
          setActiveStaffList(prev => {
            const newStaff = response.data.staff.filter(
              newItem => !prev.some(existingItem => existingItem.member_no === newItem.member_no)
            );
            return [...prev, ...newStaff];
          });
        } else {
          setActiveStaffList(response.data.staff);
        }
        
        if (response.data.totalPage) {
          setTotalPages(response.data.totalPage);
          setHasMore(page < response.data.totalPage);
          console.log(`현재 페이지: ${page}, 전체 페이지: ${response.data.totalPage}, 더 있음: ${page < response.data.totalPage}`);
        }
      }
    } catch (error) {
      console.error('현재 직원 목록 로딩 실패:', error);
      console.error('에러 상세:', error.response?.data);
      Alert.alert('오류', '현재 직원 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleRestore = async (memberNo) => {
    try {
      const params = new URLSearchParams();
      params.append('member_no', memberNo);

      const response = await axios.post('/staff/restore', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        Alert.alert('성공', '직원이 복구되었습니다.');
        loadRemovedStaff();  // 목록 새로고침
      } else {
        Alert.alert('실패', response.data.message || '직원 복구에 실패했습니다.');
      }
    } catch (error) {
      console.error('직원 복구 실패:', error);
      Alert.alert('오류', '직원 복구 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (memberNo) => {
    try {
      Alert.alert(
        '직원 삭제',
        '정말 이 직원을 삭제하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel'
          },
          {
            text: '삭제',
            onPress: async () => {
              try {
                console.log('직원 삭제 시도 - member_no:', memberNo);
                
                const params = new URLSearchParams();
                params.append('member_no', memberNo);

                console.log('삭제 요청 데이터:', Object.fromEntries(params));

                const response = await axios.post('/staff/remove', params, {  // URL 변경: delete -> remove
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  }
                });

                console.log('삭제 응답:', response.data);

                if (response.data.success) {
                  Alert.alert('성공', '직원이 삭제되었습니다.');
                  loadActiveStaff(1, false);
                  loadRemovedStaff();
                } else {
                  console.log('삭제 실패:', response.data);
                  Alert.alert('실패', response.data.message || '직원 삭제에 실패했습니다.');
                }
              } catch (error) {
                console.error('직원 삭제 요청 실패:', error);
                console.error('에러 응답:', error.response?.data);
                console.error('요청 설정:', error.config);
                Alert.alert('오류', '직원 삭제 중 오류가 발생했습니다.');
              }
            },
            style: 'destructive'
          }
        ]
      );
    } catch (error) {
      console.error('직원 삭제 다이얼로그 오류:', error);
      Alert.alert('오류', '작업 중 오류가 발생했습니다.');
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = Math.ceil(activeStaffList.length / pageSize) + 1;
      console.log(`다음 페이지 로드: ${nextPage} / ${totalPages}`);
      if (nextPage <= totalPages) {
        loadActiveStaff(nextPage, true);
      }
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadActiveStaff(1, false).finally(() => setRefreshing(false));
  };

  const renderRemovedItem = ({ item }) => (
    <View style={styles.staffCard}>
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{item.member_nick}</Text>
        <Text style={styles.staffDetail}>ID: {item.member_id}</Text>
        <Text style={styles.staffDetail}>삭제일: {new Date(item.delete_date).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity 
        style={styles.restoreButton}
        onPress={() => handleRestore(item.member_no)}
      >
        <Text style={styles.buttonText}>복구</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActiveItem = ({ item }) => (
    <View style={styles.staffCard}>
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{item.member_nick}</Text>
        <Text style={styles.staffDetail}>ID: {item.member_id}</Text>
        <Text style={styles.staffDetail}>직급: {item.admins === 1 ? '관리자' : '일반 직원'}</Text>
      </View>
      {!item.admins && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDelete(item.member_no)}
        >
          <Text style={styles.buttonText}>삭제</Text>
        </TouchableOpacity>
      )}
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>현재 직원 목록</Text>
        <FlatList
          data={activeStaffList}
          renderItem={renderActiveItem}
          keyExtractor={(item, index) => `active-${item.member_no}-${index}`}
          ListEmptyComponent={
            <Text style={styles.emptyText}>등록된 직원이 없습니다.</Text>
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>삭제된 직원 목록</Text>
        <FlatList
          data={staffList}
          renderItem={renderRemovedItem}
          keyExtractor={(item, index) => `removed-${item.member_no}-${index}`}
          ListEmptyComponent={
            <Text style={styles.emptyText}>삭제된 직원이 없습니다.</Text>
          }
          refreshing={loading}
          onRefresh={loadRemovedStaff}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    flex: 1,
    padding: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  staffDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  restoreButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    minWidth: 70,
    alignItems: 'center',
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
  },
  deleteButton: {
    backgroundColor: '#f44336',  // 빨간색으로 변경
    padding: 8,
    borderRadius: 5,
    minWidth: 70,
    alignItems: 'center',
  },
});

export default RemovedStaff;