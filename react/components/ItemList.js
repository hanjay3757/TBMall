import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ItemList({ isLoggedIn, isAdmin }) {
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await axios.get('http://localhost:8080/mvc/stuff/item/list');
      console.log("리스폰스 데이터:", response.data);
      setItems(response.data);
      
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

  const handleAddToCart = async (itemId, quantity) => {
    try {
      const params = new URLSearchParams();
      params.append('itemId', itemId);
      params.append('quantity', quantity);

      const response = await axios.post(
        'http://localhost:8080/mvc/stuff/api/cart/add',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          withCredentials: true
        }
      );

      if (response.data === 'redirect:/stuff/cart' || response.status === 200) {
        alert('장바구니에 추가되었습니다.');
      } else {
        alert(response.data.message || '장바구니 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      if (error.response) {
        alert(error.response.data.message || '장바구니 추가 중 오류가 발생했습니다.');
      } else {
        alert('서버와의 통신 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDelete = async (itemId) => {
    console.log('itemId :', itemId);
    if (!itemId) {
      alert("삭제할 물건이 없습니다.")
      return;
    }
    if (window.confirm('이 물건을 삭제하시겠습니까?')) {
      try {
        const response = await axios.post(
          'http://localhost:8080/mvc/stuff/item/delete',
          null,
          {
            params: { item_id: itemId }
          }
        );
        
        console.log("response:", response);
        
        // 리다이렉트 응답 처리
        if (response.data === 'redirect:/stuff/item/list' || response.status === 200) {
          alert('물건이 삭제되었습니다.');
          loadItems(); // 목록 새로고침
        } else {
          alert('물건 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('물건 삭제 실패:', error);
        alert('물건 삭제 중 오류가 발생하였습니다.');
      }
    }
  };

  return (
    <div className="item-list">
      <h2>물건 목록</h2>
      <div className="items-container">
        {items.map(item => (
          <div key={item.item_id} className="item-card">
            <h3>{item.item_name}</h3>
            <p>가격: {item.item_price.toLocaleString()}원</p>
            <p>재고: {item.item_stock.toLocaleString()}개</p>
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
                  onClick={() => handleAddToCart(item.item_id, quantities[item.item_id])}
                  disabled={item.item_stock === 0}
                >
                  장바구니에 추가
                </button>
                {isAdmin && (
                  <button onClick={() => handleDelete(item.item_id)}>
                    물건 삭제
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItemList;
