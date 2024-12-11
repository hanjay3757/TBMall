import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  // 데이터 불러오기
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await fetch('http://localhost:8080/mvc/stuff/cart/list', {
          credentials: 'include'
        });
        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        console.error('장바구니 데이터 조회 실패:', error);
      }
    };

    fetchCartData();
  }, []);

  // 장바구니 아이템 삭제
  const removeItem = async (cartId) => {
    try {
      await fetch(`http://localhost:8080/mvc/stuff/cart/${cartId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      setCartItems(cartItems.filter(item => item.cartId !== cartId));
    } catch (error) {
      console.error('장바구니 아이템 삭제 실패:', error);
    }
  };

  // 수량 업데이트
  const updateQuantity = async (cartId, newQuantity) => {
    try {
      await fetch(`http://localhost:8080/mvc/stuff/cart/${cartId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity })
      });
      setCartItems(cartItems.map(item => 
        item.cartId === cartId ? {...item, quantity: newQuantity} : item
      ));
    } catch (error) {
      console.error('수량 업데이트 실패:', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    try {
      await fetch('http://localhost:8080/mvc/stuff/cart/checkout', {
        method: 'POST',
        credentials: 'include'
      });
      setCartItems([]); // 장바구니 비우기
      alert('주문이 완료되었습니다.');
    } catch (error) {
      console.error('주문 처리 실패:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>장바구니</h2>
        <button 
          onClick={() => navigate('/stuff/item/list')} 
          className="back-button"
        >
          상품 목록으로 돌아가기
        </button>
      </div>
      {cartItems.length === 0 ? (
        <p>장바구니가 비어있습니다.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.cartId} className="cart-item">
                <h3>{item.itemName}</h3>
                <p>가격: {item.price.toLocaleString()}원</p>
                <input 
                  type="number" 
                  min="1" 
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.cartId, parseInt(e.target.value))}
                />
                <button onClick={() => removeItem(item.cartId)}>삭제</button>
              </div>
            ))}
          </div>
          <div className="cart-total">
            <h3>총 금액: {calculateTotal().toLocaleString()}원</h3>
            <button onClick={handleCheckout}>주문하기</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;