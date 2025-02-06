import axios from 'axios';
import { API_BASE_URL } from './config';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// CORS 관련 인터셉터 추가
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error('요청한 리소스를 찾을 수 없습니다.');
    } else if (error.message === 'Network Error') {
      console.error('CORS 또는 네트워크 오류가 발생했습니다.');
    }
    return Promise.reject(error);
  }
);

export default axios; 