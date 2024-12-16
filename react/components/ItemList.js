import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ItemList({ onAddToCart, isLoggedIn, isAdmin }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await axios.get('http://localhost:8080/mvc/stuff/item/list', {
        withCredentials: true
      });
      
      const activeItems = response.data.filter(item => 
        !item.item_delete && 
        (!item.member_delete || item.member_delete === 0)
      );
      
      setItems(activeItems);
      
      const initialQuantities = {};
      activeItems.forEach(item => {
        initialQuantities[item.item_id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('물건 목록 로딩 실패:', error);
    }
  };

  const handleDelete = async (item_id) => {
    try {
      if (!isAdmin) {
        alert('관리자 권한이 필요합니다.');
        return;
      }

      if (window.confirm('이 물건을 삭제하시겠습니까?')) {
        const params = new URLSearchParams();
        params.append('itemId', item_id);
        
        const response = await axios.post(
          'http://localhost:8080/mvc/stuff/item/delete', 
          params,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        if (response.data.success) {
          alert('물건이 삭제되었습니다.');
          loadItems();
        } else {
          alert(response.data.message || '삭제에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('물건 삭제 실패:', error);
      alert('물건 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleQuantityChange = (itemId, value) => {
    const item = items.find(item => item.item_id === itemId);
    if (!item) return;

    const newQuantity = Math.max(1, Math.min(value, item.item_stock));
    setQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  return (
    <div className="item-list">
      <h2>물건 목록</h2>
      <div className="items-container">
        {items.map(item => (
          <div key={item.item_id} className="item-card">
            <h3>{item.item_name}</h3>
            <p>가격: {item.item_price}원</p>
            <p>재고: {item.item_stock}개</p>
            <p>{item.item_description}</p>
            
            {isAdmin && (
              <div className="admin-controls">
                <button 
                  onClick={() => navigate(`/stuff/item/edit?itemId=${item.item_id}`)}
                  className="edit-button"
                >
                  수정
                </button>
                <button 
                  onClick={() => handleDelete(item.item_id)}
                  className="delete-button"
                >
                  삭제
                </button>
              </div>
            )}

            {isLoggedIn && item.item_stock > 0 && (
              <div className="cart-controls">
                <input
                  type="number"
                  min="1"
                  max={item.item_stock}
                  value={quantities[item.item_id]}
                  onChange={(e) => handleQuantityChange(item.item_id, parseInt(e.target.value))}
                  aria-label={`${item.item_name} 수량`}
                />
                <button 
                  onClick={() => onAddToCart(item.item_id, quantities[item.item_id])}
                  disabled={item.item_stock === 0}
                  className="add-to-cart-button"
                >
                  장바구니에 추가
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItemList;
