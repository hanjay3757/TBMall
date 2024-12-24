// src/components/RegisterItem.js
import React, { useState } from 'react';

function RegisterItem() {
  const [formData, setFormData] = useState({
    itemName: '',
    price: '',
    stock: ''
  });

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
      const response = await fetch('http://localhost:8080/mvc/stuff/item/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('물건이 성공적으로 등록되었습니다.');
        setFormData({
          itemName: '',
          price: '', 
          stock: ''
        });
      } else {
        alert('물건 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('물건 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="register-form">
      <h2>물건 등록</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="itemName">물건 이름:</label>
          <input
            type="text"
            id="itemName"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">가격:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="stock">재고:</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />
        </div>

        <div className="button-group">
          <button type="submit">등록</button>
          <button type="button" onClick={() => window.history.back()}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default RegisterItem;