import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ItemRegister() {
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({
    item_name: '',
    item_price: '',
    item_stock: '',
    item_description: '',
    image_url: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const params = new URLSearchParams();
      Object.keys(itemData).forEach(key => {
        params.append(key, itemData[key]);
      });

      console.log('등록할 데이터:', Object.fromEntries(params));

      const response = await axios.post(
        'http://localhost:8080/mvc/stuff/item/register',
        params,
        {
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
      console.error('물건 등록 실패:', error);
      alert('물건 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="item-register">
      <h2>물건 등록</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>이미지 URL</label>
          <input
            type="text"
            name="image_url"
            value={itemData.image_url}
            onChange={(e) => setItemData({...itemData, image_url: e.target.value})}
            placeholder="이미지 URL을 입력하세요"
          />
          {itemData.image_url && (
            <div className="image-preview">
              <img 
                src={itemData.image_url} 
                alt="미리보기" 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x200';
                }}
              />
            </div>
          )}
        </div>
        <div className="form-group">
          <label>물건 이름</label>
          <input
            type="text"
            name="item_name"
            value={itemData.item_name}
            onChange={(e) => setItemData({...itemData, item_name: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>가격</label>
          <input
            type="number"
            name="item_price"
            value={itemData.item_price}
            onChange={(e) => setItemData({...itemData, item_price: e.target.value})}
            required
            min="0"
          />
        </div>
        <div className="form-group">
          <label>재고</label>
          <input
            type="number"
            name="item_stock"
            value={itemData.item_stock}
            onChange={(e) => setItemData({...itemData, item_stock: e.target.value})}
            required
            min="0"
          />
        </div>
        <div className="form-group">
          <label>설명</label>
          <textarea
            name="item_description"
            value={itemData.item_description}
            onChange={(e) => setItemData({...itemData, item_description: e.target.value})}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit">등록</button>
          <button type="button" onClick={() => navigate('/stuff/item/list')}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default ItemRegister;