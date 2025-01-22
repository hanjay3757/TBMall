import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Cart() {
  // 장바구니 아이템 목록 상태
  const [cartItems, setCartItems] = useState([]);
  // 로딩 상태, 초기에는 true로 설정되어 로딩 중임을 표시
  const [loading, setLoading] = useState(true);
  // 각 아이템 카드의 회전 값 상태 (마우스 움직임에 따른 회전)
  const [rotations, setRotations] = useState({});
  // 각 카드 엘리먼트를 참조할 수 있는 ref
  const cardRefs = useRef({});

  // 컴포넌트가 마운트될 때 한 번만 장바구니 아이템을 불러오는 useEffect
  useEffect(() => {
    loadCartItems();  // 장바구니 아이템을 불러오는 함수 호출
  }, []);

  // 장바구니 아이템을 API에서 불러오는 함수
  const loadCartItems = async () => {
    try {
      // API 호출로 장바구니 데이터 요청
      const response = await axios.get('/stuff/api/cart', {
        withCredentials: true // 쿠키 인증을 포함한 요청
      });
      console.log('장바구니 데이터:', response.data);
      
      // 각 아이템 정보를 콘솔에 출력 (디버깅용)
      response.data.forEach(item => {
        console.log('아이템 정보:', {
          cartId: item.cartId,
          itemName: item.itemName,
          imageUrl: item.imageUrl
        });
      });

      // 장바구니 아이템 목록 상태 업데이트
      setCartItems(response.data);
      setLoading(false); // 로딩 상태를 false로 변경
    } catch (error) {
      // 요청 실패 시 에러 처리
      console.error('장바구니 로딩 실패:', error);
      setLoading(false);
    }
  };

  // 장바구니에서 아이템을 삭제하는 함수
  const handleRemoveItem = async (cartId) => {
    try {
      // DELETE 요청을 보내 아이템 삭제
      const response = await axios.delete(
        `/stuff/api/cart/${cartId}`,
        { withCredentials: true }
      );

      // 삭제가 성공하면 장바구니 데이터를 새로 불러옴
      if (response.data.status === 'success') {
        loadCartItems();
      }
    } catch (error) {
      // 삭제 실패 시 에러 처리
      alert('장바구니 아이템 삭제에 실패했습니다.');
    }
  };

  // 장바구니 아이템 수량을 업데이트하는 함수
  const handleUpdateQuantity = async (cart_id, newQuantity) => {
    try {
      // PATCH 요청으로 수량 업데이트
      const response = await axios.patch(
        `/stuff/api/cart/${cart_id}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );
      
      // 수량 업데이트가 성공하면 장바구니 데이터를 새로 불러옴
      if (response.data.status === 'success') {
        loadCartItems();
      }
    } catch (error) {
      // 수량 업데이트 실패 시 에러 처리
      console.error('수량 업데이트 실패:', error);
      alert('재고가 부족합니다.');
    }
  };

  // 결제 버튼을 클릭했을 때 주문을 처리하는 함수
  const handleCheckout = async () => {
    try {
      // 주문 데이터를 장바구니 아이템에서 생성
      const orderData = cartItems.map(item => ({
        item_id: item.itemId,
        order_quantity: item.quantity,
      }));

      // POST 요청으로 주문 처리
      const response = await axios.post(
        '/stuff/api/cart/checkout',
        { orders: orderData },
        { withCredentials: true }
      );

      // 주문이 성공하면 알림을 띄우고 장바구니를 비움
      if (response.data.status === 'success') {
        alert('주문이 완료되었습니다.');
        setCartItems([]);  // 장바구니 아이템 비우기
      }
    } catch (error) {
      // 주문 처리 실패 시 에러 처리
      console.error('주문 처리 실패:', error);
      alert(error.response?.data?.message || '주문 처리 중 오류가 발생했습니다.');
    }
  };

  // 마우스가 아이템 카드 위에서 움직일 때 회전 효과를 처리하는 함수
  const handleMouseMove = (cartId, e) => {
    if (!cardRefs.current[cartId]) return; // 카드 요소가 없으면 종료

    const card = cardRefs.current[cartId];
    const rect = card.getBoundingClientRect(); // 카드 위치 및 크기 정보
    const x = e.clientX - rect.left;  // 마우스 X 좌표 (카드 내 상대 좌표)
    const y = e.clientY - rect.top;   // 마우스 Y 좌표 (카드 내 상대 좌표)

    const centerX = rect.width / 2;   // 카드 중심 X 좌표
    const centerY = rect.height / 2;  // 카드 중심 Y 좌표

    // 카드 회전값 계산 (마우스 위치에 따라 X, Y 회전)
    const rotateX = -((y - centerY) / 10) * 0.5;
    const rotateY = ((x - centerX) / 10) * 0.5;

    // 회전 값을 상태로 업데이트
    setRotations(prev => ({
      ...prev,
      [cartId]: { x: rotateX, y: rotateY }
    }));
  };

  // 마우스가 카드 영역을 벗어날 때 회전값을 초기화하는 함수
  const handleMouseLeave = (cartId) => {
    // 회전값을 초기화
    setRotations(prev => ({
      ...prev,
      [cartId]: { x: 0, y: 0 }
    }));
  };

  // 로딩 중이면 "로딩 중..." 메시지를 표시
  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="cart">
      <h2>장바구니</h2>
      {/* 장바구니에 아이템이 없을 경우 */}
      {cartItems.length === 0 ? (
        <p>장바구니가 비어있습니다.</p>
      ) : (
        <>
          {/* 장바구니 아이템 목록 */}
          <div className="items-container">
            {cartItems.map(item => (
              <div
                key={item.cartId}
                ref={el => cardRefs.current[item.cartId] = el}  // 해당 아이템 카드 참조
                className="item-card"
                onMouseMove={(e) => handleMouseMove(item.cartId, e)} // 마우스 이동 시 회전 적용
                onMouseLeave={() => handleMouseLeave(item.cartId)}  // 마우스가 카드 밖으로 나가면 회전 초기화
                style={{
                  // 회전 효과를 적용하는 스타일
                  transform: `perspective(1000px)
                    rotateX(${rotations[item.cartId]?.x || 0}deg)
                    rotateY(${rotations[item.cartId]?.y || 0}deg)
                    translateZ(10px)`,
                  transition: 'transform 0.2s ease'  // 변환에 애니메이션 적용
                }}
              >
                <div className="item-image">
                  {/* 아이템 이미지 표시, 이미지가 없으면 기본 이미지 */}
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl}
                      alt={item.itemName}
                      onError={(e) => {
                        // 이미지 로딩 실패 시 기본 이미지로 대체
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
                  {/* tolocalestring() =###,###같이 3자리마다 , 국가 형식에 맞게 변화해서 기호 붙이는거 */}
                  <div className="quantity-controls">
                    {/* 수량을 변경하는 입력 */}
                    <input
                      type="number"
                      min="1"
                      max={item.itemStock + item.quantity}
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item.cartId, parseInt(e.target.value))}
                      className="quantity-input"
                    />
                    {/* 삭제 버튼 */}
                    <button 
                      onClick={() => handleRemoveItem(item.cartId)}
                      className="delete-button"
                    >
                      삭제
                    </button>
                  </div>
                  {/* 총 가격 계산 */}
                  <p className="total-price">
                    총 가격: {(item.itemPrice * item.quantity).toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 장바구니 결제 금액 표시 및 주문하기 버튼 */}
          <div className="cart-summary">
            <div className="cart-total">
              <h3>
                총 결제 금액: {cartItems.reduce((total, item) => 
                  total + (item.itemPrice * item.quantity), 0).toLocaleString()}원
              </h3>
              {/* 주문하기 버튼 */}
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
