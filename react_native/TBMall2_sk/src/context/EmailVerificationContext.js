import React, { createContext, useState, useContext } from 'react';

const EmailVerificationContext = createContext();

export const EmailVerificationProvider = ({ children }) => {
  const [verificationCodes, setVerificationCodes] = useState({});
  const [verifiedEmails, setVerifiedEmails] = useState([]);

  // 실제 구현에서는 서버에서 이메일을 보내야 합니다
  const sendVerificationCode = (email) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCodes(prev => ({
      ...prev,
      [email]: code
    }));
    return code; // 실제 구현에서는 이메일로 전송됩니다
  };

  const verifyCode = (email, code) => {
    if (verificationCodes[email] === code) {
      setVerifiedEmails(prev => [...prev, email]);
      return true;
    }
    return false;
  };

  const isEmailVerified = (email) => {
    return verifiedEmails.includes(email);
  };

  return (
    <EmailVerificationContext.Provider
      value={{
        sendVerificationCode,
        verifyCode,
        isEmailVerified,
      }}
    >
      {children}
    </EmailVerificationContext.Provider>
  );
};

export const useEmailVerification = () => useContext(EmailVerificationContext); 