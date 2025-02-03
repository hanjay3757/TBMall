import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';


function BoardEdit({ isLoggedIn, isAdmin }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const boardNo = searchParams.get('board_no');
    const memberNo = isLoggedIn ? localStorage.getItem('member_no') : '';

    const [boardData, setBoardData] = useState({
        board_no: boardNo,
        member_no: memberNo,
        board_title: '',
        board_content: '',
        board_readcount: '',
        board_writedate: new Date().toISOString(),
        board_delete: 0,
        board_delete_at: '',
    });

    const [loading, setLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        const fetchBoardData = async () => {
            try {
                const response = await axios.get(`http://192.168.0.128:8080/mvc/board/read?board_no=${boardNo}`);
                const data = response.data;

                setBoardData((prevData) => ({
                    ...prevData,
                    member_no: data.member_no || '',
                    board_title: data.board_title || '',
                    board_content: data.board_content || '',
                }));

                if (Number(data.member_no) === Number(memberNo) || isAdmin) {
                    setHasPermission(true);
                } else {
                    alert('해당 글에 대한 수정 권한이 없습니다.');
                    navigate('/board/list');
                }
            } catch (error) {
                console.error('글 데이터를 불러오는데 실패했습니다:', error.response?.data || error.message);
                alert('글 데이터를 불러올 수 없습니다.');
                navigate('/board/list');
            } finally {
                setLoading(false);
            }
        };

        if (boardNo) {
            fetchBoardData();
        }
    }, [boardNo, memberNo, isAdmin, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBoardData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // const params = new URLSearchParams();
        // params.append('board_no', boardNo);
        // params.append('member_no', memberNo);
        // params.append('board_title', boardData.board_title);
        // params.append('board_content', boardData.board_content);
        const data ={
            board_no : boardNo,
            member_no : memberNo,
            board_title : boardData.board_title,
            board_content : boardData.board_content,
        }

        
        try {
                const response = await axios.post('http://192.168.0.128:8080/mvc/board/editContent', JSON.stringify(data), {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

            if (response.data.success) {
                alert('글 수정 완료');
                navigate('/board/list');
            } else {
                alert(response.data.message || '글 수정에 실패하였습니다.');
            }
        } catch (error) {
            console.error('글 수정 실패:', error.response?.data || error.message);
            alert('글 수정에 실패하였습니다.');
        }
    };

    if (loading) {
        return <div>로딩 중....</div>;
    }

    if (!hasPermission) {
        return null;
    }

    return (
        <div>
            <h2>글 수정</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>글 제목:</label>
                    <input
                        type="text"
                        name="board_title"
                        value={boardData.board_title}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>글 내용:</label>
                    <textarea
                        name="board_content"
                        value={boardData.board_content}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">수정</button>
            </form>
        </div>
    );
}

export default BoardEdit;
