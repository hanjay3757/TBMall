import { useState } from 'react';
import axios from 'axios';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (staffId, password) => {
    setIsLoading(true);
    setError(null);
    
    const params = new URLSearchParams();
    params.append('staffId', staffId);
    params.append('password', password);

    try {
      const response = await axios.post('http://localhost:8080/mvc/staff/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || '로그인에 실패했습니다.');
      }
      
      return response.data;
    } catch (err) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}; 