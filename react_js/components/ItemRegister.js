import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ItemRegister.css';
import { SERVER_URL } from '../config';

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
      // 이미지 URL 처리
      let finalImageUrl = itemData.image_url;
      if (finalImageUrl && !finalImageUrl.startsWith('/upload/')) {
        // 외부 URL인 경우 그대로 저장
        console.log('저장할 이미지 URL:', finalImageUrl);
      }

      const params = new URLSearchParams();
      Object.keys(itemData).forEach(key => {
        if (key === 'image_url') {
          params.append(key, finalImageUrl); // 처리된 이미지 URL 저장
        } else {
          params.append(key, itemData[key]);
        }
      });

      console.log('등록할 데이터:', Object.fromEntries(params));

      const response = await axios.post(
        `${SERVER_URL}/mvc/stuff/item/register`,
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
    <div className="item-register-container">
      <h2>물건 등록</h2>
      <form onSubmit={handleSubmit} className="item-register-form">
        <div className="form-group">
          <label htmlFor="imageUrl">이미지 URL</label>
          <input
            type="text"
            id="imageUrl"
            placeholder="이미지 URL을 입력하세요"
            value={itemData.image_url}
            onChange={(e) => setItemData({...itemData, image_url: e.target.value})}
          />
          {/* 이미지 미리보기 */}
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
          <label htmlFor="itemName">물건 이름</label>
          <input
            type="text"
            id="itemName"
            placeholder="물건 이름을 입력하세요"
            value={itemData.item_name}
            onChange={(e) => setItemData({...itemData, item_name: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">가격</label>
          <input
            type="number"
            id="price"
            placeholder="가격을 입력하세요"
            value={itemData.item_price}
            onChange={(e) => setItemData({...itemData, item_price: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="stock">재고</label>
          <input
            type="number"
            id="stock"
            placeholder="재고를 입력하세요"
            value={itemData.item_stock}
            onChange={(e) => setItemData({...itemData, item_stock: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">설명</label>
          <textarea
            id="description"
            placeholder="물건 설명을 입력하세요"
            value={itemData.item_description}
            onChange={(e) => setItemData({...itemData, item_description: e.target.value})}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit" className="submit-button">등록</button>
          <button type="button" onClick={() => navigate(-1)} className="cancel-button">취소</button>
        </div>
      </form>
    </div>
  );
}

export default ItemRegister;