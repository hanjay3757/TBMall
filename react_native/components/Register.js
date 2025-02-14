import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SERVER_URL } from '../config';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    member_id: '',
    member_pw: '',
    member_pw_confirm: '',
    member_nick: '',
    member_gender: 'M', 
    member_birth: '',
    member_phone: '',
    member_email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(formData.member_pw !== formData.member_pw_confirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const requestData = {};
      Object.keys(formData).forEach(key => {
        if(key !== 'member_pw_confirm') {
          requestData[key] = formData[key];
        }
      });

      const response = await axios.post(
        `${SERVER_URL}/mvc/staff/register`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert('직원 등록이 완료되었습니다.');
        navigate('/');
      } else {
        alert(response.data.message || '등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('등록 실패:', error);
      if (error.response) {
        console.error('에러 응답:', error.response.data);
        alert(error.response.data.message || '등록 중 오류가 발생했습니다.');
      } else {
        alert('서버와의 통신 중 오류가 발생했습니다.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'member_phone') {
      // 숫자만 추출
      const numbers = value.replace(/[^0-9]/g, '');
      
      // 최대 11자리까지만 허용
      if (numbers.length <= 11) {
        // 전화번호 형식에 맞게 하이픈 추가
        let formattedNumber = '';
        if (numbers.length <= 3) {
          formattedNumber = numbers;
        } else if (numbers.length <= 7) {
          formattedNumber = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else {
          formattedNumber = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        }
        
        setFormData(prev => ({
          ...prev,
          [name]: formattedNumber
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="register-form-container">
      <h2>직원 등록</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디</label>
          <input
            type="text"
            name="member_id"
            value={formData.member_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            name="member_pw"
            value={formData.member_pw}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>비밀번호 확인</label>
          <input
            type="password"
            name="member_pw_confirm"
            value={formData.member_pw_confirm}
            onChange={handleChange}
            required
          />
          {formData.member_pw !== formData.member_pw_confirm && formData.member_pw_confirm && (
            <span className="error-message">비밀번호가 일치하지 않습니다.</span>
          )}
        </div>
        <div className="form-group">
          <label>이름</label>
          <input
            type="text"
            name="member_nick"
            value={formData.member_nick}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>성별</label>
          <select
            name="member_gender"
            value={formData.member_gender}
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
            value={formData.member_birth}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="form-group">
          <label>전화번호</label>
          <input
            type="tel"
            name="member_phone"
            value={formData.member_phone}
            onChange={handleChange}
            placeholder="숫자만 입력하세요"
            maxLength="13"
            required
          />
        </div>
        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            name="member_email"
            value={formData.member_email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit">등록</button>
          <button type="button" onClick={() => navigate('/')}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;