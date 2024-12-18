import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

function StaffEdit({ onUpdate }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const member_no = searchParams.get('member_no');
  const [isAdmin, setIsAdmin] = useState(false);

  const [staffData, setStaffData] = useState({
    member_id: '',
    member_nick: '',
    member_gender: '',
    member_birth: '',
    member_phone: '',
    member_email: '',
    admins: 0
  });

  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/mvc/staff/list', {
          withCredentials: true
        });
        
        if (response.data) {
          const staff = response.data.find(staff => staff.member_no === parseInt(member_no));
          console.log('서버에서 받은 직원 데이터:', staff);
          
          if (staff) {
            const formattedData = {
              ...staff,
              member_birth: staff.member_birth ? 
                new Date(staff.member_birth).toISOString().split('T')[0] : ''
            };
            setStaffData(formattedData);
          } else {
            throw new Error('직원을 찾을 수 없습니다.');
          }
        }
      } catch (error) {
        console.error('직원 정보를 가져오는데 실패했습니다:', error);
        alert('직원 정보를 불러오는데 실패했습니다.');
        navigate('/');
      }
    };

    if (member_no) {
      fetchStaffData();
    }
  }, [member_no, navigate]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8080/mvc/staff/check-login');
        setIsAdmin(response.data.isAdmin);
      } catch (error) {
        navigate('/');
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      
      const loginCheckResponse = await axios.get('http://localhost:8080/mvc/staff/check-login');
      console.log('현재 로그인 상태:', loginCheckResponse.data);

      console.log('원래 데이터:', staffData);
      console.log('수정할 member_id:', staffData.member_id);

      params.append('member_no', member_no);
      params.append('member_id', staffData.member_id.trim());
      params.append('member_nick', staffData.member_nick);
      params.append('member_phone', staffData.member_phone);
      params.append('member_email', staffData.member_email);
      params.append('currentPassword', loginCheckResponse.data.isAdmin ? '' : currentPassword);

      if (staffData.member_pw) {
        params.append('member_pw', staffData.member_pw);
      }

      const requestData = Object.fromEntries(params);
      console.log('서버로 전송할 데이터:', requestData);

      const response = await axios.post(
        'http://localhost:8080/mvc/staff/edit',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          withCredentials: true
        }
      );

      console.log('서버 응답:', response.data);

      if (response.data.success) {
        alert(response.data.message || '직원 정보가 수정되었습니다.');
        console.log('목록 새로고침 시작');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await onUpdate();
        console.log('목록 새로고침 완료');
        navigate('/');
      } else {
        throw new Error(response.data.message || '수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('직원 정보 수정 실패:', error);
      if (error.response) {
        console.error('서버 에러 응답:', error.response.data);
      }
      alert(error.response?.data?.message || '직원 정보 수정에 실패했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaffData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="edit-form-container">
      <h2>직원 정보 수정</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디</label>
          <input
            type="text"
            name="member_id"
            value={staffData.member_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>이름</label>
          <input
            type="text"
            name="member_nick"
            value={staffData.member_nick}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>성별</label>
          <select
            name="member_gender"
            value={staffData.member_gender}
            onChange={handleChange}
            required
          >
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </div>
        <div className="form-group">
          <label>생년월일</label>
          <input
            type="date"
            name="member_birth"
            value={staffData.member_birth}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>전화번호</label>
          <input
            type="tel"
            name="member_phone"
            value={staffData.member_phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            name="member_email"
            value={staffData.member_email}
            onChange={handleChange}
            required
          />
        </div>
        {!isAdmin && (
          <div className="form-group">
            <label>현재 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
        )}
        <div className="button-group">
          <button type="submit">수정</button>
          <button type="button" onClick={() => navigate('/')}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default StaffEdit;