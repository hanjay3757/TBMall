import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import axios from 'axios';
import ReadContent from './ReadContent';
import Header from './Header';

const App = () => {
  const [userInfo, setUserInfo] = useState(null);

  // 사용자 정보와 권한 체크
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/staff/info', {
          withCredentials: true
        });
        
        if (response.data) {
          setUserInfo(response.data);
          console.log('로그인 정보:', response.data);
        }
      } catch (error) {
        console.error('권한 확인 실패:', error);
      }
    };

    checkAuth();
  }, []);

  // userInfo가 있고 member_role이 'ADMIN'인 경우에만 true
  const isAdmin = userInfo?.member_role === 'ADMIN';

  return (
    <>
      <Header setUserInfo={setUserInfo} />
      <Routes>
        <Route 
          path="/board/read" 
          element={
            <ReadContent 
              isAdmin={isAdmin}
              userInfo={userInfo}
            />
          } 
        />
      </Routes>
    </>
  );
};

export default App; 