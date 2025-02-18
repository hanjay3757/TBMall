import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Cart({ setUserInfo, onOrderComplete }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotations, setRotations] = useState({});
  const cardRefs = useRef({});

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stuff/api/cart`, {}, {
        withCredentials: true
      });
      
      // 같은 item_id를 가진 아이템들의 수량을 합치기
      const mergedItems = response.data.reduce((acc, curr) => {
        const existingItem = acc.find(item => item.itemId === curr.itemId);
        if (existingItem) {
          existingItem.quantity += curr.quantity;
        } else {
          acc.push({...curr});
        }
        return acc;
      }, []);

      setCartItems(mergedItems);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartId) => {
    try {
      const response = await axios.delete(
        `/stuff/api/cart/${cartId}`,
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        loadCartItems();
      }
    } catch (error) {
      alert('장바구니 아이템 삭제에 실패했습니다.');
    }
  };

  const handleUpdateQuantity = async (cart_id, newQuantity) => {
    try {
      const response = await axios.patch(
        `/stuff/api/cart/${cart_id}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );
      
      if (response.data.status === 'success') {
        loadCartItems();
      }
    } catch (error) {
      alert('재고가 부족합니다.');
    }
  };

  const handleCheckout = async () => {
    try {
      if (cartItems.length === 0) {
        alert('장바구니가 비어있습니다.');
        return;
      }

      const memberNo = cartItems[0]?.memberNo;
      if (!memberNo) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 총 결제 금액 계산
      const totalAmount = cartItems.reduce((total, item) => 
        total + (item.itemPrice * item.quantity), 0
      );

      // 현재 보유 포인트 확인
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) {
        alert('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      const currentUserInfo = JSON.parse(userInfoStr);
      const currentPoints = currentUserInfo.points || 0;

      // 포인트 부족 체크
      if (currentPoints < totalAmount) {
        alert(`포인트가 부족합니다.\n보유 포인트: ${currentPoints.toLocaleString()}P\n필요 포인트: ${totalAmount.toLocaleString()}P`);
        return;
      }

      const requestData = {
        itemIds: cartItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity
        })),
        member_no: memberNo
      };

      const response = await axios.post(
        `${API_BASE_URL}/stuff/api/cart/checkout`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.status === 'success') {
        // 장바구니 비우기
        await Promise.all(cartItems.map(item => 
          axios.delete(`${API_BASE_URL}/stuff/api/cart/${item.cartId}`, {
            withCredentials: true
          })
        ));

        // 현재 userInfo 가져오기
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          const currentUserInfo = JSON.parse(userInfoStr);
          
          // 포인트 차감하여 업데이트
          const updatedUserInfo = {
            ...currentUserInfo,
            points: currentUserInfo.points - totalAmount
          };

          // localStorage 업데이트
          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
          
          // Header의 userInfo 상태 업데이트
          setUserInfo(updatedUserInfo);
        }

        alert('주문이 완료되었습니다.');
        setCartItems([]);
        
        // ItemList 새로고침
        if (onOrderComplete) {
          onOrderComplete();
        }
      }
    } catch (error) {
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
            {cartItems.map(item => (
              <div
                key={item.cartId}
                ref={el => cardRefs.current[item.cartId] = el}
                className="item-card"
                onMouseMove={(e) => handleMouseMove(item.cartId, e)}
                onMouseLeave={() => handleMouseLeave(item.cartId)}
                style={{
                  transform: `perspective(1000px)
                    rotateX(${rotations[item.cartId]?.x || 0}deg)
                    rotateY(${rotations[item.cartId]?.y || 0}deg)
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
                      max={item.itemStock + item.quantity}
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item.cartId, parseInt(e.target.value))}
                      className="quantity-input"
                    />
                    <button 
                      onClick={() => handleRemoveItem(item.cartId)}
                      className="delete-button"
                    >
                      삭제
                    </button>
                  </div>
                  <p className="total-price">
                    총 가격: {(item.itemPrice * item.quantity).toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-total">
              <h3>
                총 결제 금액: {cartItems.reduce((total, item) => 
                  total + (item.itemPrice * item.quantity), 0).toLocaleString()}원
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
