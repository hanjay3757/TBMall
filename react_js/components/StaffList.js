import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffList = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    // Fetch staff list from the server
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      const response = await fetch('/api/staff');
      const data = await response.json();
      setStaffList(data);
    } catch (error) {
      console.error('Error fetching staff list:', error);
    }
  };

  // 수정 버튼 클릭 핸들러
  const handleEdit = (member_no) => {
    console.log('수정 버튼 클릭:', member_no);
    navigate(`/staff/edit/${member_no}`);  // 직원 수정 페이지로 이동
  };

  return (
    <div>
      {staffList.map((staff) => (
        <div key={staff.member_no}>
          {/* ... 다른 정보들 ... */}
          <button 
            onClick={() => handleEdit(staff.member_no)}  // onEdit 대신 handleEdit 사용
            className="edit-button"
          >
            수정
          </button>
        </div>
      ))}
    </div>
  );
};

export default StaffList; 