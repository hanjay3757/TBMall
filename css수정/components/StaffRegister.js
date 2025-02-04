import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StaffRegister.css';

function StaffRegister() {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState({
    member_id: '',
    member_pw: '',
    member_nick: '',
    member_gender: '',
    member_birth: '',
    member_phone: '',
    member_email: '',
    email_domain: 'naver.com'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fullEmail = `${staffData.member_email}@${staffData.email_domain}`;
      const submitData = {
        ...staffData,
        member_email: fullEmail
      };

      const response = await axios.post(
        '/staff/register',

        submitData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        alert('직원이 등록되었습니다.');
        navigate('/staff/list');
      }
    } catch (error) {
      console.error('직원 등록 실패:', error);
      alert('직원 등록 중 오류가 발생했습니다.');
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    let formattedNumber = '';
    
    if (value.length <= 11) {
      if (value.length <= 3) {
        formattedNumber = value;
      } else if (value.length <= 7) {
        formattedNumber = `${value.slice(0, 3)}-${value.slice(3)}`;
      } else {
        formattedNumber = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
      }
      
      setStaffData({
        ...staffData,
        member_phone: formattedNumber
      });
    }
  };

  return (
    <div className="staff-register-container">
      <h2>직원 등록</h2>
      <form onSubmit={handleSubmit} className="staff-register-form">
        <div className="form-field">
          <input
            type="text"
            value={staffData.member_id}
            onChange={(e) => setStaffData({...staffData, member_id: e.target.value})}
            placeholder="아이디 (5~20자)"
            required
          />
        </div>

        <div className="form-field">
          <input
            type="password"
            value={staffData.member_pw}
            onChange={(e) => setStaffData({...staffData, member_pw: e.target.value})}
            placeholder="비밀번호 (문자, 숫자, 특수문자 포함 8~20자)"
            required
          />
        </div>

        <div className="form-field">
          <input
            type="text"
            value={staffData.member_nick}
            onChange={(e) => setStaffData({...staffData, member_nick: e.target.value})}
            placeholder="이름을 입력하세요"
            required
          />
        </div>

        <div className="form-field">
          <select
            value={staffData.member_gender}
            onChange={(e) => setStaffData({...staffData, member_gender: e.target.value})}
            required
          >
            <option value="">성별을 선택하세요</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </div>

        <div className="form-field">
          <input
            type="date"
            value={staffData.member_birth}
            onChange={(e) => setStaffData({...staffData, member_birth: e.target.value})}
            required
          />
        </div>

        <div className="form-field">
          <input
            type="tel"
            value={staffData.member_phone}
            onChange={handlePhoneChange}
            placeholder="전화번호를 입력하세요"
            maxLength="13"
            required
          />
        </div>

        <div className="form-field email-field">
          <input
            type="text"
            value={staffData.member_email}
            onChange={(e) => setStaffData({...staffData, member_email: e.target.value})}
            placeholder="이메일을 입력하세요"
            required
          />
          <span>@</span>
          <select
            value={staffData.email_domain}
            onChange={(e) => setStaffData({...staffData, email_domain: e.target.value})}
          >
            <option value="naver.com">naver.com</option>
            <option value="gmail.com">gmail.com</option>
            <option value="daum.net">daum.net</option>
          </select>
        </div>

        <div className="button-group">
          <button type="submit" className="register-button">등록</button>
          <button type="button" className="cancel-button" onClick={() => navigate(-1)}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default StaffRegister; 