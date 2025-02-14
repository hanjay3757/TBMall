import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>떠벌이직장인</h3>
          <p>복지몰입니다</p>
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
            <li><Link to="/terms" className="footer-link" style={{color: '#e2e8f0'}}>이용약관</Link></li>
            <li><Link to="/privacy" className="footer-link" style={{color: '#e2e8f0'}}>개인정보처리방침</Link></li>
            <li><Link to="/faq" className="footer-link" style={{color: '#e2e8f0'}}>자주 묻는 질문</Link></li>
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