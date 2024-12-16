import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    member_pw: '',
    member_nick: '',
    member_gender: 'M',
    member_birth: '',
    member_phone: '',
    member_email: '',
    confirmPassword: '',
    admins: 0
  });

  useEffect(() => {
    axios.get('http://localhost:8080/mvc/staff/check-login', { withCredentials: true })
      .then(response => {
        setIsAdmin(response.data.isAdmin);
        if (!response.data.isAdmin) {
          navigate('/');
        }
      })
      .catch(error => {
        console.error('로그인 상태 확인 실패:', error);
        navigate('/');
      });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.member_pw !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const params = new URLSearchParams();
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          params.append(key, formData[key]);
        }
      });

      const response = await axios.post(
        'http://localhost:8080/mvc/staff/register', 
        params,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.success) {
        alert('직원이 등록되었습니다.');
        navigate('/stuff/item/list');
      } else {
        alert(response.data.message || '직원 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('직원 등록 실패:', error);
      alert(error.response?.data?.message || '직원 등록에 실패했습니다.');
    }
  };

  return (
    <div className="register-form-container">
      <h2>직원 등록</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="member_id">아이디</label>
          <input
            id="member_id"
            type="text"
            name="member_id"
            value={formData.member_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="member_nick">닉네임</label>
          <input
            id="member_nick"
            type="text"
            name="member_nick"
            value={formData.member_nick}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="member_pw">비밀번호</label>
          <input
            id="member_pw"
            type="password"
            name="member_pw"
            value={formData.member_pw}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="member_gender">성별</label>
          <select
            id="member_gender"
            name="member_gender"
            value={formData.member_gender}
            onChange={handleChange}
          >
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="member_birth">생년월일</label>
          <input
            id="member_birth"
            type="date"
            name="member_birth"
            value={formData.member_birth}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="member_phone">전화번호</label>
          <input
            id="member_phone"
            type="tel"
            name="member_phone"
            value={formData.member_phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="member_email">이메일</label>
          <input
            id="member_email"
            type="email"
            name="member_email"
            value={formData.member_email}
            onChange={handleChange}
            required
          />
        </div>
        {isAdmin && (
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="admins"
                checked={formData.admins === 1}
                onChange={handleChange}
              />
              관리자 권한 부여
            </label>
          </div>
        )}
        <div className="button-group">
          <button type="submit">등록하기</button>
          <button type="button" onClick={() => navigate('/stuff/item/list')}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default Register;