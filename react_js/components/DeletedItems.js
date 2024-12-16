import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DeletedItems() {
  const [deletedItems, setDeletedItems] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const loadDeletedItems = async () => {
    try {
      const response = await axios.get('http://localhost:8080/mvc/stuff/item/deleted', {
        withCredentials: true
      });

      if (response.data.success) {
        setDeletedItems(response.data.data || []);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('삭제된 물건 목록 로딩 실패:', error);
      setError(error.response?.data?.message || '삭제된 물건 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleRestore = async (itemId) => {
    try {
      const params = new URLSearchParams();
      params.append('itemId', itemId);

      const response = await axios.post(
        'http://localhost:8080/mvc/stuff/item/restore',
        params,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.success) {
        alert('물건이 복구되었습니다.');
        loadDeletedItems();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('물건 복구 실패:', error);
      alert(error.response?.data?.message || '물건 복구에 실패했습니다.');
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="deleted-items">
      <h2>삭제된 물건 목록</h2>
      {deletedItems.length === 0 ? (
        <p>삭제된 물건이 없습니다.</p>
      ) : (
        <div className="items-container">
          {deletedItems.map(item => (
            <div key={item.item_id} className="item-card">
              <h3>{item.item_name}</h3>
              <p>가격: {item.item_price}원</p>
              <p>재고: {item.item_stock}개</p>
              <p>{item.item_description}</p>
              <p>삭제일: {new Date(item.delete_date).toLocaleDateString()}</p>
              <button 
                onClick={() => handleRestore(item.item_id)}
                className="restore-button"
              >
                복구
              </button>
            </div>
          ))}
        </div>
      )}
      <button 
        onClick={() => navigate('/stuff/item/list')}
        className="back-button"
      >
        목록으로 돌아가기
      </button>
    </div>
  );
}

export default DeletedItems;