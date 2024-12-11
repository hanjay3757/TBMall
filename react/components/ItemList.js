import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ItemList() {
  // 상태 정의
  const [items, setItems] = useState([]); // 물건 목록을 저장
  const [error, setError] = useState(null); // 오류 메시지
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [isLoading, setIsLoading] = useState(true); // 데이터 로딩 상태

  // 물건 목록을 불러오는 함수
  const fetchItems = async () => {
    try {
      setIsLoading(true); // 로딩 시작
      // API를 통해 물건 목록을 요청
      const response = await axios.get('http://localhost:8080/mvc/stuff/item/list', {
        headers: { 'Content-Type': 'application/json' },
      });

      // 삭제되지 않은 물건만 필터링 (재고 조건 제거)
      const data = response.data.filter(item => !item.deleted);
      setItems(data); // 물건 목록 상태 업데이트
      setError(null); // 오류 상태 초기화
    } catch (error) {
      console.error('물건 목록을 가져오는데 실패했습니다:', error);
      setError('물건 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.'); // 오류 메시지 설정
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  // 로그인 상태를 확인하는 함수
  const checkLoginStatus = async () => {
    try {
      // API를 통해 로그인 상태 확인
      const response = await axios.get('http://localhost:8080/mvc/staff/check-login');
      setIsLoggedIn(response.data.isLoggedIn); // 로그인 상태 업데이트
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
      setIsLoggedIn(false); // 오류 발생 시 로그인되지 않은 상태로 설정
    }
  };

  // 장바구니에 물건을 추가하는 함수
  const handleAddToCart = async (item) => {
    if (!isLoggedIn) {
      alert('장바구니에 담으려면 로그인이 필요합니다.');
      return;
    }

    try {
      // 장바구니에 추가 요청
      const response = await axios.post('http://localhost:8080/mvc/stuff/cart/add', {
        itemId: item.itemId, // 아이템 ID
        quantity: 1, // 수량 (여기서는 1로 고정)
      }, {
        withCredentials: true, // 쿠키를 포함한 요청
        headers: { 'Content-Type': 'application/json' }, // JSON 형식
      });

      // 성공 메시지 처리
      if (response.data.status === 'success') {
        alert(response.data.message); // 성공 메시지 알림
      } else {
        throw new Error(response.data.message); // 실패 시 오류 메시지
      }
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
      alert(error.response?.data?.message || error.message || '장바구니에 추가하는 중 오류가 발생했습니다.'); // 오류 메시지 알림
    }
  };

  // 컴포넌트가 마운트 될 때 실행되는 useEffect 훅
  useEffect(() => {
    checkLoginStatus(); // 로그인 상태 확인
    fetchItems(); // 물건 목록 불러오기
  }, []); // 빈 배열을 넣어 한번만 실행되도록 설정

  // 렌더링 시작
  return (
    <div className="item-list-container">
      <h2>물건 목록</h2>
      
      {/* 로딩 중일 때 */}
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        // 에러가 있을 경우 오류 메시지 출력
        <div className="error-message">{error}</div>
      ) : (
        // 물건 목록 출력
        <div className="item-grid">
          {items.map((item, index) => (
            <div key={item.itemId || index} className="item-card">
              <h3>{item.itemName}</h3>
              <p>{item.price?.toLocaleString()}원</p>
              <p>재고: {item.stock}개</p>
              
              {/* 장바구니 버튼 (로그인 상태에 따라 다른 스타일과 텍스트) */}
              <button 
                onClick={() => handleAddToCart(item)}
                className={!isLoggedIn ? 'disabled-button' : ''}
              >
                {isLoggedIn ? '장바구니에 담기' : '로그인 후 구매 가능'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ItemList;
