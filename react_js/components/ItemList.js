import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function ItemList({ isLoggedIn, isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rotations, setRotations] = useState({});
  const cardRefs = useRef({});

  useEffect(() => {
    loadItems();
  }, [refreshKey]);

  useEffect(() => {
    if (location.state?.refresh) {
      loadItems();
    }
  }, [location]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/stuff/item/list', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const itemsToProcess = response.data;
      console.log('서버에서 받은 아이템 데이터:', itemsToProcess);

      // 재고가 0인 아이템은 장바구니에 있는지 확인 후 삭제 처리
      for (const item of itemsToProcess) {
        if (item.item_stock === 0 && !item.item_delete) {
          try {
            // GET 메서드로 장바구니 조회
            const cartResponse = await axios.get('/stuff/api/cart', {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            if (cartResponse.data && Array.isArray(cartResponse.data)) {
              const isInCart = cartResponse.data.some(cartItem => cartItem.itemId === item.item_id);
              
              if (!isInCart) {
                const params = new URLSearchParams();
                params.append('item_id', item.item_id);
                
                await axios.post('/stuff/item/delete', params, {
                  withCredentials: true,
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  }
                });
              }
            }
          } catch (error) {
            console.error('아이템 처리 중 오류:', error);
          }
        }
      }
      
      // 중복 제거 및 활성 아이템 필터링
      const uniqueItems = Array.from(new Map(
        itemsToProcess.map(item => [item.item_id, item])
      ).values());

      // 활성 아이템 필터링 - 삭제되지 않고 재고가 있는 아이템만 표시
      const activeItems = uniqueItems.filter(item => {
        // 삭제되지 않고 재고가 있는 아이템만 표시
        return !item.item_delete && item.item_stock > 0;
      });

      setItems(activeItems);
      
      const initialQuantities = {};
      activeItems.forEach(item => {
        initialQuantities[item.item_id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('아이템 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshList = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleDelete = async (item_id) => {
    try {
      if (!isAdmin) {
        alert('관리자 권한이 필요합니다.');
        return;
      }
      if(!item_id){
        alert("삭제할 물건이 없습니다.")
        return;
      }

      if (window.confirm('이 물건을 삭제하시겠습니까?')) {
        const params = new URLSearchParams();
        params.append('item_id', item_id);
        
        const response = await axios.post(
          '/stuff/item/delete', 
          params,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        if (response.data === 'redirect:/stuff/item/list' || 
            response.status === 200 || 
            response.data.success) {
          alert('물건이 삭제되었습니다.');
          loadItems();
        } else {
          alert(response.data.message || '삭제에 실패했습니다.');
        }
      }
    } catch (error) {
      alert('물건 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleQuantityChange = (itemId, value) => {
    const item = items.find(item => item.item_id === itemId);
    if (!item) return;

    const newQuantity = Math.max(1, Math.min(value, item.item_stock));
    setQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  const handleAddToCart = async (itemId, quantity) => {
    try {
      if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 현재 아이템의 재고 확인
      const item = items.find(item => item.item_id === itemId);
      if (!item || item.item_stock <= 0) {
        alert('재고가 부족합니다.');
        return;
      }

      const params = new URLSearchParams();
      params.append('itemId', itemId);
      params.append('quantity', quantity);

      const response = await axios.post(
        '/stuff/api/cart/add',
        params,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.status === 'success') {
        alert(response.data.message);
        // 서버의 최신 상태를 가져옴
        loadItems();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('장바구니 추가 중 오류:', error);
      alert(error.response?.data?.message || '장바구니 추가에 실패했습니다.');
    }
  };

  const handleMouseMove = (itemId, e) => {
    if (!cardRefs.current[itemId]) return;

    const card = cardRefs.current[itemId];
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / 10) * 0.5;
    const rotateY = ((x - centerX) / 10) * 0.5;

    setRotations(prev => ({
      ...prev,
      [itemId]: { x: rotateX, y: rotateY }
    }));
  };

  const handleMouseLeave = (itemId) => {
    setRotations(prev => ({
      ...prev,
      [itemId]: { x: 0, y: 0 }
    }));
  };

  if (loading) {
    return (
      <div className="item-list">
        <div className="loading-spinner">
          <p>물건 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="item-list">
      {isAdmin && (
        <button onClick={refreshList} className="refresh-button">
          목록 새로고침
        </button>
      )}
      <h2>물건 목록</h2>
      <div className="items-container">
        {items.map(item => (
          <div
            key={item.item_id}
            ref={el => cardRefs.current[item.item_id] = el}
            className="item-card"
            onMouseMove={(e) => handleMouseMove(item.item_id, e)}
            onMouseLeave={() => handleMouseLeave(item.item_id)}
            style={{
              transform: `
                perspective(1000px)
                rotateX(${rotations[item.item_id]?.x || 0}deg)
                rotateY(${rotations[item.item_id]?.y || 0}deg)
                translateZ(20px)
              `,
              transition: 'transform 0.3s ease'
            }}
          >
            <div className="item-image">
              <img 
                src={item.image_url || 'https://via.placeholder.com/400x200'} 
                alt={item.item_name}
                onError={(e) => {
                  console.log('이미지 로드 실패:', item.image_url); // 이미지 로드 실패 시 로그
                  e.target.src = 'https://via.placeholder.com/400x200';
                }}
              />
            </div>
            <div className="item-content">
              <h3>{item.item_name}</h3>
              <p>가격: {item.item_price.toLocaleString()}원</p>
              <p>재고: {item.item_stock.toLocaleString()}개</p>
              <p>{item.item_description}</p>
              
              {isAdmin && (
                <div className="admin-controls">
                  <button 
                    onClick={() => navigate(`/stuff/item/edit?itemId=${item.item_id}`)}
                    className="edit-button"
                  >
                    수정
                  </button>
                  <button 
                    onClick={() => handleDelete(item.item_id)}
                    className="delete-button"
                  >
                    삭제
                  </button>
                </div>
              )}

              {isLoggedIn && item.item_stock > 0 && (
                <div className="cart-controls">
                  <input
                    type="number"
                    min="1"
                    max={item.item_stock}
                    value={quantities[item.item_id] || 1}
                    onChange={(e) => handleQuantityChange(item.item_id, parseInt(e.target.value))}
                    className="quantity-input"
                  />
                  <button 
                    onClick={() => handleAddToCart(item.item_id, quantities[item.item_id] || 1)}
                    className="add-to-cart-button"
                  >
                    장바구니에 추가
                  </button>
                </div>
                 
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItemList;