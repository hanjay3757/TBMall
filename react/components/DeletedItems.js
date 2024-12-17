import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DeletedItems() {
  const [deletedItems, setDeletedItems] = useState([]);

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const loadDeletedItems = async () => {
    try {
      const response = await axios.get('http://localhost:8080/mvc/stuff/item/deleted');
      setDeletedItems(response.data);
    } catch (error) {
      console.error('삭제된 물건 목록 로딩 실패:', error);
    }
  };

  const handleRestore = async (itemId) => {
    try {
      const response = await axios.post(`http://localhost:8080/mvc/stuff/item/restore/${itemId}`);
      if (response.data.success) {
        alert('물건이 복구되었습니다.');
        loadDeletedItems();
      }
    } catch (error) {
      console.error('물건 복구 실패:', error);
      alert('물건 복구 중 오류가 발생했습니다.');
    }
  };

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
              <button onClick={() => handleRestore(item.item_id)}>복구</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DeletedItems;