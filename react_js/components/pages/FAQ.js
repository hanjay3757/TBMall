import React from 'react';
import './Pages.css';

function FAQ() {
  return (
    <div className="page-container">
      <h1>자주 묻는 질문</h1>
      <div className="content-section">
        <div className="faq-item">
          <h3>Q: 회원 가입은 어떻게 하나요?</h3>
          <p>A: 상단 메뉴의 '회원가입' 버튼을 클릭하여 필요한 정보를 입력하시면 됩니다.</p>
        </div>

        <div className="faq-item">
          <h3>Q: 비밀번호를 잊어버렸어요.</h3>
          <p>A: 로그인 페이지의 '비밀번호 찾기' 기능을 이용하시거나 관리자에게 문의해주세요.</p>
        </div>

        {/* 추가 FAQ 항목들 */}
      </div>
    </div>
  );
}

export default FAQ; 