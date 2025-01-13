import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './ReadContent.css';

const ReadContent = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const boardNo = params.get('board_no'); // URL에서 board_no 파라미터 가져오기
  const [board, setBoard] = useState(null); // 게시물 정보를 저장할 상태
  const navigate = useNavigate();
  const [comments, setComments] = useState([]); // 댓글 정보를 저장할 상태
  const [newComment, setNewComment] = useState(''); // 새로운 댓글 내용

  // 댓글 작성 함수
  const handleCommentSubmit = (e) => {
    e.preventDefault();
  
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해 주세요.');
      return;
    }
  
    axios
      .post(
        'http://192.168.0.141:8080/mvc/board/comment',
        { comment_content: newComment },
        { withCredentials: true } // 세션 유지 설정
      )
      .then((response) => {
        if (response.data.success) {
          const newCommentObj = {
            comment_content: response.data.comment_content, // 서버에서 반환된 댓글 내용
            member_no: response.data.member_no, // 작성자 이름
            comment_writedate: new Date(response.data.comment_writedate).toLocaleString(), // 작성 날짜 포맷팅
          };
  
          // 상태 업데이트로 댓글 추가
          setComments((prevComments) => [...prevComments, newCommentObj]);
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
  
  

  useEffect(() => {
    // 게시물 정보 가져오기
    axios
      .get('http://192.168.0.141:8080/mvc/board/read', { params: { board_no: boardNo } }) // 쿼리 파라미터 전달
      .then((response) => {
        setBoard(response.data); // 데이터 저장
      })
      .catch((error) => {
        console.error('게시물 데이터를 불러오는 중 오류 발생:', error);
      });

    // 댓글 목록 조회 API 호출
    axios
      .get('http://192.168.0.141:8080/mvc/board/commentlist', { params: { board_no: boardNo } }) // 쿼리 파라미터 전달
      .then((response) => {
        setComments(response.data); // 댓글 목록 저장
      })
      .catch((error) => {
        console.error('댓글 조회 실패:', error);
      });

      // Spring에서 세션에 currentBoard를 설정하기 위해 호출
    axios
      .get('http://192.168.0.141:8080/mvc/board/comment', { params: { board_no: boardNo } })
      .then((response) => {
      console.log('세션 설정 완료:', response.data);
      })
      .catch((error) => {
      console.error('세션 설정 중 오류:', error);
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

      {/* 댓글 리스트 */}
      <div className="comment-section">
        <h3>댓글</h3>
        {comments.length === 0 ? (
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

        {/* 댓글 입력 폼 */}
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
