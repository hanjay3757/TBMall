import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ItemList() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8080/mvc/stuff/item/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('서버 응답이 실패했습니다');
      }
      
      const data = await response.json();
      setItems(data.filter(item => item.stock > 0 && !item.deleted));
      setError(null);
    } catch (error) {
      console.error('물건 목록을 가져오는데 실패했습니다:', error);
      setError('물건 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8080/mvc/staff/check-login');
        if (mounted) {
          setIsLoggedIn(response.data.isLoggedIn);
        }
      } catch (error) {
        console.error('로그인 상태 확인 실패:', error);
      }
    };

    checkLoginStatus();
    fetchItems();

    return () => {
      mounted = false;
    };
  }, []);

  const handleAddToCart = async (item) => {
    try {
      const response = await axios.post('http://localhost:8080/mvc/stuff/cart/add', {
        itemId: item.itemId,
        quantity: 1
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        alert(response.data.message);
        fetchItems();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
      alert(error.response?.data?.message || error.message || '장바구니에 추가하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="item-list-container">
      <h2>물건 목록</h2>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="item-grid">
          {items.map((item, index) => (
            <div key={item.itemId || index} className="item-card">
              <h3>{item.itemName}</h3>
              <p>{item.price.toLocaleString()}원</p>
              <p>재고: {item.stock}개</p>
              {isLoggedIn && (
                <button onClick={() => handleAddToCart(item)}>장바구니에 담기</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ItemList;