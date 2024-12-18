import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

function ItemEdit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get('itemId');
  
  const [item, setItem] = useState({
    item_name: '',
    item_price: '',
    item_stock: '',
    item_description: ''
  });

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/mvc/stuff/item/${itemId}`, {
        withCredentials: true
      });
      setItem(response.data);
    } catch (error) {
      console.error('상품 정보 로딩 실패:', error);
      alert('상품 정보를 불러오는데 실패했습니다.');
      navigate('/stuff/item/list');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('itemId', itemId);
      formData.append('itemName', item.item_name);
      formData.append('itemPrice', item.item_price);
      formData.append('itemStock', item.item_stock);
      formData.append('itemDescription', item.item_description);

      const response = await axios.post(
        'http://localhost:8080/mvc/stuff/item/edit',
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert('상품이 수정되었습니다.');
        navigate('/stuff/item/list');
      } else {
        alert(response.data.message || '수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 수정 실패:', error);
      alert('상품 수정 중 오류가 발생했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="edit-form-container">
      <h2>상품 수정</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>상품명</label>
          <input
            type="text"
            name="item_name"
            value={item.item_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>가격</label>
          <input
            type="number"
            name="item_price"
            value={item.item_price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>재고</label>
          <input
            type="number"
            name="item_stock"
            value={item.item_stock}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>설명</label>
          <textarea
            name="item_description"
            value={item.item_description}
            onChange={handleChange}
          />
        </div>
        <div className="button-group">
          <button type="submit">수정</button>
          <button type="button" onClick={() => navigate('/stuff/item/list')}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default ItemEdit; 