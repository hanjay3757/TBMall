import React from 'react';
import './Pages.css';

function Privacy() {
  return (
    <div className="page-container">
      <h1>개인정보처리방침</h1>
      <div className="content-section">
        <h2>1. 개인정보의 수집 및 이용 목적</h2>
        <p>
          회사는 다음의 목적을 위하여 개인정보를 처리합니다. 
          처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
          이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 
          필요한 조치를 이행할 예정입니다.
        </p>

        <h2>2. 개인정보의 처리 및 보유기간</h2>
        <p>
          회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 
          동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
        </p>

        {/* 추가 개인정보 처리방침 내용 */}
      </div>
    </div>
  );
}

export default Privacy; 