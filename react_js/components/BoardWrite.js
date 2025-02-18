import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './BoardWrite.css';
function BoardWrite({ isLoggedIn }) {
    const navigate = useNavigate();
    // useEffect(() => {
    //     const loginStaff = JSON.parse(localStorage.getItem('loginStaff'));
    //     if (loginStaff) {
    //         setBoardData((prevData) => ({ ...prevData, member_no: loginStaff.member_no }));
    //     }
    // }, []);
    

    // 로그인 상태에서 계정 번호를 가져옴
    const memberNo = isLoggedIn?.member_no || localStorage.getItem('member_no') || '';

    const [boardData, setBoardData] = useState({
        member_no: memberNo,
        board_title: '',
        board_content: ''
       
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setBoardData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const params = new URLSearchParams();
            Object.keys(boardData).forEach((key) => {
                params.append(key, boardData[key]);
            });


            const response = await axios.post(
                '/board/write',

                params,

                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
              
            );

            if (response.data.success) {
                alert('글 작성 완료');
                navigate('/board/list');
            } else {
                alert(response.data.message || '글 등록에 실패하였습니다.');
            }
        } catch (error) {
            alert('글 작성에 실패하였습니다.');
        }
    };

    return (
        <div className="board-write-container">
            <h2>게시글 작성</h2>
            <form onSubmit={handleSubmit} className="board-write-form">
                <div className="form-group">
                    <label htmlFor="board_title">글 제목</label>
                    <input
                        type="text"
                        id="board_title"
                        name="board_title"
                        value={boardData.board_title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="board_content">글 내용</label>
                    <textarea
                        id="board_content"
                        name="board_content"
                        value={boardData.board_content}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                
                <div className="button-group">
                    <button type="submit" className="submit-button">
                        글 작성
                    </button>
                    <button 
                        type="button" 
                        className="cancel-button"
                        onClick={() => navigate('/board/list')}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BoardWrite;
