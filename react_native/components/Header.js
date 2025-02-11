import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import './Header.css';
import { API_BASE_URL, CLIENT_URL } from '../config';

function Header({ 
  isLoggedIn, 
  isAdmin, 
  userInfo, 
  handleAttendanceCheck,
  setIsLoggedIn,
  setIsAdmin,
  setUserInfo
}) {
  const navigation = useNavigation();
  const [memberId, setMemberId] = useState('');
  const [memberPw, setMemberPw] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append('staffId', memberId);
      params.append('password', memberPw);

      const response = await axios.post(`${API_BASE_URL}/staff/login`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true,
      });

      console.log('로그인 응답:', response.data); // 응답 데이터 확인

      if (response.data.success) {
        const userInfo = {
          member_nick: response.data.name || response.data.member_nick || response.data.memberNick, // 서버 응답의 다양한 필드명 체크
          points: response.data.points || 0,
          position_no: response.data.position_no || 0,
          isAdmin: response.data.isAdmin
        };

        console.log('저장할 userInfo:', userInfo); // userInfo 데이터 확인

        setUserInfo(userInfo);
        setIsLoggedIn(true);
        setIsAdmin(response.data.isAdmin);

        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        localStorage.setItem('member_no', response.data.member_no || '');
        
        window.location.reload();
      } else {
        alert('로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('로그인에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/staff/logout`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          <TouchableOpacity 
            style={styles.logo} 
            onPress={() => navigation.navigate('Home')}
          >
            <Image 
              source={require('../assets/TBMALL.png')} 
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>떠발이 직장인</Text>
          </TouchableOpacity>

          <View style={styles.mainNav}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('BoardList')}
              style={styles.navButton}
            >
              <Text style={styles.navText}>게시판</Text>
            </TouchableOpacity>
            {isLoggedIn && (
              <TouchableOpacity 
                onPress={() => navigation.navigate('Cart')}
                style={styles.navButton}
              >
                <Text style={styles.navText}>장바구니</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isAdmin && (
          <View style={styles.adminNav}>
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => navigation.navigate('ItemRegister')}
            >
              <Text style={styles.buttonText}>물건 등록</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => navigation.navigate('StaffRegister')}
            >
              <Text style={styles.buttonText}>직원 등록</Text>
            </TouchableOpacity>
            {/* 다른 관리자 메뉴 버튼들 */}
          </View>
        )}

        <View style={styles.userSection}>
          {userInfo && (
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {userInfo.member_nick}님
              </Text>
              <Text style={styles.pointsText}>
                보유 포인트: {userInfo.points}P
              </Text>
              <TouchableOpacity 
                style={styles.attendanceButton}
                onPress={handleAttendanceCheck}
              >
                <Text style={styles.buttonText}>출석체크</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainNav: {
    flexDirection: 'row',
  },
  navButton: {
    marginHorizontal: 10,
  },
  navText: {
    fontSize: 16,
  },
  adminNav: {
    flexDirection: 'row',
  },
  adminButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  userSection: {
    alignItems: 'flex-end',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pointsText: {
    fontSize: 14,
    color: '#666',
  },
  attendanceButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
});

export default Header;