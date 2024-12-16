// src/components/RegisterItem.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterItem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    item_name: '',
    item_price: '',
    item_stock: '',
    item_description: '',
    admin_no: null
  });

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await axios.get('http://localhost:8080/mvc/staff/check-login', {
          withCredentials: true
        });
        
        if (!response.data.isLoggedIn || !response.data.isAdmin) {
          alert('관리자만 접근할 수 있습니다.');
          navigate('/');
          return;
        }

        setFormData(prev => ({
          ...prev,
          admin_no: response.data.admin_no
        }));
      } catch (error) {
        console.error('관리자 정보 조회 실패:', error);
        navigate('/');
      }
    };

    fetchAdminInfo();
  }, [navigate]);

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
      if (!formData.admin_no) {
        alert('관리자 권한이 필요합니다.');
        return;
      }

      const params = new URLSearchParams();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          params.append(key, formData[key]);
        }
      });

      const response = await axios.post(
        'http://localhost:8080/mvc/stuff/item/register',
        params,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.success) {
        alert('물건이 등록되었습니다.');
        navigate('/stuff/item/list');
      } else {
        alert(response.data.message || '물건 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || '물건 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="register-form">
      <h2>물건 등록</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="item_name">물건 이름:</label>
          <input
            type="text"
            id="item_name"
            name="item_name"
            value={formData.item_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="item_price">가격:</label>
          <input
            type="number"
            id="item_price"
            name="item_price"
            value={formData.item_price}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="item_stock">재고:</label>
          <input
            type="number"
            id="item_stock"
            name="item_stock"
            value={formData.item_stock}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="item_description">설명:</label>
          <textarea
            id="item_description"
            name="item_description"
            value={formData.item_description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="button-group">
          <button type="submit">등록</button>
          <button type="button" onClick={() => navigate('/stuff/item/list')}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default RegisterItem;