import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import StaffEdit from './components/StaffEdit';
import ItemList from './components/ItemList';
import ItemRegister from './components/ItemRegister';
import StaffRegister from './components/Register';
import DeletedItems from './components/DeletedItems';
import Cart from './components/Cart';
import RemovedStaff from './components/RemovedStaff';
import ItemEdit from './components/ItemEdit';
import BoardList from './components/BoardList';
import ReadContent from './components/ReadContent';
//ㄴ 로딩되는 변수지정 폴더 위치 적어놓음
// axios 기본 설정
axios.defaults.withCredentials = true;

// StaffTable을 별도의 컴포넌트로 분리
const StaffTable = ({ staffList, onDelete, onEdit }) => {
  /* 리스트 삭제 수정 에대한 테이블 설정 */
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
          {staffList.map(staff => (
            <tr key={staff.member_no + '-' + staff.member_id}>
              <td>{staff.member_no}</td>
              <td>{staff.member_id}</td>
              <td>{staff.member_nick}</td>
              <td>{staff.delete_right_no === 1 ? '관리자' : '일반 직원'}</td>
              {/* 관리자인지 아닌지 표시하는 테이블 만약 0인경우 일반 직원 */}
              <td>
                <button onClick={() => onDelete(staff.member_no)}>삭제</button>
                <button onClick={() => onEdit(staff.member_no)}>수정</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

// App 컴포넌트
function App() {
  // 상태 변수들
  const [isAdmin, setIsAdmin] = useState(false);
  //사용자가 관리자일때 상태를 관리하는 변수
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 사용자가 로그인 상태인지 확인함 
  // const [userInfo, setUserInfo] = useState(null); //사용자 정보를 저장
  const [staffList, setStaffList] = useState([]);
  //직원 목록을 저장배열
  const [loading , setLoading] = useState(true);
  //데이터를 로드 중인지 여부를 관리
  const navigate = useNavigate();
//페이지 네비게이션을 위한 축 지정
  useEffect(() => {


    async function fetchData() {
      await checkLoginStatus();
      setLoading(false); //로딩 완료 로그인 상태를 확인
    }
    fetchData();
    loadStaffList();
  }, []);
  //로그인 상태를 확인후 직원 목록을 불러오는것 빈배열로 하나를 만든건 한번만 실행되게끔 하기 위해서


  // 로그인 상태 확인
  function checkLoginStatus() {
    return axios.get('http://localhost:8080/mvc/staff/check-login')
      .then(response => {
        //서버에서 변환된 데이터를 이용해 로그인 상태와 관리자 여부를 확인 함 
        setIsLoggedIn(response.data.isLoggedIn); //로그인 상태 확인
        setIsAdmin(response.data.isAdmin);//관리자가 맞는 지 확인
        //response.data는 axios가 요청을 보내고 응답 받을때 반환된 데이터를 포함
      })
      .catch(error => {
        //로그인 상태 확인 후 이를 실패 했을때의 기본 설정
        console.error('로그인 상태 확인 실패:', error);
        setIsLoggedIn(false); //로그인 아니네?
        setIsAdmin(false);//관리자는 당연히 아니군 라고 지정
      });
  }
  if(loading){
    //그냥 데이터 불러올때 그 기간동안 로딩중임을 표시
    return <p>초기 데이터를 불러오는 중입니다.</p>
  }

  // 로그인 처리
  function handleLogin(e, formData) {
    e.preventDefault();
    /* 기본적으로 페이지 새로고침을 막는것 */
    const params = new URLSearchParams();
    /* 새로운 파라미터를 지정 이를 urlsearchparams로 만듬 
    (application/x-www-form-urlencoded 형식으로 서버에 제출)*/
    params.append('staffId', formData.username);
    params.append('password', formData.password);
    /* 폼데이터를 지정하는건데 1번은 파라미터 이름, 2번은 파라미터 값을 지정
    파라미터는 같은 이름에 여러 다른 값을 지정하는게 가능 */
    axios.post('http://localhost:8080/mvc/staff/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(response => {
        /* 서버가 응답한 데이터가 성공적인 로그인인지 확인함 */
        if (response.data.success) {
          setIsLoggedIn(true); //로그인 상태를 true로 설정
          setIsAdmin(response.data.isAdmin); // isadmin 값으로 관리자여부를 설정함
          navigate('/stuff/item/list'); // 해당 페이지로 이동하는 함수
        } else {
          alert(response.data.message || '로그인에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('로그인 요청 실패:', error);
        alert('로그인에 실패했습니다. 서버에 문제가 있습니다.');
      });
  }//실패시 메시지는 스킵

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
  }//하드코딩 로그아웃일때 

 // 직원 목록 불러오기 함수
  async function loadStaffList() {
    try {
      //서버로부터 직원 목록을 get 방식으로 요청함
      // 쿼리 파라미터 _t는 캐싱을 방지하기 위해서 현재시간을 추가
      const response = await axios.get(`http://localhost:8080/mvc/staff/list?_t=${Date.now()}`);

      //서버에서 받은 응답에서 meber_delete가 0인 직원만 보이게함 
      const filteredList = response.data.filter(staff => !staff.member_delete);

      //직원목록을 meber no 값을 기준으로 오름차순 정렬
      //... = 스프레드 연산자 = 배열이나 객체를 복사하거나 확장할때 사용
      const sortedStaffList = [...filteredList].sort((a, b) => a.member_no - b.member_no);
      //정렬된 직원 목록을 상태로 설정
      setStaffList(sortedStaffList);
    } catch (error) {
      console.error('직원 목록 조회 실패:', error);
    }
  };

  // 직원 삭제
  function confirmDelete(member_no) {
    if (window.confirm('이 직원을 삭제하시겠습니까?')) {
      const params = new URLSearchParams();
      //GET 요청이나 폼 제출에서 사용되는 쿼리 파라미터를 생성하거나 
      // 수정할 때 사용되는 urlsearchparams
      //자동 인코딩: URLSearchParams는 값에 특수 문자가 포함될 경우 자동으로 URL 인코딩
      params.append('member_no', member_no);

      axios.post('http://localhost:8080/mvc/staff/remove', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true
      })
        .then  (response => {
          if (response.data === 'redirect:/staff/list' || response.status === 200) {
            alert('직원이 삭제되었습니다.');
            loadStaffList();
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

  // 직원 수정
  function editStaff(member_no) {
    navigate(`/staff/edit?member_no=${member_no}`);
  }
  //같은 설명이기에 생략

  // TopMenu 컴포넌트 - 모든 사용자용 공통 메뉴
  const TopMenu = () => {
    // 로컬 상태로 관리
    const [localLoginForm, setLocalLoginForm] = useState({
      username: '',
      password: ''
    });

    const handleLocalSubmit = (e) => {
      e.preventDefault();
      handleLogin(e, localLoginForm);  // 부모의 handleLogin 함수 호출
    };
//localLoginForm: 로그인 폼의 상태(아이디, 비밀번호)를 관리
//handleLocalSubmit: 로그인 폼이 제출될 때 호출되는 함수, 폼 제출 시 기본 동작을 방지하고 handleLogin 함수에 입력된 값을 전달하여 로그인
    
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
            <button onClick={handleLogout}>로그아웃</button>
          )}
        </div>
      </div>
    );
  };

  // AdminMenu 컴포넌트 - 관리자 전용 메뉴
  const AdminMenu = () => (
    isAdmin && (
      <div className="admin-menu">
        <button onClick={() => navigate('/stuff/item/register')}>물건 등록</button>
        <button onClick={() => navigate('/staff/register')}>사원 등록</button>
        <button onClick={() => navigate('/stuff/item/deleted')}>삭제된 건 목록</button>
        <button onClick={() => navigate('/staff/removelist')}>삭제된 직원 목록</button>
        <button onClick={() => navigate('/staff/list')}>직원 목록</button>
      </div>
    )
  );

  return (
    <div className="App">
      <TopMenu />
      <AdminMenu />
       {/* 라우트 설정 - 경로에 맞는 컴포넌트를 렌더링 */}
    <Routes>
      {/* "/" 경로에 ItemList 컴포넌트를 렌더링 */}
      {/* isLoggedIn과 isAdmin 값을 props로 전달하여 로그인 상태와 관리자 여부를 전달 */}
      <Route path="/" element={<ItemList isLoggedIn={isLoggedIn} isAdmin={isAdmin} />} />

      {/* "/staff/edit" 경로에 StaffEdit 컴포넌트를 렌더링 */}
      {/* onUpdate 속성으로 loadStaffList 함수 전달 - 목록 업데이트를 처리 */}
      <Route path="/staff/edit" element={<StaffEdit onUpdate={loadStaffList} />} />

      {/* "/stuff/item/list" 경로에 ItemList 컴포넌트를 렌더링 */}
      <Route path="/stuff/item/list" element={<ItemList isLoggedIn={isLoggedIn} isAdmin={isAdmin} />} />

      {/* "/staff/register" 경로에 StaffRegister 컴포넌트를 렌더링 */}
      <Route path="/staff/register" element={<StaffRegister />} />

      {/* "/stuff/item/register" 경로에 ItemRegister 컴포넌트를 렌더링 */}
      <Route path="/stuff/item/register" element={<ItemRegister />} />

      {/* "/stuff/item/edit" 경로에 ItemEdit 컴포넌트를 렌더링 */}
      <Route path="/stuff/item/edit" element={<ItemEdit />} />

      {/* "/stuff/item/deleted" 경로에 DeletedItems 컴포넌트를 렌더링 */}
      <Route path="/stuff/item/deleted" element={<DeletedItems />} />

      {/* "/stuff/cart" 경로에 Cart 컴포넌트를 렌더링 */}
      <Route path="/stuff/cart" element={<Cart />} />

      {/* "/staff/removelist" 경로에 RemovedStaff 컴포넌트를 렌더링 */}
      <Route path="/staff/removelist" element={<RemovedStaff />} />

      {/* "/board/list" 경로에 BoardList 컴포넌트를 렌더링 */}
      {/* isLoggedIn과 isAdmin 값을 props로 전달 */}
      <Route path="/board/list" element={<BoardList isLoggedIn={isLoggedIn} isAdmin={isAdmin}/> } />

      {/* "/board/read" 경로에 ReadContent 컴포넌트를 렌더링 */}
      <Route path="/board/read" element={<ReadContent />} />

      {/* "/staff/list" 경로에 StaffTable 컴포넌트를 렌더링 */}
      {/* staffList를 전달하여 직원 목록을 표시 */}
      {/* onDelete와 onEdit을 통해 삭제 및 수정 기능을 처리 */}
      <Route path="/staff/list" element={
        <StaffTable 
          staffList={staffList}
          onDelete={confirmDelete}
          onEdit={editStaff}
        />
      } />
    </Routes>

    {/* 관리자일 경우만 StaffTable을 다시 렌더링 */}
    {/* key를 JSON.stringify(staffList)로 설정하여 목록이 변경될 때마다 새로고침이 되도록 함 */}
    {isAdmin && (
      <StaffTable 
        staffList={staffList}
        onDelete={confirmDelete}
        onEdit={editStaff}
        key={JSON.stringify(staffList)} // 목록 변경 시 컴포넌트를 리렌더링
      />
    )}
  </div>
);
}

export default App;
