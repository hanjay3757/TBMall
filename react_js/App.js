import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route , useNavigate } from 'react-router-dom';
import StaffEdit from './components/StaffEdit';
import ItemList from './components/ItemList';
import ItemRegister from './components/ItemRegister';
import StaffRegister from './components/StaffRegister';
import DeletedItems from './components/DeletedItems';
import Cart from './components/Cart';
import RemovedStaff from './components/RemovedStaff';
import ItemEdit from './components/ItemEdit';
import BoardList from './components/BoardList';
import ReadContent from './components/ReadContent';
import BoardWrite from './components/BoardWrite';
import BoardEdit from './components/BoardEdit';
import { API_BASE_URL, CLIENT_URL } from './config';
import ItemDetail from './components/ItemDetail';
import Header from './components/Header';
import Footer from './components/Footer';
//ㄴ 로딩되는 변수지정 폴더 위치 적어놓음
// axios 기본 설정
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Access-Control-Allow-Origin':CLIENT_URL
};

const StaffTable = ({ staffList, onDelete, onEdit, currentPage, totalPage, onPageChange }) => {
  return (
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
          {staffList.map((staff) => (
            <tr key={staff.member_no + '-' + staff.member_id}>
              <td>{staff.member_no}</td>
              <td>{staff.member_id}</td>
              <td>{staff.member_nick}</td>
              <td>{staff.delete_right_no === 1 ? '관리자' : '일반 직원'}</td>
              <td>
                <button onClick={() => onDelete(staff.member_no)}>삭제</button>
                <button onClick={() => onEdit(staff.member_no)}>수정</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이징 버튼 */}
      <div className="pagination">
        <button 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)}
        >
          이전
        </button>
        {Array.from({ length: totalPage }, (_, index) => (
          <button
            key={index + 1}
            className={currentPage === index + 1 ? 'active' : ''}
            onClick={() => onPageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          다음
        </button>
      </div>
    </>
  );
};
// App 컴포넌트
function App() {
  // 상태 변수들
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading , setLoading] = useState(true);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
        setIsLoggedIn(true);
        setIsAdmin(parsedUserInfo.isAdmin);
        
        // 디버깅을 위한 콘솔 로그
        console.log('Stored userInfo:', parsedUserInfo);
      } catch (error) {
        console.error('Error parsing userInfo:', error);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      await checkLoginStatus();
      setLoading(false);
    }
    fetchData();
    loadStaffList(currentPage);
  }, [currentPage]);

  function checkLoginStatus() {
    return axios.post('/staff/check-login', {}, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(response => {
      console.log('로그인 상태 확인 응답:',response.data);
      setIsLoggedIn(response.data.isLoggedIn);
      setIsAdmin(response.data.isAdmin);
    })
    .catch(error => {
      console.error('로그인 상태 확인 실패:', error);
      setIsLoggedIn(false);
      setIsAdmin(false);
    });
  }
  if(loading){
    return <p>초기 데이터를 불러오는 중입니다.</p>
  }

  function handleLogin(e, formData) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.append('staffId', formData.username);
    params.append('password', formData.password);

    axios.post(`${API_BASE_URL}/staff/login`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      withCredentials: true,
    })
      .then(response => {
        if (response.data.success) {
          setIsLoggedIn(true);
          setIsAdmin(response.data.isAdmin);
          
          // userInfo 객체 구조 수정
          const userInfo = {
            member_no: response.data.member_no || 0,
            member_nick: response.data.member_nick,  // member_nick으로 변경
            points: response.data.points || 0,
            position_no: response.data.position_no || 0,
            isAdmin: response.data.isAdmin,
          };
          
          // localStorage.setItem('member_no', response.data.member_no || '');
          setUserInfo(userInfo);
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          
          // console.log("로컬에 저장된 유저 번호:",userNo);

          console.log('로그인 응답:', response.data);  // 디버깅용
          navigate('/stuff/item/list');
        } else {
          alert(response.data.message || '로그인에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('로그인 요청 실패:', error);
        alert('로그인에 실패했습니다. 서버에 문제가 있습니다.');
      });
  }

  function handleLogout() {
    axios.post('/staff/logout')
      .then(response => {
        if (response.data.success) {
          setIsLoggedIn(false);
          setIsAdmin(false);
          navigate('/');
        }
      })
      .catch(error => {
        console.error('로그아웃 실패:', error);
      });
  }

  async function loadStaffList(page = currentPage) {
    setLoading(true);
    try {
      const response = await axios.post('/staff/list', {
        currentPage: page,
        pageSize: 5,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log("서버 응답: "+response.data);

      const { staff, totalPage } = response.data;

      setStaffList(staff);
      setTotalPage(totalPage);
    } catch (error) {
      console.error('직원 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (page) => {
    console.log("페이지 변경 요청: ",page);
    setCurrentPage(page);
    loadStaffList(page);
  };

  function confirmDelete(member_no) {
    if (window.confirm('이 직원을 삭제하시겠습니까?')) {
      const params = new URLSearchParams();
      params.append('member_no', member_no);

      axios.post('/staff/remove', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true
      })
        .then  (response => {
          if (response.data === 'redirect:/staff/list' || response.status === 200) {
            alert('직원이 삭제되었습니다.');
            loadStaffList(currentPage);
          } else {
            throw new Error('삭제에 실패했습니다.');
          }
        })
        .catch(error => {
          console.error('직원 삭제 실패:', error);
          alert('직원 삭제에 실패했습니다.');
        });
    }
  }

  function editStaff(member_no) {
    navigate(`/staff/edit/${member_no}`);
  }

  const TopMenu = () => {
    const [localLoginForm, setLocalLoginForm] = useState({
      username: '',
      password: ''
    });

    const handleLocalSubmit = (e) => {
      e.preventDefault();
      handleLogin(e, localLoginForm);
    };
    
    return (
      <div className="top-menu">
        <div className="menu-buttons">
          <button onClick={() => navigate('/stuff/item/list')}>물건 목록</button>
          <button onClick={() => navigate('/')}>메인 페이지</button>
          <button onClick={() => navigate('/board/list')}>게시판 이동</button>
          {isLoggedIn && (
            <button onClick={() => navigate('/stuff/cart')}>🛒 장바구니</button>
          )}
        </div>
        <div className="auth-buttons">
          {!isLoggedIn ? (
            <form onSubmit={handleLocalSubmit} className="login-form">
              <input
                type="text"
                placeholder="아이디"
                value={localLoginForm.username}
                onChange={(e) => setLocalLoginForm({
                  ...localLoginForm,
                  username: e.target.value
                })}
                required
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={localLoginForm.password}
                onChange={(e) => setLocalLoginForm({
                  ...localLoginForm,
                  password: e.target.value
                })}
                required
              />
              <button type="submit">로그인</button>
            </form>
          ) : (
            <>
            {userInfo && (
              <span>
                {userInfo.member_nick}님 안녕하세요. 잔여 포인트: {userInfo.points}
              </span>
            )}
            <button onClick={handleLogout}>로그아웃</button>
          </>
          )}
        </div>
      </div>
    );
  };

  const AdminMenu = () => (
    isAdmin && (
      <div className="admin-menu">
        <button onClick={() => navigate('/stuff/item/register')}>물건 등록</button>
        <button onClick={() => navigate('/staff/register')}>직원 등록</button>
        <button onClick={() => navigate('/stuff/item/deleted')}>삭제된 건 목록</button>
        <button onClick={() => navigate('/staff/removelist')}>삭제된 직원 목록</button>
        <button onClick={() => navigate('/staff/list')}>직원 목록</button>
      </div>
    )
  );

  const handleAttendanceCheck = async () => {
    if(!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }

    const member_no = localStorage.getItem('member_no');
    if (!member_no) {
      alert("회원 정보가 없습니다.");
      return;
    }

    console.log("현재 로그인된 유저의 position_no:", userInfo.position_no);

    const lastAttendanceDate = localStorage.getItem('lastAttendanceDate');
    const today = new Date().toISOString().split('T')[0];

    if(lastAttendanceDate === today) {
      alert("금일 출석체크 성공. 내일 다시 해주세요~");
      return;
    }

    let rewardPoints = 30;
    if (userInfo.position_no === 2) {
      rewardPoints = 100;
    } else if (userInfo.position_no === 3) {
      rewardPoints = 50;
    }

    try {
      const response = await axios.post(
        `/staff/pointAdd?member_no=${member_no}&points=${rewardPoints}`,
        { member_no: userInfo.member_no },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        alert(response.data.message);
        
        localStorage.setItem('lastAttendanceDate', today);

        setUserInfo(prevUserInfo => ({
          ...prevUserInfo,
          points: prevUserInfo.points + rewardPoints,
        }));

        localStorage.setItem('userInfo', JSON.stringify({
          ...userInfo,
          points: userInfo.points + rewardPoints,
        }));
      } else {
        alert(response.data.message);
      }
    } catch(error) {
      console.error("출석 체크 요청 중 오류 발생:", error);
      alert("출석 체크 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="App">
      <Header 
        isLoggedIn={isLoggedIn} 
        isAdmin={isAdmin} 
        userInfo={userInfo}
        setIsLoggedIn={setIsLoggedIn}
        setIsAdmin={setIsAdmin}
        setUserInfo={setUserInfo}
        handleAttendanceCheck={handleAttendanceCheck}
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ItemList isLoggedIn={isLoggedIn} isAdmin={isAdmin} />} />
          <Route path="/staff/edit" element={<StaffEdit onUpdate={loadStaffList} />} />
          <Route path="/stuff/item/list" element={<ItemList isLoggedIn={isLoggedIn} isAdmin={isAdmin} />} />
          <Route path="/staff/register" element={<StaffRegister />} />
          <Route path="/stuff/item/register" element={<ItemRegister />} />
          <Route path="/stuff/item/edit" element={<ItemEdit />} />
          <Route path="/stuff/item/deleted" element={<DeletedItems />} />
          <Route path="/stuff/cart" element={<Cart />} />
          <Route path="/staff/removelist" element={<RemovedStaff />} />
          <Route path="/board/list" element={<BoardList isLoggedIn={isLoggedIn} isAdmin={isAdmin}/> } />
          <Route path="/board/read" element={<ReadContent />} />
          <Route path="/board/write" element={<BoardWrite /> } />
          <Route path="/board/editContent" element={<BoardEdit isLoggedIn={isLoggedIn} isAdmin ={isAdmin}/> } />
          <Route path="/staff/list" element={
            <StaffTable 
              staffList={staffList}
              currentPage={currentPage}
              totalPage={totalPage}
              onPageChange={handlePageChange}
              onDelete={confirmDelete}
              onEdit={editStaff}
            />
          } />
          <Route 
            path="/stuff/item/:itemId" 
            element={<ItemDetail isLoggedIn={isLoggedIn} />} 
          />
          <Route path="/staff/edit/:member_no" element={<StaffEdit />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
