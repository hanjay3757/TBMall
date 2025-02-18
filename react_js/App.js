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
import Terms from './components/pages/Terms';
import Privacy from './components/pages/Privacy';
import FAQ from './components/pages/FAQ';
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
  const [refreshItemList, setRefreshItemList] = useState(0);

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
      console.log('로그인 상태 확인 응답:', response.data);
      if (response.data.isLoggedIn) {
        setIsLoggedIn(true);
        setIsAdmin(response.data.isAdmin);
        
        // userInfo 업데이트
        const updatedUserInfo = {
          member_no: response.data.member_no,
          member_nick: response.data.name,
          points: response.data.points,
          position_no: response.data.delete_right_no,
          isAdmin: response.data.isAdmin,
          admin_no: response.data.admin_no
        };
        
        setUserInfo(updatedUserInfo);
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      }
    })
    .catch(error => {
      console.error('로그인 상태 확인 실패:', error);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserInfo(null);
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
    axios.post('/staff/logout', {}, {
      withCredentials: true
    })
      .then(response => {
        // 서버 응답 성공 여부와 관계없이 로그아웃 처리
        // 상태 초기화
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserInfo(null);

        // localStorage 정리
        localStorage.clear(); // 모든 데이터 삭제

        // 홈으로 이동
        navigate('/');
        
        // 페이지 새로고침
        window.location.reload();
      })
      .catch(error => {
        console.error('로그아웃 실패:', error);
        // 에러가 발생해도 클라이언트에서 로그아웃 처리
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserInfo(null);
        localStorage.clear();
        navigate('/');
        window.location.reload();
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
    try {
      // 로그인 상태와 사용자 정보 확인
      if (!isLoggedIn) {
        alert('로그인이 필요한 서비스입니다.');
        return;
      }

      // localStorage에서 최신 사용자 정보 가져오기
      const storedUserInfo = localStorage.getItem('userInfo');
      if (!storedUserInfo) {
        alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      const currentUserInfo = JSON.parse(storedUserInfo);
      if (!currentUserInfo.member_no) {
        alert('사용자 번호를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      // 출석체크 로직
      const attendanceKey = `lastAttendanceDate_${currentUserInfo.member_no}`;
      const lastAttendanceDate = localStorage.getItem(attendanceKey);
      const today = new Date().toISOString().split('T')[0];

      if (lastAttendanceDate === today) {
        alert('오늘은 이미 출석체크를 했습니다. 내일 다시 해주세요~');
        return;
      }

      // 직급별 포인트 설정
      let rewardPoints = 30;  // 기본 포인트
      if (currentUserInfo.position_no === 2) {
        rewardPoints = 100;  // 대리 포인트
      } else if (currentUserInfo.position_no === 3) {
        rewardPoints = 50;   // 과장 포인트
      }

      // 서버에 출석체크 요청
      const params = new URLSearchParams();
      params.append('member_no', currentUserInfo.member_no);
      params.append('points', rewardPoints);

      const response = await axios.post('/staff/pointAdd', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true
      });

      if (response.data.success) {
        localStorage.setItem(attendanceKey, today);

        const updatedUserInfo = {
          ...currentUserInfo,
          points: currentUserInfo.points + rewardPoints
        };

        setUserInfo(updatedUserInfo);
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

        alert(`출석체크가 완료되었습니다.\n포인트가 +${rewardPoints}P 증가했습니다!`);
      } else {
        alert(response.data.message || '출석체크에 실패했습니다.');
      }
    } catch (error) {
      console.error('출석체크 실패:', error);
      alert('출석체크 중 문제가 발생했습니다.');
    }
  };

  const handleAttendanceReset = async () => {
    try {
      // localStorage의 모든 키 가져오기
      const keys = await Object.keys(localStorage);
      
      // 출석체크 관련 키만 필터링
      const attendanceKeys = keys.filter(key => key.startsWith('lastAttendanceDate_'));
      
      if (attendanceKeys.length > 0) {
        // 모든 출석체크 기록 삭제
        attendanceKeys.forEach(key => localStorage.removeItem(key));
        alert('모든 사용자의 출석체크가 초기화되었습니다.');
      } else {
        alert('초기화할 출석체크 기록이 없습니다.');
      }
    } catch (error) {
      console.error('출석체크 초기화 실패:', error);
      alert('출석체크 초기화 중 문제가 발생했습니다.');
    }
  };

  const handleRefreshItemList = () => {
    setRefreshItemList(prev => prev + 1);
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
          <Route path="/" element={
            <ItemList 
              isLoggedIn={isLoggedIn} 
              isAdmin={isAdmin}
              refreshKey={refreshItemList} 
            />
          } />
          <Route path="/staff/edit" element={<StaffEdit onUpdate={loadStaffList} />} />
          <Route path="/stuff/item/list" element={<ItemList isLoggedIn={isLoggedIn} isAdmin={isAdmin} />} />
          <Route path="/staff/register" element={<StaffRegister />} />
          <Route path="/stuff/item/register" element={<ItemRegister />} />
          <Route path="/stuff/item/edit" element={<ItemEdit />} />
          <Route path="/stuff/item/deleted" element={<DeletedItems />} />
          <Route path="/stuff/cart" element={
            <Cart 
              setUserInfo={setUserInfo}
              onOrderComplete={handleRefreshItemList}
            />
          } />
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
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
