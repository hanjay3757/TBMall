import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RemovedStaff() {
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState(null);

  const fetchRemovedStaff = async () => {
    try {
      const response = await axios.get('http://localhost:8080/mvc/staff/removelist', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setStaffList(response.data.list || []); 
      } else {
        throw new Error(response.data.message || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제된 직원 목록 조회 실패:', error);
      setError(error.response?.data?.message || '삭제된 직원 목록을 불러오는데 실패했습니다.');
      setStaffList([]); 
    }
  };

  useEffect(() => {
    fetchRemovedStaff();
  }, []);

  const handleRestore = async (member_no) => {
    try {
      const response = await axios.get(`http://localhost:8080/mvc/staff/restore`, {
        params: { member_no },
        withCredentials: true
      });

      if (response.data.success) {
        fetchRemovedStaff();
        alert('직원이 복구되었습니다.');
      } else {
        throw new Error(response.data.message || '복구에 실패했습니다.');
      }
    } catch (error) {
      console.error('직원 복구 실패:', error);
      alert(error.response?.data?.message || '직원 복구에 실패했습니다.');
    }
  };

  return (
    <div className="removed-staff-container" role="main">
      <h2>삭제된 직원 목록</h2>
      {error ? (
        <div className="error-message" role="alert">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="staff-table" role="grid">
            <caption className="sr-only">삭제된 직원 목록 테이블</caption>
            <thead>
              <tr>
                <th scope="col">직원번호</th>
                <th scope="col">아이디</th>
                <th scope="col">닉네임</th>
                <th scope="col">관리자 여부</th>
                <th scope="col">삭제일</th>
                <th scope="col">관리</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(staffList) && staffList.length > 0 ? (
                staffList.map(staff => (
                  <tr key={staff.member_no}>
                    <td>{staff.member_no}</td>
                    <td>{staff.member_id}</td>
                    <td>{staff.member_nick}</td>
                    <td>{staff.admins === 1 ? '관리자' : '일반 직원'}</td>
                    <td>{new Date(staff.member_delete_at).toLocaleDateString()}</td>
                    <td>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleRestore(staff.member_no);
                      }}>
                        <button 
                          type="submit"
                          aria-label={`${staff.member_nick} 직원 복구`}
                          className="restore-button"
                        >
                          복구
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center'}}>삭제된 직원이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RemovedStaff;