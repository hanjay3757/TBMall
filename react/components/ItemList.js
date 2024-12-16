import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ItemList({ onAddToCart, isLoggedIn }) {
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await axios.get('http://localhost:8080/mvc/stuff/item/list');
      setItems(response.data);
      // 각 아이템의 수량을 1로 초기화
      const initialQuantities = {};
      response.data.forEach(item => {
        initialQuantities[item.item_id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('물건 목록 로딩 실패:', error);
    }
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, Math.min(value, items.find(item => item.item_id === itemId).item_stock))
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
            {isLoggedIn && item.item_stock > 0 && (
              <div className="cart-controls">
                <input
                  type="number"
                  min="1"
                  max={item.item_stock}
                  value={quantities[item.item_id]}
                  onChange={(e) => handleQuantityChange(item.item_id, parseInt(e.target.value))}
                />
                <button 
                  onClick={() => onAddToCart(item.item_id, quantities[item.item_id])}
                  disabled={item.item_stock === 0}
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
