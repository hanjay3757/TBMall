import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ItemRegister() {
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({
    item_name: '',
    item_price: '',
    item_stock: '',
    item_description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const params = new URLSearchParams();
      Object.keys(itemData).forEach(key => {
        params.append(key, itemData[key]);
      });

      const response = await axios.post('http://localhost:8080/mvc/stuff/item/register', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        alert('물건이 등록되었습니다.');
        navigate('/stuff/item/list');
      } else {
        alert(response.data.message || '물건 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('물건 등록 실패:', error);
      alert('물건 등록 중 오류가 발생했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="item-register">
      <h2>물건 등록</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>물건 이름:</label>
          <input
            type="text"
            name="item_name"
            value={itemData.item_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>가격:</label>
          <input
            type="number"
            name="item_price"
            value={itemData.item_price}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
        <div>
          <label>재고:</label>
          <input
            type="number"
            name="item_stock"
            value={itemData.item_stock}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
        <div>
          <label>설명:</label>
          <textarea
            name="item_description"
            value={itemData.item_description}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">등록</button>
      </form>
    </div>
  );
}

export default ItemRegister;