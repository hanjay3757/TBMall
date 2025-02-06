import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RemovedStaff.css';
import { SERVER_URL } from '../config';

function RemovedStaff() {
  const [removedStaffList, setRemovedStaffList] = useState([]);
  const [activeStaffList, setActiveStaffList] = useState([]); // 빈 배열로 초기화
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRemovedStaff();
    fetchActiveStaff(); // 현재 직원 목록도 함께 불러오기
  }, []);

  // 삭제된 직원 목록 불러오기
  const fetchRemovedStaff = async () => {
    try {
      const response = await axios.post(`${SERVER_URL}/mvc/staff/removelist`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.success) {
        setRemovedStaffList(response.data.list || []);
      } else {
        throw new Error(response.data.message || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setError(error.response?.data?.message || '삭제된 직원 목록을 불러오는데 실패했습니다.');
    }
  };

  // 현재 직원 목록 불러오기 함수 수정
  const fetchActiveStaff = async () => {
    try {
      const response = await axios.post(`${SERVER_URL}/mvc/staff/list`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // 응답 데이터 구조 확인 및 처리
      if (response.data && Array.isArray(response.data.staff)) {
        setActiveStaffList(response.data.staff);
      } else {
        console.error('예상치 못한 응답 데이터 형식:', response.data);
        setActiveStaffList([]); // 빈 배열로 설정
      }
    } catch (error) {
      console.error('현재 직원 목록을 불러오는데 실패했습니다:', error);
      setActiveStaffList([]); // 에러 시 빈 배열로 설정
    }
  };

  const handleRestore = async (member_no) => {
    try {
      const params = new URLSearchParams();
      params.append('member_no', member_no);
      
      const response = await axios.post(`${SERVER_URL}/mvc/staff/restore`, params, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        // 복구 성공 시 양쪽 목록 모두 새로고침
        fetchRemovedStaff();
        fetchActiveStaff();
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
    <div className="staff-management">
      {/* 현재 직원 목록 */}
      <div className="staff-section">
        <h2>현재 직원 목록</h2>
        <table className="staff-table">
          <thead>
            <tr>
              <th>직원번호</th>
              <th>아이디</th>
              <th>이름</th>
              <th>관리자 여부</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(activeStaffList) && activeStaffList.map(staff => (
              <tr key={staff.member_no}>
                <td>{staff.member_no}</td>
                <td>{staff.member_id}</td>
                <td>{staff.member_nick}</td>
                <td>{staff.admins === 1 ? '관리자' : '일반 직원'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 삭제된 직원 목록 */}
      <div className="staff-section">
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
              {removedStaffList.map(staff => (
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
    </div>
  );
}

export default RemovedStaff;