import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function StaffEdit() {
  const { bno } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: ''
  });

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await fetch(`/api/staff/${bno}`);
        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error('직원 정보를 가져오는데 실패했습니다:', error);
      }
    };

    fetchStaffData();
  }, [bno]);

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
      const response = await fetch(`/api/staff/${bno}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('직원 정보가 성공적으로 수정되었습니다.');
      } else {
        alert('직원 정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('직원 정보 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="edit-form">
      <h2>직원 정보 수정</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">이름:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">전화번호:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="department">부서:</label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          />
        </div>

        <div className="button-group">
          <button type="submit">수정</button>
          <button type="button" onClick={() => window.history.back()}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default StaffEdit;