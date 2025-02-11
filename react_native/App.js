import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator 
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
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="아이디"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>
    </View>
  );
};

// 홈 화면
const HomeScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);

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
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      if (!storedUserInfo) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const userInfo = JSON.parse(storedUserInfo);
      let rewardPoints = 30;
      
      if (userInfo.position_no === 2) {
        rewardPoints = 100;
      } else if (userInfo.position_no === 3) {
        rewardPoints = 50;
      }

      const formData = new URLSearchParams();
      formData.append('member_no', userInfo.member_no);
      formData.append('points', rewardPoints);

      const response = await axios.post('/staff/pointAdd', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        const updatedUserInfo = {
          ...userInfo,
          points: userInfo.points + rewardPoints
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        setUserInfo(updatedUserInfo);
        Alert.alert('성공', response.data.message);
      } else {
        Alert.alert('실패', response.data.message);
      }
    } catch (error) {
      console.error('출석체크 실패:', error);
      Alert.alert('오류', '출석체크 중 문제가 발생했습니다.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {userInfo && (
          <>
            <Text style={styles.welcomeText}>
              환영합니다, {userInfo.member_nick}님
            </Text>
            <Text style={styles.pointsText}>
              포인트: {userInfo.points}
            </Text>
            <TouchableOpacity 
              style={styles.attendanceButton}
              onPress={handleAttendanceCheck}
            >
              <Text style={styles.buttonText}>출석체크</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('ItemList')}
        >
          <Text style={styles.buttonText}>물건 목록</Text>
        </TouchableOpacity>

        {userInfo && (
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.buttonText}>장바구니</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
      
      {userInfo?.isAdmin && (
        <View style={styles.adminMenu}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('ItemRegister')}
          >
            <Text style={styles.buttonText}>물건 등록</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('StaffRegister')}
          >
            <Text style={styles.buttonText}>직원 등록</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('DeletedItems')}
          >
            <Text style={styles.buttonText}>삭제된 물건</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('RemovedStaff')}
          >
            <Text style={styles.buttonText}>삭제된 직원</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// 메인 App 컴포넌트
export default function App() {
  return (
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
            options={{ 
              title: '홈',
              headerLeft: null 
            }}
          />
          <Stack.Screen name="ItemList" component={ItemList} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pointsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  adminMenu: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  menuButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  attendanceButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});