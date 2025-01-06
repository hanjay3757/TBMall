import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

function BoardEdit({isLoggedIn, isAdmin}){
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const boardNo = searchParams.get('board_no'); // 글 ID를 URL 쿼리에서 가저옴
    

    // 로그인 상태에서 계정 번호를 가져옴
    const memberNo = isLoggedIn? localStorage.getItem('member_no') : '';
    if(!memberNo){
        alert('로그인 후 수정할 수 있습니다.');
    }


    console.log('isLoggedIn:',isLoggedIn);
    console.log('localStorage member_no:',localStorage.getItem('member_no'));
    const [boardData, setBoardData] = useState({
        board_no: boardNo , 
        member_no: memberNo ,
         board_title: '',
         board_content: '',
         board_readcount: '',
         board_writedate: new Date().toISOString(),
         board_delete: 0,
         board_delete_at: '',
           
    });

    const [loading, setLoading] =useState(true); // 데이터 로딩 상태
    const [hasPermission, setHasPermission] = useState(false) // 수정 권한 여부

    //글 데이터 로드
    useEffect(() => {
        console.log('useEffect triggered');
        const fetchBoardData = async () => {
            try {
                console.log('Fetching data for boardNo:', boardNo);
    
                const response = await axios.get(`http://localhost:8080/mvc/board/read?board_no=${boardNo}`);
                const data = response.data;
    
                console.log('API Response Data:', data); // API 응답 로그
                if (data) {
                    setBoardData({
                        board_no: boardNo,
                        member_no: data.member_no || '',
                        board_title: data.board_title || '',
                        board_content: data.board_content || '',
                        // board_readcount: data.board_readcount || '0',
                        // board_writedate: data.board_writedate || today,
                        // board_delete: data.board_delete || '',
                        // board_delete_at: data.board_delete_at || ''
                    });
                } else {
                    console.error('No data returned from the API');
                }
                
                //권한 체크
                if (Number(data.member_no) === Number(memberNo) || isAdmin) {
                    setHasPermission(true);
                } else {
                    alert('해당 글에 대한 수정 권한이 없습니다.');
                    navigate('/board/list');
                }
            } catch (error) {
                console.error('글 데이터를 불러오는데 실패했습니다:', error);
                alert('글 데이터를 불러올 수 없습니다.');
                navigate('/board/list');
            } finally {
                setLoading(false);
            }
        };
    
        if (boardNo) {
            fetchBoardData();
        } else {
            console.log('No boardNo found');
        }
        console.log('Updated boardData:', boardData);
    }, [boardNo, memberNo, isAdmin, navigate]);
    

    //데이터 수정
    const handleChange = (e) => {
        const {name , value} = e.target;
        setBoardData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    //수정 요청 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Sending data to server:', boardData); // 전송 데이터 확인
        
        // URLSearchParams로 데이터를 준비
    const params = new URLSearchParams();
    params.append('board_no', boardNo);
    params.append('member_no', memberNo);
    params.append('board_title', boardData.board_title);
    params.append('board_content', boardData.board_content);

    try {
        // URL-encoded 방식으로 전송
        const response = await axios.post('http://localhost:8080/mvc/board/editContent', params, {
            headers: {
                'Content-Type': 'application/json' // URL-encoded로 보냄
            },url: '/localhost:8080',
            method :'post'
            , data:JSON.stringify(params)
        });

        console.log('Response:', response);

        if (response.data.success) {
            alert('글 수정 완료');
            navigate('/board/list');
        } else {
            alert(response.data.message || '글 수정에 실패하였습니다.');
        }
        } catch (error) {
        console.error('글 수정 실패:', error);
        alert('글 수정에 실패하였습니다.');
     }

        // try {
        //     const response = await axios.post('http://localhost:8080/mvc/board/editContent', boardData, {
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //     });
    
        //     console.log('Response:', response); // 응답 데이터 확인
    
        //     if (response.data.success) {
        //         alert('글 수정 완료');
        //         navigate('/board/list');
        //     } else {
        //         alert(response.data.message || '글 수정에 실패하였습니다.');
        //     }
        // } catch (error) {
        //     console.error('글 수정 실패:', error);
        //     alert('글 수정에 실패하였습니다.');
        // }
    };
    

    if(loading){
        return <div>로딩 중....</div>;
    }
    
    if(!hasPermission){
        return null; //권한 없는 경우 아무것도 랜더링 안함

    }

    return(
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