import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const response = await axios.get('http://localhost:8080/mvc/cart/items');
      setCartItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('장바구니 로딩 실패:', error);
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      const response = await axios.post(`http://localhost:8080/mvc/cart/remove/${cartItemId}`);
      if (response.data.success) {
        loadCartItems();
      }
    } catch (error) {
      console.error('장바구니 아이템 삭제 실패:', error);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    try {
      const params = new URLSearchParams();
      params.append('quantity', newQuantity);
      
      const response = await axios.post(`http://localhost:8080/mvc/cart/update/${cartItemId}`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (response.data.success) {
        loadCartItems();
      }
    } catch (error) {
      console.error('수량 업데이트 실패:', error);
      if (error.response && error.response.status === 400) {
        alert('재고가 부족합니다.');
      }
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="cart">
      <h2>장바구니</h2>
      {cartItems.length === 0 ? (
        <p>장바구니가 비어있습니다.</p>
      ) : (
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.cart_item_id} className="cart-item">
              <h3>{item.item_name}</h3>
              <p>가격: {item.item_price}원</p>
              <div className="quantity-controls">
                <input
                  type="number"
                  min="1"
                  max={item.item_stock + item.quantity}
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(item.cart_item_id, parseInt(e.target.value))}
                />
                <button onClick={() => handleRemoveItem(item.cart_item_id)}>
                  삭제
                </button>
              </div>
              <p>총 가격: {item.item_price * item.quantity}원</p>
            </div>
          ))}
          <div className="cart-total">
            <h3>총 결제 금액: {cartItems.reduce((total, item) => total + (item.item_price * item.quantity), 0)}원</h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;