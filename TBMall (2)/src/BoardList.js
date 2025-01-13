import axios from 'axios';

// axios 기본 설정
axios.defaults.baseURL = 'http://192.168.0.141:8080';  // 실제 서버 주소로 변경
axios.defaults.withCredentials = true;                  // credentials 허용

const loadBoards = async () => {
  try {
    const response = await axios.get('/mvc/board/list');
    return response.data;
  } catch (error) {
    console.error('게시판 목록을 불러오는 중 오류 발생:', error);
    throw error;
  }
}; 