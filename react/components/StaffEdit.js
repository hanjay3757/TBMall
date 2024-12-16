import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function StaffEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const member_no = queryParams.get('member_no');

  const [formData, setFormData] = useState({
    member_nick: '',
    member_phone: '',
    member_email: '',
    member_pw: '',
    currentPassword: ''
  });

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/mvc/staff/read`, {
          params: { member_no },
          withCredentials: true
        });
        
        // 응답 데이터로 폼 초기화
        setFormData(prevState => ({
          ...prevState,
          member_nick: response.data.member_nick,
          member_phone: response.data.member_phone,
          member_email: response.data.member_email
        }));
      } catch (error) {
        console.error('직원 정보를 가져오는데 실패했습니다:', error);
        alert('직원 정보를 불러오는데 실패했습니다.');
      }
    };

    if (member_no) {
      fetchStaffData();
    }
  }, [member_no]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append('member_no', member_no);
      params.append('member_nick', formData.member_nick);
      params.append('member_phone', formData.member_phone);
      params.append('member_email', formData.member_email);
      params.append('currentPassword', formData.currentPassword);
      
      // 새 비밀번호가 있는 경우에만 추가
      if (formData.member_pw) {
        params.append('member_pw', formData.member_pw);
      }

      const response = await axios.post(
        'http://localhost:8080/mvc/staff/edit',
        params,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        navigate('/stuff/item/list');
      } else {
        alert(response.data.message || '수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || '수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="staff-edit-form">
      <h2>직원 정보 수정</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>닉네임:</label>
          <input
            type="text"
            name="member_nick"
            value={formData.member_nick}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>전화번호:</label>
          <input
            type="text"
            name="member_phone"
            value={formData.member_phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>이메일:</label>
          <input
            type="email"
            name="member_email"
            value={formData.member_email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>새 비밀번호:</label>
          <input
            type="password"
            name="member_pw"
            value={formData.member_pw}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>현재 비밀번호:</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit">수정</button>
          <button type="button" onClick={() => navigate('/stuff/item/list')}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default StaffEdit;