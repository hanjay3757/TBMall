import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Header.css';
import { API_BASE_URL, CLIENT_URL } from '../config';
import logoImage from '../image/TBMALL.png';  // 이미지 import

function Header({ 
  isLoggedIn, 
  isAdmin, 
  userInfo, 
  handleAttendanceCheck,
  setIsLoggedIn,
  setIsAdmin,
  setUserInfo
}) {
  const navigate = useNavigate();
  const [memberId, setMemberId] = useState('');
  const [memberPw, setMemberPw] = useState('');

  // 포인트 정보를 가져오는 함수
  const fetchUserPoints = async () => {
    try {
      // localStorage에서 현재 userInfo 가져오기
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        const currentUserInfo = JSON.parse(userInfoStr);
        setUserInfo(prevUserInfo => ({
          ...prevUserInfo,
          points: currentUserInfo.points
        }));
      }
    } catch (error) {
      console.error('포인트 정보 가져오기 실패:', error);
    }
  };

  // 주기적으로 포인트 정보 업데이트
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserPoints(); // 초기 포인트 정보 가져오기
      
      const intervalId = setInterval(fetchUserPoints, 222500); // 0.5초마다 업데이트
      
      return () => clearInterval(intervalId);
    }
  }, [isLoggedIn]);

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
      await axios.post('/staff/logout', {}, {
        withCredentials: true
      });
      
      // App 컴포넌트의 상태 업데이트를 위해 props로 전달받은 함수들 호출
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserInfo(null);
      
      // localStorage 정리
      localStorage.clear();
      
      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error('로그아웃 에러:', error);
      // 에러가 발생해도 강제 로그아웃
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserInfo(null);
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="left-section">
          <div className="logo" onClick={() => navigate('/')}>
            <img src={logoImage} alt="떠발이 직장인 로고" />
            <h1></h1>
          </div>

          <nav className="main-nav">
            <ul>
              <li onClick={() => navigate('/board/list')}>게시판</li>
              {isLoggedIn && (
                <li onClick={() => navigate('/stuff/cart')}>장바구니</li>
              )}
            </ul>
          </nav>
        </div>

        <div className="right-section">
          {isAdmin && (
            <div className="admin-nav">
              <ul>
                <li onClick={() => navigate('/stuff/item/register')}>물건 등록</li>
                <li onClick={() => navigate('/staff/register')}>직원 등록</li>
                <li onClick={() => navigate('/stuff/item/deleted')}>삭제된 물건</li>
                <li onClick={() => navigate('/staff/removelist')}>직원 관리</li>
              </ul>
            </div>
          )}

          <div className="auth-section">
            {!isLoggedIn ? (
              <form className="login-form" onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="아이디"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={memberPw}
                  onChange={(e) => setMemberPw(e.target.value)}
                />
                <button type="submit">로그인</button>
              </form>
            ) : (
              <div className="user-menu">
                {userInfo && (
                  <>
                    <div className="user-info">
                      <span className="user-name">
                        <strong>{userInfo.member_nick}</strong>님
                      </span>
                      <span className="points-display">
                        보유 포인트: <strong>{userInfo.points || 0}P</strong>
                      </span>
                    </div>
                    <div className="user-actions">
                      <button 
                        className="attendance-check" 
                        onClick={handleAttendanceCheck}
                        title="출석 체크하고 포인트를 받으세요!"
                      >
                        출석 체크
                      </button>
                      <button 
                        className="logout-btn" 
                        onClick={handleLogout}
                      >
                        로그아웃
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;