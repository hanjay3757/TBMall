import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RemovedStaff() {
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRemovedStaff = async () => {
      try {
        const response = await axios.post('http://192.168.0.128:8080/mvc/staff/removelist', {}, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (response.data.success) {
          setStaffList(response.data.list || []);
        } else {
          throw new Error(response.data.message || '데이터를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        setError(error.response?.data?.message || '삭제된 직원 목록을 불러오는데 실패했습니다.');
        setStaffList([]);
      }
    };

    fetchRemovedStaff();
  }, []);

  const handleRestore = async (member_no) => {
    try {
      const params = new URLSearchParams();
      params.append('member_no', member_no);
      
      const response = await axios.post(`http://192.168.0.128:8080/mvc/staff/restore`, params, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        // 복구 성공 시 목록 새로고침
        const listResponse = await axios.post('http://192.168.0.128:8080/mvc/staff/removelist', {}, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
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
    <div className="removed-staff">
      <h2>삭제된 직원 목록</h2>
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
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
              <tr key={staff.member_no}>
                <td>{staff.member_no}</td>
                <td>{staff.member_id}</td>
                <td>{staff.member_nick}</td>
                <td>{staff.admins === 1 ? '관리자' : '일반 직원'}</td>
                <td>
                  <button onClick={() => handleRestore(staff.member_no)}>복구</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RemovedStaff;