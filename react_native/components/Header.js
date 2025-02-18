import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import './Header.css';
import { API_BASE_URL, CLIENT_URL } from '../config';
import { UserContext } from '../App';

function Header() {
  const { userInfo, loadUserInfo } = useContext(UserContext);
  const navigation = useNavigation();
  const route = useRoute();
  const [memberId, setMemberId] = useState('');
  const [memberPw, setMemberPw] = useState('');

  useEffect(() => {
    loadUserInfo();  // 컴포넌트가 마운트될 때마다 사용자 정보 새로 로드
  }, []);

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

  useEffect(() => {
    // 포인트 업데이트 이벤트 리스너
    const handlePointsUpdate = (event) => {
      if (userInfo) {
        const updatedUserInfo = {
          ...userInfo,
          points: event.detail.points
        };
        setUserInfo(updatedUserInfo);
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('pointsUpdated', handlePointsUpdate);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('pointsUpdated', handlePointsUpdate);
    };
  }, [userInfo]);

  // 포인트 업데이트 감지
  useEffect(() => {
    if (route.params?.refresh) {
      loadUserInfo();
    }
  }, [route.params?.refresh]);

  // 포인트 업데이트 감지
  useEffect(() => {
    if (route.params?.updatedPoints !== undefined) {
      const updatedUserInfo = {
        ...userInfo,
        points: route.params.updatedPoints
      };
      setUserInfo(updatedUserInfo);
    }
  }, [route.params?.updatedPoints]);

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
            {userInfo && (
              <TouchableOpacity 
                onPress={() => navigation.navigate('Cart')}
                style={styles.navButton}
              >
                <Text style={styles.navText}>장바구니</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {userInfo && (
          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {userInfo.member_nick}님
              </Text>
              <Text style={styles.pointsText}>
                보유 포인트: {userInfo.points?.toLocaleString()}P
              </Text>
            </View>
          </View>
        )}
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
});

export default Header;