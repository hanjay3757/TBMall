import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>떠벌이직장인</h3>
          <p>최고의 서비스를 제공하는 쇼핑몰입니다.</p>
        </div>
        
        <div className="footer-section">
          <h3>고객 센터</h3>
          <p>전화: 1234-5678</p>
          <p>이메일: support@shop.com</p>
          <p>운영시간: 09:00 - 18:00</p>
        </div>
        
        <div className="footer-section">
          <h3>바로가기</h3>
          <ul>
            <li>이용약관</li>
            <li>개인정보처리방침</li>
            <li>자주 묻는 질문</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 SHOP. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer; 