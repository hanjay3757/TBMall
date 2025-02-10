import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './BoardList.css'; // CSS 파일 임포트
import { useNavigate } from 'react-router-dom';

function BoardList({ isLoggedIn, isAdmin, userInfo }) {
  const [boards, setBoards] = useState([]); // 글 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [pageSize, setPageSize] = useState(10); // 한 페이지당 글 수
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const navigate = useNavigate();

  // 서버에서 글 목록 가져오기
  const loadBoards = useCallback(async () => {
    try {
      const response = await axios.get('/board/list', {
        params: { 
          currentPage, 
          pageSize,
          member_no: userInfo?.member_no
        },
        withCredentials: true,
      });
      const { boards = [], totalPages } = response.data;
      const filteredBoards = boards.filter(board => board.board_delete === 0);
      setBoards(filteredBoards);
      setTotalPages(totalPages);
    } catch (error) {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, isAdmin, userInfo?.member_no]);

  useEffect(() => {
    loadBoards(); // currentPage가 변경될 때마다 호출
  }, [currentPage, loadBoards]); // currentPage가 변경될 때마다 loadBoards 호출

  const handleWrite = () => {
    navigate(`/board/write`);
  };

  const readContent = (board_no) => {
    navigate(`/board/read?board_no=${board_no}`);
  };

  const handleDelete = async (board_no) => {
    try {
      if (!isAdmin) {
        // console.log('관리자 권한 체크 실패');
        alert('관리자 권한이 필요합니다.');
        return;
      }
      if (!board_no) {
        // console.log('게시글 번호 누락');
        alert('삭제할 글이 없습니다.');
        return;
      }
      if (window.confirm('이 글을 삭제하시겠습니까?')) {
        // 서버 엔드포인트에 맞게 URL 수정
        const response = await axios.post(
          '/board/deleteOneContent',
          { board_no: board_no },  // JSON 형식으로 전송
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        // console.log('삭제 요청 응답:', response);

        if (response.data.success) {
          alert(response.data.message || '게시글이 삭제되었습니다.');
          await loadBoards();
        } else {
          // console.error('글 삭제 실패:', response.data);
          alert(response.data.message || '글 삭제에 실패했습니다.');
        }
      }
    } catch (error) {
      // console.error('=== 글 삭제 오류 상세 ===');
      // console.error('오류 타입:', error.name);
      // console.error('오류 메시지:', error.message);
      // console.error('서버 응답:', error.response);
      // console.error('요청 설정:', error.config);
      
      const errorMessage = error.response?.data?.message || '글 삭제 중 오류가 발생했습니다.';
      alert(errorMessage);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page); // 페이지 변경
    }
  };

  const handleRowClick = (board_no) => {
    navigate(`/board/read?board_no=${board_no}`);
  };

  if (loading) {
    return <p>게시판 목록을 불러오는 중입니다...</p>;
  }

  return (
    <div>
      <div className="board-header">
        <h1>TBMALL 공지 게시판</h1>
        {isLoggedIn && isAdmin && (
          <button
            onClick={() => navigate('/board/write')}
            className="write-button"
          >
            글작성
          </button>
        )}
      </div>

      {boards.length === 0 ? (
        <div className="no-content">
          <p>등록된 글이 없습니다.</p>
          {isLoggedIn && (
            <button 
              onClick={() => navigate('/board/write')} 
              className="write-button-empty"
            >
              첫 게시글을 작성해보세요!
            </button>
          )}
        </div>
      ) : (
        <table className="board-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>작성일</th>
              {isAdmin && <th>관리</th>}
            </tr>
          </thead>
          <tbody>
            {boards.map((board) => (
              <tr 
                key={board.board_no}
                onClick={() => handleRowClick(board.board_no)}
                className="board-row"
              >
                <td>{board.board_no}</td>
                <td>{board.board_title}</td>
                <td>
                  <strong>{board.member_nick}</strong>
                  {board.member_nick ? '님' : '관리자'}
                </td>
                <td>{new Date(board.board_writedate).toLocaleDateString()}</td>
                {isAdmin && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(board.board_no)}
                    >
                      삭제
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 페이징 UI */}
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          이전
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''} // 현재 페이지 강조
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          다음
        </button>
      </div>
    </div>
  );
}

export default BoardList;
