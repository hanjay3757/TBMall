import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './ReadContent.css';
import { API_BASE_URL } from '../config';

const ReadContent = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const boardNo = params.get('board_no'); // URL에서 board_no 파라미터 가져오기
  const [board, setBoard] = useState(null); // 게시물 정보를 저장할 상태
  const navigate = useNavigate();
  const [comments, setComments] = useState([]); // 댓글 정보를 저장할 상태
  const [newComment, setNewComment] = useState(''); // 새로운 댓글 내용
  const [currentComment, setCurrentComment] = useState(1); // 현재 댓글 페이지
  const [totalComment, setTotalComment] = useState(0); // 전체 댓글 수
  const [cpageSize, setCpageSize] = useState(5); // 페이지당 댓글 수
  const [loading, setLoading] = useState(false); // 로딩 상태 관리

  // 댓글 작성 함수
  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해 주세요.');
      return;
    }

    axios
      .post(
        '/board/comment',
        { comment_content: newComment },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.success) {
          const newCommentObj = {
            comment_content: response.data.comment_content,
            member_no: response.data.member_no,
            comment_writedate: new Date(response.data.comment_writedate).toLocaleString(),
          };

          setComments((prevComments) => [newCommentObj, ...prevComments]); // 새 댓글을 맨 위에 추가
          setNewComment(''); // 입력 필드 초기화
        } else {
          alert(response.data.message || '댓글 작성에 실패했습니다.');
        }
      })
      .catch((error) => {
        console.error('댓글 작성 중 오류 발생:', error);
        alert('댓글 작성에 실패했습니다.');
      });
  };

  // 서버에서 댓글 목록 가져오기
  const loadComment = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        '/board/commentlist',
        {
          params: { board_no: boardNo, currentComment, cpageSize },
          withCredentials: true,
        }
      );
      const { comments = [], totalComment } = response.data;
      console.log('Fetched comment:', comments);
      console.log('Total Pages:', totalComment);
      setComments(comments);
      setTotalComment(totalComment); // 전체 페이지 수 설정
    } catch (error) {
      console.error('댓글 목록을 불러오는 중 오류 발생:', error);
    } finally {
      setLoading(false); // 로딩 상태 해제
    }
  }, [boardNo, currentComment, cpageSize]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalComment) {
      setCurrentComment(newPage); // 페이지 변경
      loadComment(); // 새 페이지 댓글 로드
    }
  };

  useEffect(() => {
    axios
      .get(`/board/read?board_no=${boardNo}`)
      .then((response) => {
        setBoard(response.data);
      })
      .catch((error) => {
        console.error('게시물 데이터를 불러오는 중 오류 발생:', error);
      });

    loadComment();
  }, [boardNo, loadComment]);

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

      <div className="comment-section">
        <h3>댓글</h3>
        {loading ? (
          <p>댓글을 불러오는 중...</p>
        ) : comments.length === 0 ? (
          <p>댓글이 없습니다.</p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className="comment-item">
              <p>작성자: {comment.member_no}</p>
              <p>{comment.comment_content}</p>
              <p>작성일: {comment.comment_writedate}</p>
            </div>
          ))
        )}

        <div className="pagination">
          <button onClick={() => handlePageChange(currentComment - 1)} disabled={currentComment === 1}>
            이전
          </button>
          <span>
            {currentComment} / {totalComment}
          </span>
          <button
            onClick={() => handlePageChange(currentComment + 1)}
            disabled={currentComment === totalComment}
          >
            다음
          </button>
        </div>

        <textarea
          placeholder="댓글을 입력하세요."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={handleCommentSubmit}>댓글 작성</button>
      </div>
    </div>
  );
};

export default ReadContent;
