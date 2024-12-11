import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    btext: '',
    password: '',
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
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/mvc/staff/register', 
        {
          btext: formData.btext,
          password: formData.password,
          admins: formData.admins ? 1 : 0
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        navigate('/');
      } else {
        alert(response.data.message);
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
          <label>아이디</label>
          <input
            type="text"
            name="btext"
            value={formData.btext}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
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
        {isAdmin && (
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
        )}
        <div className="button-group">
          <button type="submit">등록하기</button>
        </div>
      </form>
    </div>
  );
}

export default Register;