import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RemovedStaff.css';
import { SERVER_URL } from '../config';

function RemovedStaff() {
  const navigate = useNavigate();
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
      // 페이징 파라미터 추가
      const response = await axios.post(`${SERVER_URL}/mvc/staff/list`, {
        currentPage: 1,
        pageSize: 1000  // 충분히 큰 숫자로 설정
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data) {
        let staffList = [];
        let totalPage = 1;  // 기본값 설정
        
        // 응답 데이터 형식에 따른 처리
        if (response.data.staff && Array.isArray(response.data.staff)) {
          staffList = response.data.staff;
          totalPage = response.data.totalPage || 1;  // totalPage 값이 있으면 사용
        }

        // member_delete가 0인 직원만 필터링
        const activeStaff = staffList.filter(staff => staff.member_delete === 0);
        setActiveStaffList(activeStaff);
        
        console.log('현재 직원 목록 업데이트됨:', {
          staffList: activeStaff,
          totalPage: totalPage
        }); // 데이터 확인용 로그
      }
    } catch (error) {
      console.error('현재 직원 목록을 불러오는데 실패했습니다:', error);
      setActiveStaffList([]);
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
        alert('직원이 복구되었습니다.');
        // 복구 후 순차적으로 목록 새로고침
        await fetchRemovedStaff(); // 먼저 삭제된 목록 업데이트
        await fetchActiveStaff();  // 그 다음 현재 목록 업데이트
      } else {
        throw new Error(response.data.message || '복구에 실패했습니다.');
      }
    } catch (error) {
      console.error('직원 복구 실패:', error);
      alert(error.response?.data?.message || '직원 복구에 실패했습니다.');
    }
  };

  // 직원 삭제 함수
  const handleDelete = async (member_no) => {
    if (window.confirm('이 직원을 삭제하시겠습니까?')) {
      try {
        const params = new URLSearchParams();
        params.append('member_no', member_no);

        const response = await axios.post(`${SERVER_URL}/mvc/staff/remove`, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          withCredentials: true
        });

        if (response.data === 'redirect:/staff/list' || response.status === 200) {
          alert('직원이 삭제되었습니다.');
          // 삭제 후 즉시 양쪽 목록 새로고침
          await Promise.all([
            fetchRemovedStaff(),
            fetchActiveStaff()
          ]);
        } else {
          throw new Error('삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('직원 삭제 실패:', error);
        alert('직원 삭제에 실패했습니다.');
      }
    }
  };

  // 직원 수정 함수 수정
  const handleEdit = (member_no) => {
    navigate(`/staff/edit?member_no=${member_no}`);  // URL 형식 수정
  };

  // 직급 데이터 매핑
  const getPositionName = (positionNo) => {
    const positions = {
      '1': '사장',
      '2': '부장', 
      '3': '대리',
      '4': '사원',
      '5': '과장'
    };
    return positions[positionNo] || '사원';
  };

  const tableStyle = {
    width: '100%',
    tableLayout: 'fixed'
  };

  const thStyle = {
    width: '20%'
  };

  return (
    <div className="staff-management">
      {/* 현재 직원 목록 */}
      <div className="staff-section">
        <h2>현재 직원 목록</h2>
        <div className="table-container">
          <table className="staff-table" style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>직원번호</th>
                <th style={thStyle}>아이디</th>
                <th style={thStyle}>이름</th>
                <th style={thStyle}>직급</th>
                <th style={thStyle}>관리</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(activeStaffList) && activeStaffList.map(staff => (
                <tr key={staff.member_no}>
                  <td>{staff.member_no}</td>
                  <td>{staff.member_id}</td>
                  <td>{staff.member_nick}</td>
                  <td>{getPositionName(staff.position_no)}</td>
                  <td>
                    <button 
                      onClick={() => handleEdit(staff.member_no)}
                      className="edit-button"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => handleDelete(staff.member_no)}
                      className="delete-button"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 삭제된 직원 목록 */}
      <div className="staff-section">
        <h2>삭제된 직원 목록</h2>
        <div className="table-container">
          {error ? (
            <p className="error-message">{error}</p>
          ) : (
            <table className="staff-table" style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>직원번호</th>
                  <th style={thStyle}>아이디</th>
                  <th style={thStyle}>이름</th>
                  <th style={thStyle}>직급</th>
                  <th style={thStyle}>관리</th>
                </tr>
              </thead>
              <tbody>
                {removedStaffList.map(staff => (
                  <tr key={staff.member_no}>
                    <td>{staff.member_no}</td>
                    <td>{staff.member_id}</td>
                    <td>{staff.member_nick}</td>
                    <td>{getPositionName(staff.position_no)}</td>
                    <td>
                      <button 
                        onClick={() => handleRestore(staff.member_no)}
                        className="restore-button"
                      >
                        복구
                      </button>
                      <button 
                        onClick={() => handleEdit(staff.member_no)}
                        className="edit-button"
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default RemovedStaff;