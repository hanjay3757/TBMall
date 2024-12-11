import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ItemRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    price: '',
    stock: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // FormData 객체 생성
      const params = new URLSearchParams();
      Object.keys(formData).forEach(key => {
        params.append(key, formData[key]);
      });

      const response = await axios.post('http://localhost:8080/mvc/stuff/item/register', 
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
        throw new Error(response.data.message || '물건 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('물건 등록 실패:', error);
      alert(error.response?.data?.message || '물건 등록에 실패했습니다.');
    }
  };

  return (
    <div className="register-form-container">
      <h2>물건 등록</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>상품명</label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            required
            minLength="2"
          />
        </div>
        
        <div className="form-group">
          <label>가격</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="100"
          />
        </div>
        
        <div className="form-group">
          <label>재고</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label>설명</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
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

export default ItemRegister;