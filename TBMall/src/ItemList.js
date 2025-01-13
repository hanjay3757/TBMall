import axios from 'axios';

// axios 기본 설정
axios.defaults.baseURL = 'http://192.168.0.141:8080';
axios.defaults.withCredentials = true;

// API 호출 함수
const loadItems = async () => {
  try {
    const response = await axios.get('/mvc/stuff/item/list');
    return response.data;
  } catch (error) {
    console.error('아이템 목록 로딩 실패:', error);
    throw error;
  }
}; 