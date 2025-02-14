import React from 'react';
import './Pages.css';

function Terms() {
  return (
    <div className="page-container">
      <h1>이용약관</h1>
      <div className="content-section">
        <h2>제1조 (목적)</h2>
        <p>
          이 약관은 떠벌이직장인(이하 "회사")이 제공하는 서비스의 이용조건 및 절차, 
          회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
        </p>

        <h2>제2조 (용어의 정의)</h2>
        <p>
          이 약관에서 사용하는 용어의 정의는 다음과 같습니다:
          1. "서비스"란 회사가 제공하는 모든 서비스를 의미합니다.
          2. "회원"이란 회사와 서비스 이용계약을 체결한 자를 의미합니다.
        </p>

        {/* 추가 약관 내용 */}
      </div>
    </div>
  );
}

export default Terms; 