import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
  const [isAdmin, setIsAdmin] = useState(false);
  //사용자가 관리자일때 상태를 관리하는 변수
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 사용자가 로그인 상태인지 확인함 
  const [userInfo, setUserInfo] = useState({name:'', points: 0 , position_no: 0}); //사용자 정보를 저장
  const [staffList, setStaffList] = useState([]);
  //직원 목록을 저장배열
  const [loading , setLoading] = useState(true);
  //데이터를 로드 중인지 여부를 관리
  const navigate = useNavigate();
//페이지 네비게이션을 위한 축 지정
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPage, setTotalPage] = useState(1); // 총 페이지 수
  const [isAttendanceChecked, setIsaAttendanceChecked] = useState(false);

 

  useEffect(() => {

  // const lastAttendanceDate = localStorage.getItem('lastAttendanceDate');
  //   const today = new Date().toISOString().split('T')[0];

    if(!userInfo || userInfo.points == null ) return;

    async function fetchData() {
      await checkLoginStatus();
      const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          setUserInfo(storedUserInfo ? JSON.parse(storedUserInfo) : { name: '', points: 0 ,position_no: 0});  // userInfo 상태 업데이트
    }
      setLoading(false); //로딩 완료 로그인 상태를 확인
    }
    fetchData();
    loadStaffList(currentPage);
  }, [currentPage,userInfo?.points ]);
  //로그인 상태를 확인후 직원 목록을 불러오는것 빈배열로 하나를 만든건 한번만 실행되게끔 하기 위해서


  // 로그인 상태 확인
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
    axios.post('http://192.168.0.128:8080/mvc/staff/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      withCredentials: true,
    })
      .then(response => {
        /* 서버가 응답한 데이터가 성공적인 로그인인지 확인함 */
        if (response.data.success) {
          setIsLoggedIn(true); //로그인 상태를 true로 설정
          setIsAdmin(response.data.isAdmin); // isadmin 값으로 관리자여부를 설정함
          
          // setUserInfo(userInfo);
          // const userInfo ={
          //   name: response.data.name || '',
          //   points: response.data.points || 0,
          // }

           // ✅ `position_no`가 제대로 들어오는지 확인
        const positionNo = response.data.position_no;
        console.log("포지션 번호 확인:", positionNo);

          setUserInfo( ({
            name: response.data.name || '',
            points: response.data.points || 0,
            position_no:  positionNo || 0,
          }));
         
          // localStorage.setItem('userInfo', JSON.stringify(userInfo));
          localStorage.setItem('userInfo', JSON.stringify({
            name: response.data.name || '',
            points: response.data.points || 0,
            position_no: positionNo || 0,
          }));
          //로그인 성공시 member_no 만 로컬 스토리지에 저장
          localStorage.setItem('member_no',response.data.member_no || '');
          console.log('stored member_no:',response.data.member_no);
          console.log(response.data.isAdmin);
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
    axios.post('http://192.168.0.128:8080/mvc/staff/logout')
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

   // 페이지 변경 함수
   const handlePageChange = (page) => {
    console.log("페이지 변경 요청: ",page);
    setCurrentPage(page);
    loadStaffList(page);
  };

  //출석 체크 버튼 클릭 핸들러
  const handleAttendanceCheck = async () =>{
    if(!isLoggedIn){
      alert("로그인이 필요합니다.");
      return;
    }
    const member_no = localStorage.getItem('member_no');
    if (!member_no) {
      alert("회원 정보가 없습니다.");
      return;
    }

    console.log("현재 로그인된 유저의 position_no:", userInfo.position_no);

    //금일 출석 체크 했는지 확인
    const lastAttendanceDate= localStorage.getItem('lastAttendanceDate');
    const today = new Date().toISOString().split('T')[0];

    if(lastAttendanceDate == today){
      alert("금일 출석체크 성공. 내일 다시 해주세요~");
      return;
    }

    let rewardPoints = 30; // 기본값
      if (userInfo.position_no === 2) {
        rewardPoints = 100;
      } else if (userInfo.position_no === 3) {
        rewardPoints = 50;
      }

    try{
      const response = await axios.post(
        `http://192.168.0.128:8080/mvc/staff/pointAdd?member_no=${member_no}&points=${rewardPoints}`,
        {member_no: userInfo.member_no},
        { withCredentials: true }
      );
      
       
      // alert(response.data.message);  // 출석 체크 완료 메시지

      // 2. 포인트 업데이트 후 getUserInfo 호출해서 최신 정보 불러오기
      if (response.data.success) {
        alert(response.data.message);
        
        // const userInfoResponse = await axios.post(
        //   "http://192.168.0.128:8080/mvc/staff/check-login",
        //   {},
        //   { withCredentials: true }
        // );

        // ✅ 최신 포인트만 업데이트하여 `useEffect` 무한 호출 방지
        
        // console.log("서버에서 받아온 최신 userInfo:", userInfoResponse.data);

        //출석 체크 성공시, 오늘 날짜 저장
        localStorage.setItem('lastAttendanceDate',today);

        // ✅ 최신 포인트를 반영하여 화면 업데이트
        setUserInfo(prevUserInfo => ({
          ...prevUserInfo,
          points: userInfo.points + rewardPoints, 
        }));

        // ✅ 로컬 스토리지 업데이트
        localStorage.setItem('userInfo', JSON.stringify({
          ...userInfo,
          points:  userInfo.points + rewardPoints,
        }));

        
      
      } else {
        alert(response.data.message);
      
    }
  } catch(error){
    console.error("출석 체크 요청 중 오류 발생:", error);
    alert("출석 체크 중 문제가 발생했습니다.");
  }
    //   const userInfoResponse = await axios.post("http://192.168.0.128:8080/mvc/staff/check-login", {}, {
    //     withCredentials: true,
    //   });

    //   if (userInfoResponse.data.isLoggedIn) {
    //     // 3. 최신 userInfo로 상태 업데이트
    //     setUserInfo(prevUserInfo => ({
    //       ...prevUserInfo,
    //       points: userInfoResponse.data.points || 0,
    //     }));

    //     // 로컬 스토리지에도 업데이트된 userInfo 저장
    //     localStorage.setItem('userInfo', JSON.stringify({
    //       ...userInfoResponse.data,
    //       points: userInfoResponse.data.points || 0,
    //     }));

    //     checkLoginStatus();  
    //   } else {
    //     alert("정보 조회에 실패했습니다.");
    //   }
    // } else {
    //   alert(response.data.message);  // 실패 메시지
    // }
   
  }

  //   try {
  //     const response = await axios.post('/staff/list', {}, {
  //       withCredentials: true,
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json'
  //       }
  //     });
      
  //     if (response.data) {
  //       setStaffList(response.data);
  //     }
  //   } catch (error) {
  //     console.error('직원 목록 조회 실패:', error);
  //   }
  // }

  // 직원 삭제
  function confirmDelete(member_no) {
    if (window.confirm('이 직원을 삭제하시겠습니까?')) {
      const params = new URLSearchParams();
      //GET 요청이나 폼 제출에서 사용되는 쿼리 파라미터를 생성하거나 
      // 수정할 때 사용되는 urlsearchparams
      //자동 인코딩: URLSearchParams는 값에 특수 문자가 포함될 경우 자동으로 URL 인코딩
      params.append('member_no', member_no);

      axios.post('http://192.168.0.128:8080/mvc/staff/remove', params, {
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
            <>
            {/* 사용자 정보 표시 */}
            {userInfo && (
              <span>
                {userInfo.name}님 안녕하세요. 잔여 포인트: {userInfo.points}
              </span>
            )}
            <button onClick={handleLogout}>로그아웃</button>
            {/* 출석 체크 버튼 추가 */}
          <button
            onClick={handleAttendanceCheck}
            style={{
              marginLeft: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              padding: "10px 15px",
              cursor: "pointer",
            }}
          >
            출석 체크
          </button>
          </>
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
        <button onClick={() => navigate('/staff/register')}>직원 등록</button>
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
       
      {/*글 작성 라우트 설정중....*/ }
      <Route path="/board/write" element={<BoardWrite /> } />
      
      {/* "/board/editContent" 경로에 BoardEdit 컴포넌트를 렌더링 */}
      <Route path="/board/editContent" element={<BoardEdit isLoggedIn={isLoggedIn} isAdmin ={isAdmin}/> } />


      {/* "/staff/list" 경로에 StaffTable 컴포넌트를 렌더링 */}
      {/* staffList를 전달하여 직원 목록을 표시 */}
      {/* onDelete와 onEdit을 통해 삭제 및 수정 기능을 처리 */}
      {/* 1. 라우터의 기본 개념
웹 애플리케이션에서 라우터는 주로 HTTP 요청을 처리하는 엔드포인트를 정의하는 역할을 합니다. 각 요청(예: GET, POST, PUT, DELETE 등)에 대해 어떻게 응답할지 결정하는 코드가 라우터에 의해 설정됩니다. */}
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
    </Routes>

    {/* 관리자일 경우만 StaffTable을 다시 렌더링
    {/* key를 JSON.stringify(staffList)로 설정하여 목록이 변경될 때마다 새로고침이 되도록 함 */}
    {/* {isAdmin && (
      <StaffTable 
        staffList={staffList}
        onDelete={confirmDelete}
        onEdit={editStaff}
        key={JSON.stringify(staffList)} // 목록 변경 시 컴포넌트를 리렌더링
      />
    )} */}
  </div>
);
}

export default App;
