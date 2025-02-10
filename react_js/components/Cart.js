import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotations, setRotations] = useState({});
  const cardRefs = useRef({});

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stuff/api/cart`, {
        withCredentials: true
      });
      console.log('장바구니 데이터:', response.data);
      
      // 같은 itemName을 가진 아이템들을 그룹화
      const groupedItems = response.data.reduce((acc, item) => {
        if (!acc[item.itemName]) {
          acc[item.itemName] = {
            ...item,
            cartIds: [item.cartId],
            totalQuantity: item.quantity
          };
        } else {
          acc[item.itemName].cartIds.push(item.cartId);
          acc[item.itemName].totalQuantity += item.quantity;
        }
        return acc;
      }, {});

      setCartItems(Object.values(groupedItems));
      setLoading(false);
    } catch (error) {
      console.error('장바구니 로딩 실패:', error);
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartIds) => {
    try {
      for (const cartId of cartIds) {
        await axios.delete(
          `/stuff/api/cart/${cartId}`,
          { withCredentials: true }
        );
      }
      loadCartItems();
    } catch (error) {
      alert('장바구니 아이템 삭제에 실패했습니다.');
    }
  };

  const handleUpdateQuantity = async (cartIds, newQuantity) => {
    try {
      // 각 cartId에 대해 수량을 균등하게 분배
      const quantityPerItem = Math.floor(newQuantity / cartIds.length);
      const remainder = newQuantity % cartIds.length;
      
      for (let i = 0; i < cartIds.length; i++) {
        const quantity = i < remainder ? quantityPerItem + 1 : quantityPerItem;
        await axios.patch(
          `/stuff/api/cart/${cartIds[i]}`,
          { quantity },
          { withCredentials: true }
        );
      }
      loadCartItems();
    } catch (error) {
      console.error('수량 업데이트 실패:', error);
      alert('재고가 부족합니다.');
    }
  };

  const handleCheckout = async () => {
    try {
      const orderData = cartItems.flatMap(item => 
        item.cartIds.map(cartId => ({
          item_id: item.itemId,
          order_quantity: Math.floor(item.totalQuantity / item.cartIds.length)
        }))
      );

      const response = await axios.post(
        `/stuff/api/cart/checkout`,
        { orders: orderData },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        alert('주문이 완료되었습니다.');
        setCartItems([]);
      }
    } catch (error) {
      console.error('주문 처리 실패:', error);
      alert(error.response?.data?.message || '주문 처리 중 오류가 발생했습니다.');
    }
  };

  const handleMouseMove = (cartId, e) => {
    if (!cardRefs.current[cartId]) return;

    const card = cardRefs.current[cartId];
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / 10) * 0.5;
    const rotateY = ((x - centerX) / 10) * 0.5;

    setRotations(prev => ({
      ...prev,
      [cartId]: { x: rotateX, y: rotateY }
    }));
  };

  const handleMouseLeave = (cartId) => {
    setRotations(prev => ({
      ...prev,
      [cartId]: { x: 0, y: 0 }
    }));
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
        <>
          <div className="items-container">
            {cartItems.map(item => {
              if (!item?.cartIds?.length) return null;
              return (
                <div
                  key={item.cartIds[0]}
                  ref={el => cardRefs.current[item.cartIds[0]] = el}
                  className="item-card"
                  onMouseMove={(e) => handleMouseMove(item.cartIds[0], e)}
                  onMouseLeave={() => handleMouseLeave(item.cartIds[0])}
                  style={{
                    transform: `perspective(1000px)
                      rotateX(${rotations[item.cartIds[0]]?.x || 0}deg)
                      rotateY(${rotations[item.cartIds[0]]?.y || 0}deg)
                      translateZ(10px)`,
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <div className="item-image">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl}
                        alt={item.itemName}
                        onError={(e) => {
                          console.log('이미지 로딩 실패:', item.imageUrl);
                          e.target.src = 'https://via.placeholder.com/400x200';
                        }}
                      />
                    ) : (
                      <img 
                        src='https://via.placeholder.com/400x200'
                        alt="기본 이미지"
                      />
                    )}
                  </div>
                  <div className="item-content">
                    <h3>{item.itemName}</h3>
                    <p>가격: {item.itemPrice.toLocaleString()}원</p>
                    <div className="quantity-controls">
                      <input
                        type="number"
                        min="1"
                        max={item.itemStock + item.totalQuantity}
                        value={item.totalQuantity}
                        onChange={(e) => handleUpdateQuantity(item.cartIds, parseInt(e.target.value))}
                        className="quantity-input"
                      />
                      <button 
                        onClick={() => handleRemoveItem(item.cartIds)}
                        className="delete-button"
                      >
                        삭제
                      </button>
                    </div>
                    <p className="total-price">
                      총 가격: {(item.itemPrice * item.totalQuantity).toLocaleString()}원
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <div className="cart-total">
              <h3>
                총 결제 금액: {cartItems.reduce((total, item) => 
                  total + (item.itemPrice * item.totalQuantity), 0).toLocaleString()}원
              </h3>
              <button 
                onClick={handleCheckout}
                className="checkout-button"
              >
                주문하기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
