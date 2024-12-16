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
      const response = await axios.get('http://localhost:8080/mvc/stuff/cart/list');
      setCartItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('장바구니 로딩 실패:', error);
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartId) => {
    try {
      const response = await axios.delete(`http://localhost:8080/mvc/stuff/cart/${cartId}`);
      if (response.status === 200) {
        loadCartItems();
      }
    } catch (error) {
      console.error('장바구니 아이템 삭제 실패:', error);
    }
  };

  const handleUpdateQuantity = async (cartId, newQuantity) => {
    try {
      const response = await axios.patch(`http://localhost:8080/mvc/stuff/cart/${cartId}`, {
        quantity: newQuantity
      });
      
      if (response.status === 200) {
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
            <div key={item.cartId} className="cart-item">
              <h3>{item.itemName}</h3>
              <p>가격: {item.itemPrice}원</p>
              <div className="quantity-controls">
                <input
                  type="number"
                  min="1"
                  max={item.itemStock + item.quantity}
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(item.cartId, parseInt(e.target.value))}
                />
                <button onClick={() => handleRemoveItem(item.cartId)}>
                  삭제
                </button>
              </div>
              <p>총 가격: {item.itemPrice * item.quantity}원</p>
            </div>
          ))}
          <div className="cart-total">
            <h3>총 결제 금액: {cartItems.reduce((total, item) => total + (item.itemPrice * item.quantity), 0)}원</h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;