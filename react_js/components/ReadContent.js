import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import './BoardList.css'; // CSS 파일 임포트
import { useLocation, useNavigate } from 'react-router-dom';
import './ReadContent.css';

const ReadContent = ()=>{
    const location = useLocation();
    // const {boardNo} = useParams();// 
    const params = new URLSearchParams(location.search);
    const boardNo = params.get('board_no'); // url에서 board_no 파라미터 가져오기
    const [board, setBoard] = useState(null); //게시물 정보를 저장할 상태
    // const [loading, setLoading] = useState(true); // 로딩 상태 저장
    const navigate = useNavigate();

    useEffect(()=>{
        //Spring의 API 에서 게시물 정보 가져오기
        axios.get('http://localhost:8080/mvc/board/read',{params: {board_no: boardNo}}) //쿼리 파라미터 전달
        .then((response) => {
            setBoard(response.data); //데이터 저장
            // setLoading(false); //로딩 상태 해제
        })
        .catch((error) => {
            console.error("게시물 데이터를 불러오는 중 오류 발생:",error);
            // setLoading(false); //로딩 상태 해제
        });
    } , [boardNo]);

    
    
      if (!board) {
        return <div>게시물을 불러오는 중</div>;
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
          navigate(`/board/editContent?board_no=${board.board_no}`); // 뒤로 가기
        }}
      >
        글 수정
      </a>
        </div>
        
      );
}
export default ReadContent;