import 'react-native-gesture-handler';
import React, { useState, useEffect, createContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Image,
  RefreshControl
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, CLIENT_URL } from './config';
import ItemRegister from './components/ItemRegister';
import ItemList from './components/ItemList';
import ItemEdit from './components/ItemEdit';
import ItemDetail from './components/ItemDetail';
import Cart from './components/Cart';
import BoardList from './components/BoardList';
import BoardWrite from './components/BoardWrite';
import BoardEdit from './components/BoardEdit';
import ReadContent from './components/ReadContent';
import StaffRegister from './components/StaffRegister';
import StaffEdit from './components/StaffEdit';
import DeletedItems from './components/DeletedItems';
import RemovedStaff from './components/RemovedStaff';
import StaffList from './components/StaffList';

// axios 기본 설정
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 10000;
axios.defaults.headers.common = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const Stack = createStackNavigator();

// Context 생성
export const UserContext = createContext();

// 로그인 화면
const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('staffId', username);
      formData.append('password', password);

      const response = await axios.post('/staff/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('로그인 응답:', response.data);

      if (response.data.success) {
        const userInfo = {
          member_no: response.data.member_no || 0,
          member_id: response.data.staffId,
          member_nick: response.data.name,
          points: response.data.points || 0,
          position_no: response.data.position_no || 0,
          isAdmin: response.data.isAdmin,
          admin_no: response.data.member_no
        };
        
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        navigation.replace('Home');
      } else {
        Alert.alert('로그인 실패', response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 요청 실패:', error);
      Alert.alert('오류', '로그인에 실패했습니다.');
    }
  };

  return (
    <ImageBackground 
      
      style={styles.loginContainer}
    >
      <View style={styles.loginBox}>
        <TextInput
          style={styles.input}
          placeholder="아이디"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

// 홈 화면 
const HomeScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userInfo');
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAttendanceCheck = async () => {
    try {
      if (!userInfo) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      console.log("현재 로그인된 유저의 position_no:", userInfo.position_no);

      const attendanceKey = `lastAttendanceDate_${userInfo.member_no}`;
      const lastAttendanceDate = await AsyncStorage.getItem(attendanceKey);
      const today = new Date().toISOString().split('T')[0];

      if (lastAttendanceDate === today) {
        Alert.alert('알림', '오늘 이미 출석체크를 했습니다. 내일 다시 해주세요~');
        return;
      }

      const params = new URLSearchParams();
      params.append('member_no', userInfo.member_no);

      const response = await axios.post('/staff/pointAdd', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true
      });

      if (response.data.success) {
        await AsyncStorage.setItem(attendanceKey, today);

        // 직급에 따른 포인트 계산
        let addPoints = 30;  // 기본 포인트
        if (userInfo.position_no === 2) {
          addPoints = 100;  // 직급 2의 포인트
        } else if (userInfo.position_no === 3) {
          addPoints = 50;   // 직급 3의 포인트
        }

        const updatedUserInfo = {
          ...userInfo,
          points: userInfo.points + addPoints  // 기존 포인트에 새 포인트 추가
        };

        console.log('포인트 업데이트:', {
          직급: userInfo.position_no,
          이전포인트: userInfo.points,
          추가포인트: addPoints,
          최종포인트: updatedUserInfo.points
        });

        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        setUserInfo(updatedUserInfo);
        Alert.alert('성공', `출석체크가 완료되었습니다.\n포인트가 +${addPoints}P 증가했습니다!`);
      } else {
        Alert.alert('실패', response.data.message || '출석체크에 실패했습니다.');
      }
    } catch (error) {
      console.error('출석체크 실패:', error);
      Alert.alert('오류', '출석체크 중 문제가 발생했습니다.');
    }
  };

  const handleAttendanceReset = async () => {
    try {
      // 모든 AsyncStorage 키 가져오기
      const keys = await AsyncStorage.getAllKeys();
      // 출석체크 관련 키만 필터링
      const attendanceKeys = keys.filter(key => key.startsWith('lastAttendanceDate_'));
      
      if (attendanceKeys.length > 0) {
        // 모든 출석체크 기록 삭제
        await AsyncStorage.multiRemove(attendanceKeys);
        Alert.alert('성공', '모든 사용자의 출석체크가 초기화되었습니다.');
      } else {
        Alert.alert('알림', '초기화할 출석체크 기록이 없습니다.');
      }
    } catch (error) {
      console.error('출석체크 초기화 실패:', error);
      Alert.alert('오류', '출석체크 초기화 중 문제가 발생했습니다.');
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadUserInfo();
    } catch (error) {
      console.error('새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {userInfo && (
        <View style={styles.mainContainer}>
          {/* 상단 사용자 정보 */}
          <View style={styles.userSection}>
            <Text style={styles.welcomeText}>
              {userInfo.member_nick}님
            </Text>
            <Text style={styles.pointsText}>
              {userInfo.points} P
            </Text>
          </View>

          {/* 메뉴 그리드 */}
          <View style={styles.menuGrid}>
            {/* 첫 번째 줄 */}
            <View style={styles.menuRow}>
              <TouchableOpacity 
                style={[styles.menuCard, { backgroundColor: '#4A90E2' }]}
                onPress={handleAttendanceCheck}
              >
                <Text style={styles.menuTitle}>출석체크</Text>
                <Text style={styles.menuSubtitle}>매일 포인트 받기</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuCard, { backgroundColor: '#50C878' }]}
                onPress={() => navigation.navigate('BoardList')}
              >
                <Text style={styles.menuTitle}>게시판</Text>
                <Text style={styles.menuSubtitle}>소통하기</Text>
              </TouchableOpacity>
            </View>

            {/* 두 번째 줄 */}
            <View style={styles.menuRow}>
              <TouchableOpacity 
                style={[styles.menuCard, { backgroundColor: '#F4A460' }]}
                onPress={() => navigation.navigate('ItemList')}
              >
                <Text style={styles.menuTitle}>물건목록</Text>
                <Text style={styles.menuSubtitle}>상품 보기</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuCard, { backgroundColor: '#9370DB' }]}
                onPress={() => navigation.navigate('Cart')}
              >
                <Text style={styles.menuTitle}>장바구니</Text>
                <Text style={styles.menuSubtitle}>담은 상품</Text>
              </TouchableOpacity>
            </View>

            {/* 관리자 메뉴 섹션 */}
            {userInfo.isAdmin && (
              <>
                <Text style={styles.sectionTitle}>관리자 메뉴</Text>
                <View style={styles.menuRow}>
                  <TouchableOpacity 
                    style={[styles.menuCard, { backgroundColor: '#E84393' }]}
                    onPress={() => navigation.navigate('ItemRegister')}
                  >
                    <Text style={styles.menuTitle}>물건 등록</Text>
                    <Text style={styles.menuSubtitle}>새 상품 추가</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.menuCard, { backgroundColor: '#6C5CE7' }]}
                    onPress={() => navigation.navigate('StaffRegister')}
                  >
                    <Text style={styles.menuTitle}>직원 등록</Text>
                    <Text style={styles.menuSubtitle}>신규 직원 추가</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.menuRow}>
                  <TouchableOpacity 
                    style={[styles.menuCard, { backgroundColor: '#00B894' }]}
                    onPress={() => navigation.navigate('DeletedItems')}
                  >
                    <Text style={styles.menuTitle}>삭제된 물건</Text>
                    <Text style={styles.menuSubtitle}>삭제 목록 관리</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.menuCard, { backgroundColor: '#0984E3' }]}
                    onPress={() => navigation.navigate('RemovedStaff')}
                  >
                    <Text style={styles.menuTitle}>삭제된 직원</Text>
                    <Text style={styles.menuSubtitle}>직원 목록 관리</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.menuRow}>
                 

                  <TouchableOpacity
                    style={[styles.menuCard, { backgroundColor: '#D63031' }]}
                    onPress={handleAttendanceReset}
                  >
                    <Text style={styles.menuTitle}>출석체크 초기화</Text>
                    <Text style={styles.menuSubtitle}>전체 초기화</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* 로그아웃 버튼 */}
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

// 메인 App 컴포넌트
export default function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 사용자 정보 로드 함수
  const loadUserInfo = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        const parsedUserInfo = JSON.parse(userInfoStr);
        setUserInfo(parsedUserInfo);
        setIsLoggedIn(true);
        setIsAdmin(parsedUserInfo.isAdmin);
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    }
  };

  // 포인트 업데이트 함수
  const updateUserPoints = async (newPoints) => {
    if (userInfo) {
      const updatedUserInfo = {
        ...userInfo,
        points: newPoints
      };
      await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  return (
    <UserContext.Provider value={{ 
      userInfo, 
      setUserInfo, 
      isLoggedIn, 
      setIsLoggedIn,
      isAdmin,
      setIsAdmin,
      updateUserPoints,
      loadUserInfo 
    }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={({ navigation }) => ({ 
                headerLeft: null,
                headerStyle: {
                  backgroundColor: '#2c3e50',
                  height: 110,
                },
                headerTintColor: '#fff',
                headerTitle: () => (
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Home')}
                    style={styles.headerLogoContainer}
                  >
                    <Image
                      source={require('./image/TBMALL.png')}
                      style={styles.headerLogo}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )
              })}
            />
            <Stack.Screen 
              name="ItemList"
              options={{ 
                title: '물건 목록',
                headerStyle: {
                  backgroundColor: '#2c3e50'
                },
                headerTintColor: '#fff'
              }}
            >
              {(props) => (
                <ItemList
                  {...props}
                  isLoggedIn={props.route.params?.isLoggedIn}
                  isAdmin={props.route.params?.isAdmin}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ItemRegister" component={ItemRegister} />
            <Stack.Screen name="ItemEdit" component={ItemEdit} />
            <Stack.Screen name="ItemDetail" component={ItemDetail} />
            <Stack.Screen name="Cart" component={Cart} />
            <Stack.Screen name="BoardList" component={BoardList} />
            <Stack.Screen name="BoardWrite" component={BoardWrite} />
            <Stack.Screen name="BoardEdit" component={BoardEdit} />
            <Stack.Screen name="ReadContent" component={ReadContent} />
            <Stack.Screen name="StaffRegister" component={StaffRegister} />
            <Stack.Screen name="StaffList" component={StaffList} />
            <Stack.Screen name="StaffEdit" component={StaffEdit} />
            <Stack.Screen name="DeletedItems" component={DeletedItems} />
            <Stack.Screen name="RemovedStaff" component={RemovedStaff} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </UserContext.Provider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  mainContainer: {
    padding: 15,
  },
  userSection: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  pointsText: {
    fontSize: 18,
    color: '#636E72',
    marginTop: 5,
  },
  menuGrid: {
    gap: 2,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  menuCard: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  menuSubtitle: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
  },
  logoutButton: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  logoutText: {
    color: '#2D3436',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3436',
    marginTop: 30,
    marginBottom: 15,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34495e',
    width: '100%',
    height: '100%',
    paddingHorizontal: 20
  },
  loginBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
    alignItems: 'center',
  },
  input: {
    height: 50,
    borderColor: '#dcdde1',
    borderWidth: 1.5,
    marginVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    width: '100%',
    fontSize: 16,
    color: '#2c3e50',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginTop: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#2980b9',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerLogoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerLogo: {
    width: 500,
    height: 100,
    marginRight: 250,
  },
});