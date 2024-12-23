import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BoardList.css'; // CSS 파일 임포트
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';

function BoardList({ isLoggedIn, isAdmin }) {
  const [boards, setBoards] = useState([]); // 글 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadBoards();
  }, []);

  // 서버에서 글 목록 가져오기
  const loadBoards = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/mvc/board/list`, {
        withCredentials: true,
      });
      console.log(response.data);
      console.log('isAdmin:',isAdmin);
      setBoards(response.data); // 서버에서 가져온 데이터 설정
    } catch (error) {
      console.error('게시판 목록을 불러오는 중 오류 발생:', error);
    } finally {
      setLoading(false); // 로딩 상태 해제
    }
  };

  const handleDelete = async (board_no) => {
    try {
      if (!isAdmin) {
        alert('관리자 권한이 필요합니다.');
        return;
      }
      if (!board_no) {
        alert('삭제할 글이 없습니다.');
        return;
      }
      

      if (window.confirm('이 글을 삭제하시겠습니까?')) {
        const params = new URLSearchParams();
        params.append('board_no', board_no);
        // params.append('member_no', isLoggedIn.get.member_no);
        console.log("삭제 요청 파라미터:",board_no);

        const response = await axios.post(
          `${API_BASE_URL}/mvc/board/deleteOneContent`,
          params,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        if (
          response.data === 'redirect:/board/list' ||
          response.status === 200 ||
          response.data.success
        ) {
          alert('해당 글이 삭제되었습니다.');
          loadBoards();
        } else {
          alert(response.data.message || '글 삭제에 실패했습니다.');
        }
      }
    } catch (error) {
      alert('글 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <p>게시판 목록을 불러오는 중입니다...</p>;
  }

  if (boards.length === 0) {
    return <p>게시판에 등록된 글이 없습니다.</p>;
  }

  return (
    <div>
      <h1>TBmall 고객 게시판</h1>
      <table className="board-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>내용</th>
            {isAdmin && <th>관리</th>}
          </tr>
        </thead>
        <tbody>
          {boards.map((board, index) => (
            <tr key={board.board_no}>
              <td>{index + 1}</td>
              <td>{board.board_title}</td>
              <td>{board.board_content}</td>
              {isAdmin && (
                <td>
                  <button
                    onClick={() => handleDelete(board.board_no)}
                    className="delete-button"
                  >
                    삭제
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BoardList;
