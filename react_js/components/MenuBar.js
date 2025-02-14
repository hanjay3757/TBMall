import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuBar.css';

function MenuBar({ isLoggedIn, isAdmin }) {
  const navigate = useNavigate();

  return (
    <div className="menu-bar">
      <div className="menu-left">
        <button onClick={() => navigate('/stuff/item/list')}>물건 목록</button>
        {isLoggedIn && (
          <button onClick={() => navigate('/stuff/cart')}>
            🛒 장바구니
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="menu-center">
          <button onClick={() => navigate('/stuff/item/register')}>물건 등록</button>
          <button onClick={() => navigate('/staff/register')}>사원 등록</button>
          <button onClick={() => navigate('/stuff/item/deleted')}>삭제된 물건</button>
          <button onClick={() => navigate('/staff/removelist')}>삭제된 직원</button>
        </div>
      )}

      <div className="menu-right">
        <span className="current-page">
          {window.location.pathname === '/stuff/item/list' && '물건 목록'}
          {window.location.pathname === '/stuff/cart' && '장바구니'}
          {window.location.pathname === '/stuff/item/register' && '물건 등록'}
          {window.location.pathname === '/staff/register' && '사원 등록'}
          {window.location.pathname === '/stuff/item/deleted' && '삭제된 물건'}
          {window.location.pathname === '/staff/removelist' && '삭제된 직원'}
          {window.location.pathname === '/staff/edit' && '직원 정보 수정'}
          {window.location.pathname === '/stuff/item/edit' && '물건 정보 수정'}
        </span>
      </div>
    </div>
  );
}

export default MenuBar; 