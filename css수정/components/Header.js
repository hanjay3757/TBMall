import React, { useState } from 'react';
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

      if (response.data.success) {
        // 서버 응답에서 필요한 데이터 추출
        const { member_nick, points, position_no, isAdmin, member_no } = response.data;
        
        // userInfo 객체 생성
        const userInfo = {
          member_nick,
          points: points || 0,
          position_no: position_no || 0,
          isAdmin
        };

        // 상태 업데이트
        setUserInfo(userInfo);
        setIsLoggedIn(true);
        setIsAdmin(isAdmin);

        // 로컬 스토리지에 저장
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        localStorage.setItem('member_no', member_no);

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
    <header className="header">
      <div className="header-content">
        <div className="left-section">
          <div className="logo" onClick={() => navigate('/')}>
            <img src={logoImage} alt="떠발이 직장인 로고" />
            <h1>떠발이 직장인</h1>
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
                        <strong>{userInfo.member_nick || '사용자'}</strong>님
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