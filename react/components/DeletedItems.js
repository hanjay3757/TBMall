import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DeletedItems() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeletedItems = async () => {
      try {
        const response = await axios.get('http://localhost:8080/mvc/stuff/item/deleted', {
          withCredentials: true
        });
        if (response.data && response.data.items) {
          setItems(response.data.items);
        } else if (Array.isArray(response.data)) {
          setItems(response.data);
        } else {
          setItems([]);
          console.error('서버 응답이 예상된 형식이 아닙니다:', response.data);
        }
      } catch (error) {
        console.error('삭제된 물건 목록 조회 실패:', error);
        setError('삭제된 물건 목록을 불러오는데 실패했습니다.');
        setItems([]);
      }
    };

    fetchDeletedItems();
  }, []);

  const handleRestore = async (itemId) => {
    try {
      const params = new URLSearchParams();
      params.append('itemId', itemId);
      
      await axios.post(`http://localhost:8080/mvc/stuff/item/restore`, params, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const response = await axios.get('http://localhost:8080/mvc/stuff/item/deleted', {
        withCredentials: true
      });
      if (Array.isArray(response.data)) {
        setItems(response.data);
      } else if (response.data && response.data.items) {
        setItems(response.data.items);
      }
      
      alert('물건이 복구되었습니다.');
    } catch (error) {
      console.error('물건 복구 실패:', error);
      alert(error.response?.data?.message || '물건 복구에 실패했습니다.');
    }
  };

  return (
    <div className="deleted-items-container">
      <h2>삭제된 물건 목록</h2>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="item-grid">
          {Array.isArray(items) && items.length > 0 ? (
            items.map(item => (
              <div key={item.itemId} className="item-card">
                <h3>{item.itemName}</h3>
                <p>{item.price?.toLocaleString()}원</p>
                <p>재고: {item.stock}개</p>
                <button onClick={() => handleRestore(item.itemId)}>복구</button>
              </div>
            ))
          ) : (
            <p>삭제된 물건이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default DeletedItems;