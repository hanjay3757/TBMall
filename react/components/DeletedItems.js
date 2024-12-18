import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DeletedItems() {
  const [deletedItems, setDeletedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const loadDeletedItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/mvc/stuff/item/deleted');
      console.log('삭제된 아이템 응답:', response.data); // 데이터 구조 확인용
      
      // 응답 데이터가 배열인지 확인하고 처리
      const items = Array.isArray(response.data) ? response.data : [];
      setDeletedItems(items);
      setError(null);
    } catch (error) {
      console.error('삭제된 물건 목록 로딩 실패:', error);
      setError('삭제된 물건 목록을 불러오는데 실패했습니다.');
      setDeletedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (itemId) => {
    try {
      const response = await axios.post(`http://localhost:8080/mvc/stuff/item/restore/${itemId}`);
      if (response.data.success) {
        alert('물건이 복구되었습니다.');
        loadDeletedItems(); // 목록 새로고침
      } else {
        alert(response.data.message || '복구에 실패했습니다.');
      }
    } catch (error) {
      console.error('물건 복구 실패:', error);
      alert('물건 복구 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="deleted-items">
      <div className="deleted-items-header">
        <h2>삭제된 물건 목록</h2>
        <button onClick={() => navigate('/stuff/item/list')} className="back-button">
          물건 목록으로 돌아가기
        </button>
      </div>

      {deletedItems.length === 0 ? (
        <p>삭제된 물건이 없습니다.</p>
      ) : (
        <div className="items-container">
          {deletedItems.map(item => (
            <div key={item.item_id} className="item-card">
              <h3>{item.item_name}</h3>
              <p>가격: {item.item_price?.toLocaleString()}원</p>
              <p>재고: {item.item_stock}개</p>
              <p>{item.item_description}</p>
              <p>삭제일: {new Date(item.delete_date).toLocaleDateString()}</p>
              <button 
                onClick={() => handleRestore(item.item_id)}
                className="restore-button"
              >
                복구하기
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DeletedItems;