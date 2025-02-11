import React, { useEffect, useState, useCallback } from 'react';

import axios from 'axios';

import './BoardList.css'; // CSS 파일 임포트

import { useNavigate } from 'react-router-dom';



function BoardList({ isLoggedIn, isAdmin }) {

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

        params: { currentPage, pageSize },

        withCredentials: true,

      });

      const { boards = [], totalPages } = response.data; // 백엔드에서 페이지 데이터 가져옴

      console.log('Fetched boards:', boards);

      console.log('Total Pages:', totalPages);

      const filteredBoards = boards.filter(board => board.board_delete === 0);

      setBoards(filteredBoards);

      setTotalPages(totalPages); // 전체 페이지 수 설정

    } catch (error) {

      console.error('게시판 목록을 불러오는 중 오류 발생:', error);

    } finally {

      setLoading(false); // 로딩 상태 해제

    }

  }, [currentPage, pageSize, isAdmin]);



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

        alert('관리자 권한이 필요합니다.');

        return;

      }

      if (!board_no) {

        alert('삭제할 글이 없습니다.');

        return;

      }



      if (window.confirm('이 글을 삭제하시겠습니까?')) {

        const response = await axios.post(

          { board_no: board_no },

          {

            withCredentials: true,

            headers: {

              'Content-Type': 'application/json',

            },

          }

        );



        if (response.data.success) {

          alert('해당 글이 삭제되었습니다.');

          await loadBoards(); // 삭제 후 목록 새로고침

        } else {

          alert(response.data.message || '글 삭제에 실패했습니다.');

        }

      }

    } catch (error) {

      console.error('글 삭제 실패:', error);

      alert(error.response?.data?.message || '글 삭제 중 오류가 발생했습니다.');

    }

  };



  const handlePageChange = (page) => {

    if (page >= 1 && page <= totalPages) {

      setCurrentPage(page); // 페이지 변경

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

      <h1>TBmall 공지 사항 </h1>

      <table className="board-table">

        <thead>

          <tr>

            <th>번호</th>

            <th>제목</th>

            {/* <th>내용</th> */}

            <th>작성일</th>

            {isAdmin && <th>관리</th>}

          </tr>

        </thead>

        <tbody>

          {boards.map((board, index) => (

            <tr key={board.board_no}>

              <td onClick={() => readContent(board.board_no)} style={{cursor: 'pointer'}}>
                {(currentPage - 1) * pageSize + index + 1}
              </td>

              <td onClick={() => readContent(board.board_no)} style={{cursor: 'pointer'}}>
                {board.board_title}
              </td>

              {/* <td onClick={() => readContent(board.board_no)} style={{cursor: 'pointer'}}>
                {board.board_content}
              </td> */}

              <td onClick={() => readContent(board.board_no)} style={{cursor: 'pointer'}}>
                {board.board_writedate}
              </td>

              {isAdmin && (

                <td>

                  <button

                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(board.board_no);
                    }}
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



      {isLoggedIn && (

        <div style={{ marginTop: '20px' }}>

          <button onClick={handleWrite} className="write-button">

            글 작성

          </button>

        </div>

      )}

    </div>

  );

}



export default BoardList;

