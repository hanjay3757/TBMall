import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import StaffEdit from './components/StaffEdit';
import ItemList from './components/ItemList';
import ItemRegister from './components/ItemRegister';
import DeletedItems from './components/DeletedItems';
import Cart from './components/Cart';
import RemovedStaff from './components/RemovedStaff';
import Register from './components/Register';

// axios 기본 설정 (withCredentials 설정: 쿠키를 포함하여 요청)
axios.defaults.withCredentials = true;

// App 컴포넌트
function App() {
  // 상태 변수들
  const [isAdmin, setIsAdmin] = useState(false);  // 관리자 여부
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // 로그인 여부
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });  // 로그인 폼 데이터
  const [staffList, setStaffList] = useState([]);  // 직원 목록
  const navigate = useNavigate();  // 페이지 이동을 위한 navigate 훅
  const location = useLocation();  // 현재 URL 정보

  useEffect(() => {
    checkLoginStatus();  // 로그인 상태 확인
    loadStaffList();  // 직원 목록 불러오기
  }, []);

  // 로그인 상태 확인
  function checkLoginStatus() {
    axios.get('http://localhost:8080/mvc/staff/check-login')
      .then(response => {
        setIsLoggedIn(response.data.isLoggedIn);  // 로그인 상태 갱신
        setIsAdmin(response.data.isAdmin);  // 관리자 상태 갱신
      })
      .catch(error => {
        console.error('로그인 상태 확인 실패:', error);
        setIsLoggedIn(false);  // 실패시 로그인 상태를 false로
        setIsAdmin(false);  // 관리자 상태를 false로
      });
  }

  // 로그인 처리
  function handleLogin(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.append('staffId', loginForm.username);
    params.append('password', loginForm.password);

    axios.post('http://localhost:8080/mvc/staff/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(response => {
        if (response.data.success) {
          setIsLoggedIn(true);  // 로그인 성공시 로그인 상태 true
          setIsAdmin(response.data.isAdmin);  // 관리자 여부 갱신
          navigate('/stuff/item/list');  // 물건 목록 페이지로 이동
        } else {
          alert(response.data.message || '로그인에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('로그인 요청 실패:', error);
        alert('로그인에 실패했습니다. 서버에 문제가 있습니다.');
      });
  }

  // 로그아웃 처리
  function handleLogout() {
    axios.post('http://localhost:8080/mvc/staff/logout')
      .then(response => {
        if (response.data.success) {
          setIsLoggedIn(false);  // 로그아웃 후 로그인 상태 false
          setIsAdmin(false);  // 관리자 상태 false
          navigate('/');  // 메인 페이지로 이동
        }
      })
      .catch(error => {
        console.error('로그아웃 실패:', error);
      });
  }

  // 직원 목록 불러오기
  function loadStaffList() {
    axios.get('http://localhost:8080/mvc/staff/list', {
      withCredentials: true
    })
      .then(response => {
        console.log('직원 목록:', response.data); // 디버깅용
        setStaffList(response.data || []);
      })
      .catch(error => {
        console.error('직원 목록 조회 실패:', error);
      });
  }

  // 직원 삭제 확인
  function confirmDelete(member_no) {
    if (window.confirm('이 직원을 삭제하시겠습니까?')) {
      axios.get(`http://localhost:8080/mvc/staff/remove`, {
        params: {
          member_no: member_no
        },
        withCredentials: true
      })
        .then(response => {
          if (response.data.success) {
            alert(response.data.message);
            loadStaffList();  // 직원 목록 재로딩
          } else {
            alert(response.data.message || '직원 삭제에 실패했습니다.');
          }
        })
        .catch(error => {
          console.error('직원 삭제 실패:', error);
          alert(error.response?.data?.message || '직원 삭제에 실패했습니다.');
        });
    }
  }

  // 직원 수정
  function editStaff(member_no) {
    navigate(`/staff/edit?member_no=${member_no}`);  // bno -> member_no로 변경
  }

  // 장바구니에 물건 추가하는 함수
  const handleAddToCart = async (itemId, quantity = 1) => {
    try {
      if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 장바구니 추가 요청
      const params = new URLSearchParams();
      params.append('itemId', itemId);
      params.append('quantity', quantity);

      const response = await axios.post('http://localhost:8080/mvc/stuff/cart/add', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.status === 'success') {
        alert('장바구니에 추가되었습니다.');
        // 장바구니 페이지로 이동하거나 다른 필요한 작업 수행
      } else {
        alert(response.data.message || '장바구니 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
      if (error.response && error.response.status === 400) {
        alert('재고가 부족합니다.');
      } else {
        alert('장바구니 추가 중 오류가 발생했습니다.');
      }
    }
  };

  // TopMenu 컴포넌트 (물건 목록 상단 메뉴)
  const TopMenu = () => (
    <div>
      <div className="top-menu">
        <h1 className="section-title" style={{ margin: 0 }}>물건 목록</h1>
        <div>
          {location.search.includes('message=addedToCart') && (
            <span style={{ color: 'green', marginRight: '20px' }}>
              장바구니에 추가되었습니다!
            </span>
          )}
          <a href="/stuff/cart" className="cart-link">
            🛒 장바구니
          </a>
        </div>
      </div>
    </div>
  );

  // AdminMenu 컴포넌트 (관리자 메뉴)
  const AdminMenu = () => (
    isAdmin && (
      <div className="admin-menu">
        <button onClick={() => navigate('/stuff/item/register')}>물건 등록</button>
        <button onClick={() => navigate('/stuff/item/deleted')}>삭제된 건 목록</button>
        <button onClick={() => navigate('/staff/removelist')}>삭제된 직원 목록</button>
      </div>
    )
  );

  // StaffTable 컴포넌트 (직원 목록 테이블)
  const StaffTable = () => (
    isAdmin && (
      <>
        <h2 className="section-title">직원 목록</h2>
        <table className="staff-table">
          <thead>
            <tr>
              <th>직원번호</th>
              <th>아이디</th>
              <th>닉네임</th>
              <th>관리자 여부</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {staffList
              .filter(staff => !staff.member_delete) // 삭제된 직원 필터링
              .map(staff => (
                <tr key={staff.member_no}>
                  <td>{staff.member_no}</td>
                  <td>{staff.member_id}</td>
                  <td>{staff.member_nick}</td>
                  <td>{staff.admins === 1 ? '관리자' : '일반 직원'}</td>
                  <td>
                    <button onClick={() => confirmDelete(staff.member_no)}>삭제</button>
                    <button onClick={() => editStaff(staff.member_no)}>수정</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </>
    )
  );

  return (
    <div className="App">
      <TopMenu />  {/* 상단 메뉴 */}
      <AdminMenu />  {/* 관리자 메뉴 */}

      {/* 로그인/로그아웃 버튼 */}
      {!isLoggedIn ? (
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="아이디"
            value={loginForm.username}
            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            required
          />
          <button type="submit">로그인</button>
        </form>
      ) : (
        <div className="auth-buttons">
          <button onClick={handleLogout}>로그아웃</button>
          {isAdmin && (
            <button 
              onClick={() => navigate('/staff/register')} 
              className="register-btn"
            >
              직원 등록
            </button>
          )}
        </div>
      )}

      {/* 라우트 설정 */}
      <Routes>
        <Route path="/" element={<ItemList />} />  {/* 물건 목록 페이지 */}
        <Route path="/staff/edit" element={<StaffEdit />} />  {/* 직원 수정 페이지 */}
        <Route path="/stuff/item/list" element={<ItemList onAddToCart={handleAddToCart} isLoggedIn={isLoggedIn} />} />  {/* 물건 목록 페이지 */}
        <Route path="/stuff/item/register" element={<ItemRegister />} />  {/* 물건 등록 페이지 */}
        <Route path="/stuff/item/deleted" element={<DeletedItems />} />  {/* 삭제된 물건 목록 페이지 */}
        <Route path="/stuff/cart" element={<Cart />} />  {/* 장바구니 페이지 */}
        <Route path="/staff/removelist" element={<RemovedStaff />} />  {/* 삭제된 직원 목록 */}
        <Route path="/staff/register" element={<Register />} />  {/* 직원 등록 페이지 */}
      </Routes>

      {/* 관리자일 경우에만 직원 목록 테이블 표시 */}
      {isAdmin && <StaffTable />}
    </div>
  );
}

export default App;
