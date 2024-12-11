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

// axios 기본 설정
axios.defaults.withCredentials = true;

// App 컴포넌트
function App() {
  // 상태 변수들
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [staffList, setStaffList] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkLoginStatus();
    loadStaffList();
  }, []);

  // 로그인 상태 확인
  function checkLoginStatus() {
    axios.get('http://localhost:8080/mvc/staff/check-login')
      .then(response => {
        setIsLoggedIn(response.data.isLoggedIn);
        setIsAdmin(response.data.isAdmin);
      })
      .catch(error => {
        console.error('로그인 상태 확인 실패:', error);
        setIsLoggedIn(false);
        setIsAdmin(false);
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
          setIsLoggedIn(true);
          setIsAdmin(response.data.isAdmin);
          navigate('/stuff/item/list'); // 수정된 경로
        } else {
          alert(response.data.message || '로그인에 실패했습니다.'); // 메시지 개선
        }
      })
      .catch(error => {
        console.error('로그인 요청 실패:', error); // 콘솔에 에러 로그 추가
        alert('로그인에 실패했습니다. 서버에 문제가 있습니다.'); // 에러 메시지 개선
      });
  }

  // 로그아웃 처리
  function handleLogout() {
    axios.post('http://localhost:8080/mvc/staff/logout')
      .then(response => {
        if (response.data.success) {
          setIsLoggedIn(false);
          setIsAdmin(false);
          navigate('/'); // 로그아웃 후 메인 페이지로 이동
        }
      })
      .catch(error => {
        console.error('로그아웃 실패:', error);
      });
  }

  // 직원 목록 불러오기
  function loadStaffList() {
    axios.get('http://localhost:8080/mvc/staff/list')
      .then(response => {
        setStaffList(response.data || []);
      })
      .catch(error => {
        console.error('직원 목록 조회 실패:', error);
      });
  }

  // 직원 삭제
  function confirmDelete(bno) {
    if (window.confirm('이 직원을 삭제하시겠습니까?')) {
      const params = new URLSearchParams();
      params.append('bno', bno);

      axios.post('http://localhost:8080/mvc/staff/remove', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then(response => {
          if (response.data.success) {
            alert('직원이 삭제되었습니다.');
            loadStaffList();
          } else {
            alert(response.data.message);
          }
        })
        .catch(error => {
          alert('직원 삭제에 실패했습니다.');
        });
    }
  }

  // 직원 수정
  function editStaff(bno) {
    navigate(`/staff/edit?bno=${bno}`);
  }

  // TopMenu 컴포넌트
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

  // AdminMenu 컴포넌트
  const AdminMenu = () => (
    isAdmin && (
      <div className="admin-menu">
        <button onClick={() => navigate('/stuff/item/register')}>물건 등록</button>
        <button onClick={() => navigate('/stuff/item/deleted')}>삭제된 건 목록</button>
        <button onClick={() => navigate('/staff/removelist')}>삭제된 직원 목록</button>
      </div>
    )
  );

  // StaffTable 컴포넌트
  const StaffTable = () => (
    isAdmin && (
      <>
        <h2 className="section-title">직원 목록</h2>
        <table className="staff-table">
          <thead>
            <tr>
              <th>직원번호</th>
              <th>아이디</th>
              <th>이름</th>
              <th>관리자 여부</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map(staff => (
              <tr key={staff.bno}>
                <td>{staff.bno}</td>
                <td>{staff.id}</td>
                <td>{staff.btext}</td>
                <td>{staff.admins === 1 ? '관리자' : '일반 직원'}</td>
                <td>
                  <button onClick={() => confirmDelete(staff.bno)}>삭제</button>
                  <button onClick={() => editStaff(staff.bno)}>수정</button>
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
      <TopMenu />
      <AdminMenu />
      
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
        <button onClick={handleLogout}>로그아웃</button>
      )}

      {/* 라우트 설정 수정 */}
      <Routes>
        {/* 메인 페이지에 ItemList 표시 */}
        <Route path="/" element={<ItemList />} />
        <Route path="/staff/edit" element={<StaffEdit />} />
        <Route path="/stuff/item/list" element={<ItemList />} />
        <Route path="/stuff/item/register" element={<ItemRegister />} />
        <Route path="/stuff/item/deleted" element={<DeletedItems />} />
        <Route path="/stuff/cart" element={<Cart />} />
        <Route path="/staff/removelist" element={<RemovedStaff />} />
      </Routes>

      {/* 관리자일 경우에만 StaffTable 표시 */}
      {isAdmin && <StaffTable />}
    </div>
  );
}

export default App;
