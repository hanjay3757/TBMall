import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    member_pw: '',
    confirmPassword: '',
    member_nick: '',
    member_gender: '',
    member_birth: '',
    member_phone: '',
    member_email: '',
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
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.member_pw !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8080/mvc/staff/register', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
  
      const data = await response.json();
  
      if (data.success) {
        alert(data.message);
        navigate('/');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('직원 등록 실패:', error);
      alert('직원 등록에 실패했습니다.');
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
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
         <div className="form-group">
          <label>사원명</label>
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
          <input
            type="text"
            name="member_gender"
            value={formData.member_gender}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>생일</label>
          <input
            type="text"
            name="member_birth"
            value={formData.member_birth}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>전화번호</label>
          <input
            type="text"
            name="member_phone"
            value={formData.member_phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>메일</label>
          <input
            type="text"
            name="member_email"
            value={formData.member_email}
            onChange={handleChange}
            required
          />
        </div>


        {/* {isAdmin && (
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="admins"
                checked={formData.admins === 1}
                onChange={(e) => setFormData({
                  ...formData,
                  admins: e.target.checked ? 1 : 0
                })}
              />
              관리자
            </label>
          </div>
        )} */}
        <div className="button-group">
          <button type="submit">등록하기</button>
        </div>
      </form>
    </div>
  );
}

export default Register;