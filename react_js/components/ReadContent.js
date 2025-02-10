import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './ReadContent.css';

const ReadContent = ({ isLoggedIn, isAdmin }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const boardNo = params.get('board_no'); // URL에서 board_no 파라미터 가져오기
  const [board, setBoard] = useState(null); // 게시물 정보를 저장할 상태
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('/board/read', { params: { board_no: boardNo } })
      .then((response) => {
        setBoard(response.data);
      })
      .catch((error) => {
        console.error('게시물 데이터를 불러오는 중 오류 발생:', error);
      });
  }, [boardNo]);

  if (!board) {
    return <div>게시물을 불러오는 중...</div>;
  }

  return (
    <div className="board-detail-container">
      <div className="board-detail-title">{board.board_title}</div>
      <div className="board-detail-content">{board.board_content}</div>

      <a
        href="#"
        className="board-detail-back-button"
        onClick={(e) => {
          e.preventDefault();
          navigate(-1); // 뒤로 가기
        }}
      >
        목록으로 돌아가기
      </a>

      {isAdmin && (
        <a
          href="#"
          className="board-edit-button"
          onClick={(e) => {
            e.preventDefault();
            navigate(`/board/editContent?board_no=${board.board_no}`); // 글 수정
          }}
        >
          글 수정
        </a>
      )}
    </div>
  );
};

export default ReadContent;
