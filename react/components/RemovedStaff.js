import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RemovedStaff() {
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRemovedStaff = async () => {
      try {
        const response = await axios.get('http://localhost:8080/mvc/staff/removelist', {
          withCredentials: true
        });
        
        if (response.data.success) {
          setStaffList(response.data.list || []); // list 필드에서 데이터 추출
        } else {
          throw new Error(response.data.message || '데이터를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('삭제된 직원 목록 조회 실패:', error);
        setError(error.response?.data?.message || '삭제된 직원 목록을 불러오는데 실패했습니다.');
        setStaffList([]); // 에러 시 빈 배열로 초기화
      }
    };

    fetchRemovedStaff();
  }, []);

  const handleRestore = async (bno) => {
    try {
      const params = new URLSearchParams();
      params.append('bno', bno);
      
      const response = await axios.post(`http://localhost:8080/mvc/staff/restore`, params, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        // 복구 성공 시 목록 새로고침
        const listResponse = await axios.get('http://localhost:8080/mvc/staff/removelist', {
          withCredentials: true
        });
        if (listResponse.data.success) {
          setStaffList(listResponse.data.list || []);
          alert('직원이 복구되었습니다.');
        }
      } else {
        throw new Error(response.data.message || '복구에 실패했습니다.');
      }
    } catch (error) {
      console.error('직원 복구 실패:', error);
      alert(error.response?.data?.message || '직원 복구에 실패했습니다.');
    }
  };

  return (
    <div className="removed-staff-container">
      <h2>삭제된 직원 목록</h2>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <table className="staff-table">
          <thead>
            <tr>
              <th>직원번호</th>
              <th>이름</th>
              <th>관리자 여부</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(staffList) && staffList.length > 0 ? (
              staffList.map(staff => (
                <tr key={staff.bno}>
                  <td>{staff.bno}</td>
                  <td>{staff.btext}</td>
                  <td>{staff.admins === 1 ? '관리자' : '일반 직원'}</td>
                  <td>
                    <button onClick={() => handleRestore(staff.bno)}>복구</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{textAlign: 'center'}}>삭제된 직원이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RemovedStaff;