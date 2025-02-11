import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ItemDetail.css';
import { SERVER_URL } from '../config';

function ItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [boards, setBoards] = useState([]);
  const [newBoard, setNewBoard] = useState({
    board_title: '',
    board_content: ''
  });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentComment, setCurrentComment] = useState(1);
  const [cpageSize, setCpageSize] = useState(5);
  const [totalComment, setTotalComment] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);


  const StarRating =({rating, setRating}) =>{
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "star selected" : "star"}
            onClick={() => setRating(star)}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };
  
  // 댓글 목록 로드 함수 정의
  const loadComments = async (itemId) => {
    try {
      console.log('댓글 목록 요청 - item_id:', itemId);
      
      const response = await axios.get(`${SERVER_URL}/mvc/board/commentlist`, {
        params: { 
          item_id: itemId,
          currentComment: currentComment, 
          cpageSize: cpageSize 
        },
        withCredentials: true
      });

      console.log('댓글 목록 응답:', response.data);

      if (response.data && Array.isArray(response.data.comments)) {
        setComments(response.data.comments);
        setTotalComment(response.data.totalComment || 0);
        setCurrentComment(response.data.currentComment || 1);
      } else {
        console.warn('댓글 데이터가 없거나 형식이 잘못되었습니다:', response.data);
        setComments([]);
        setTotalComment(0);
      }
    } catch (error) {
      console.error('댓글 목록을 불러오는 중 오류 발생:', error);
      setComments([]);
      setTotalComment(0);
    }
  };

  // checkLoginStatus 함수 수정
  const checkLoginStatus = async () => {
    try {
      const response = await axios.post(`${SERVER_URL}/mvc/staff/check-login`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('로그인 상태 확인 응답:', response.data);
      
      if (response.data && response.data.isLoggedIn) {
        setIsLoggedIn(true);
        setIsAdmin(response.data.isAdmin);
        localStorage.setItem('member_no', response.data.admin_no);
        localStorage.setItem('member_role', response.data.isAdmin ? 'ROLE_ADMIN' : 'ROLE_USER');
        setUserInfo(response.data);  // 전체 사용자 정보 저장
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        localStorage.removeItem('member_no');
        localStorage.removeItem('member_role');
        setUserInfo(null);
      }
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserInfo(null);
    }
  };

  // 상품 정보와 댓글 목록 로드
  useEffect(() => {
    const loadItemDetail = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/mvc/stuff/item/detail/${itemId}`, {
          withCredentials: true
        });
        
        if (response.data.status === 'success') {
          setItem(response.data.item);
        } else {
          throw new Error('상품 정보를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('상품 정보 로딩 실패:', error);
        alert('상품 정보를 불러오는데 실패했습니다.');
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    // 로그인 상태 체크 및 사용자 정보 로드
    const memberNo = localStorage.getItem('member_no');
    if (memberNo) {
      setIsLoggedIn(true);
      const memberRole = localStorage.getItem('member_role');
      setIsAdmin(memberRole === 'ROLE_ADMIN');
      setUserInfo({
        member_no: memberNo,
        member_role: memberRole
      });
      console.log('저장된 사용자 정보:', {
        member_no: memberNo,
        member_role: memberRole
      });
    }

    const loadData = async () => {
      try {
        await checkLoginStatus(); // 비동기 함수로 변경
        await loadItemDetail();
        if (itemId) {
          await loadComments(itemId);
        }
      } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
      }
    };
    
    loadData();

    // 로그인 상태 변경 감지를 위한 이벤트 리스너
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [itemId, currentComment]);

  // // 댓글 작성 함수 수정
  // const handleCommentSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!newComment.trim()) {
  //     alert('댓글 내용을 입력해 주세요.');
  //     return;
  //   }

  //   try {
  //     const memberNo = localStorage.getItem('member_no');
  //     if (!memberNo) {
  //       alert('로그인이 필요한 서비스입니다.');
  //       navigate('/staff/login');
  //       return;
  //     }

  //     // 1. 먼저 세션에 상품 정보 저장
  //     const sessionResponse = await axios.get(
  //       `${SERVER_URL}/mvc/board/comment`,
  //       {
  //         params: { 
  //           item_id: Number(itemId)  // Long 타입으로 변환
  //         },
  //         withCredentials: true
  //       }
  //     );

  //     if (sessionResponse.data === 'redirect:/staff/login') {
  //       alert('로그인이 필요한 서비스입니다.');
  //       navigate('/staff/login');
  //       return;
  //     }

  //     // 2. 댓글 작성 요청 - CommentDto와 일치하는 형식
  //     const commentData = {
  //       comment_content: newComment.trim()  // 서버에서 필요한 필드만 전송
  //     };

  //     console.log('댓글 작성 요청 데이터:', commentData);

  //     const response = await axios.post(
  //       `${SERVER_URL}/mvc/board/comment`,
  //       commentData,
  //       {
  //         withCredentials: true,
  //         headers: {
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     );

  //     console.log('댓글 작성 응답:', response.data);

  //     if (response.data.success) {
  //       setNewComment('');
  //       await loadComments(itemId);
  //       alert('댓글이 등록되었습니다.');
  //     } else {
  //       throw new Error(response.data.message || '댓글 등록에 실패했습니다.');
  //     }
  //   } catch (error) {
  //     console.error('댓글 작성 중 오류 발생:', error);
  //     if (error.response?.status === 401) {
  //       alert('로그인이 필요한 서비스입니다.');
  //       navigate('/staff/login');
  //     } else {
  //       alert(error.response?.data?.message || '댓글 작성에 실패했습니다. 다시 시도해주세요.');
  //     }
  //   }
  // };

  // 댓글 삭제 함수 수정
  const handleDelete = async (item_id, member_no) => {
    try {
      console.log('=== 댓글 삭제 시작 ===');
      console.log('삭제할 댓글 정보:', {
        item_id,
        member_no
      });

      // 관리자 권한 체크
      const memberRole = localStorage.getItem('member_role');
      if (memberRole !== 'ROLE_ADMIN') {
        console.log('권한 체크 실패:', {
          memberRole,
          expected: 'ROLE_ADMIN'
        });
        alert('관리자만 댓글을 삭제할 수 있습니다.');
        return;
      }

      // 삭제 확인
      const confirmDelete = window.confirm('정말로 이 댓글을 삭제하시겠습니까?');
      if (!confirmDelete) {
        console.log('사용자가 삭제를 취소함');
        return;
      }

      const deleteUrl = `${SERVER_URL}/mvc/board/comment/${item_id}/${member_no}`;
      console.log('삭제 요청 URL:', deleteUrl);

      const response = await axios.delete(deleteUrl, {
        withCredentials: true
      });

      console.log('서버 응답:', response.data);

      if (response.data.success) {
        alert('댓글이 성공적으로 삭제되었습니다.');
        await loadComments(itemId);
      } else {
        throw new Error(response.data.message || '댓글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCommentPageChange = (page) => {
    if (page >= 1 && page <= totalComment) {
      setCurrentComment(page);
    }
  };

  // 댓글 목록 표시 부분 추가
  const renderComments = () => {
    if (!comments || comments.length === 0) {
      return <p className="no-comments">등록된 댓글이 없습니다.</p>;
    }

    const isAdminUser = userInfo?.isAdmin || userInfo?.delete_right_no === 1;

    console.log('관리자 권한 체크:', {
      userInfo,
      isAdminUser,
      memberRole: localStorage.getItem('member_role')
    });

    return (
      <div className="comments-container">
        {comments.map((comment, index) => {
          console.log('댓글 데이터:', {
            item_id: comment.item_id,
            member_no: comment.member_no,
            content: comment.comment_content,
            writedate: comment.comment_writedate,
            fullComment: comment
          });

          // item_id와 member_no로 고유 키 생성
          const uniqueKey = `${comment.item_id}-${comment.member_no}-${index}`;

          return (
            <div key={uniqueKey} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.member_nick || '익명'}</span>
                <span className="comment-date">
                  {new Date(comment.comment_writedate).toLocaleDateString()}
                </span>
              </div>
              <p className="comment-content">{comment.comment_content}</p>
              {isAdminUser && (
                <button
                  onClick={() => {
                    console.log('삭제 버튼 클릭:', {
                      item_id: comment.item_id,
                      member_no: comment.member_no,
                      content: comment.comment_content
                    });
                    // item_id와 member_no를 사용하여 댓글 식별
                    handleDelete(comment.item_id, comment.member_no);
                  }}
                  className="delete-btn"
                >
                  삭제
                </button>
              )}
            </div>
          );
        })}
        
        {/* 페이지네이션 */}
        <div className="pagination">
          <button
            onClick={() => handleCommentPageChange(currentComment - 1)}
            disabled={currentComment <= 1}
          >
            이전
          </button>
          <span>{currentComment} / {totalComment}</span>
          <button
            onClick={() => handleCommentPageChange(currentComment + 1)}
            disabled={currentComment >= totalComment}
          >
            다음
          </button>
        </div>
      </div>
    );
  };

  // CommentForm 컴포넌트 수정
  const CommentForm = () => {
    const [localComment, setLocalComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rating , setRating] = useState(0);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      const memberNo = localStorage.getItem('member_no');

      if (!localComment.trim()) {
        alert('댓글 내용을 입력해 주세요.');
        return;
      }

      try {
        setIsSubmitting(true);
        console.log('=== 댓글 작성 시작 ===');
        
        console.log('로그인 정보:', {
          memberNo,
          isLoggedIn: !!memberNo
        });

        // 1. 세션에 상품 정보 저장
        console.log('세션 저장 요청 시작 - 파라미터:', {
          item_id: Number(itemId)
        });

        const sessionResponse = await axios.get(
          `${SERVER_URL}/mvc/board/comment`,
          {
            params: { 
              item_id: Number(itemId),
              member_no: memberNo,
            },
            withCredentials: true
          }
        );

        console.log('세션 저장 응답:', {
          status: sessionResponse.status,
          data: sessionResponse.data
        });

        if (sessionResponse.data === 'redirect:/staff/login') {
          console.log('로그인 필요 - 리다이렉트');
          alert('로그인이 필요한 서비스입니다.');
          navigate('/staff/login');
          return;
        }

        // 2. 댓글 작성 요청
        const commentData = {
          item_id: itemId,
          member_no: memberNo,
          comment_content: localComment.trim(),  // 서버에서 필요한 필드만 전송
          reviewpoint_amount: rating,
        };

        console.log('댓글 작성 요청 데이터:', commentData);

        const response = await axios.post(
          `${SERVER_URL}/mvc/board/comment`,
          commentData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('댓글 작성 응답:', {
          status: response.status,
          headers: response.headers,
          data: response.data
        });

        if (response.data.success) {
          console.log('댓글 작성 성공');
          setLocalComment('');
          setRating(0);
          await loadComments(itemId);
          alert('댓글이 등록되었습니다.');
        } else {
          console.log('댓글 작성 실패:', response.data.message);
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('=== 댓글 작성 오류 상세 ===');
        console.error('오류 타입:', error.name);
        console.error('오류 메시지:', error.message);
        console.error('서버 응답:', error.response?.data);
        console.error('요청 설정:', error.config);
        console.error('전체 오류:', error);

        if (error.response?.status === 401) {
          alert('로그인이 필요한 서비스입니다.');
          navigate('/staff/login');
        } else {
          alert(error.response?.data?.message || '댓글 작성에 실패했습니다. 다시 시도해주세요.');
        }
      } finally {
        setIsSubmitting(false);
        console.log('=== 댓글 작성 종료 ===');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="comment-form">
         <StarRating rating={rating} setRating={setRating} />
        <textarea
          value={localComment}
          onChange={(e) => setLocalComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          required
          disabled={isSubmitting}
          rows={4}
          className="comment-textarea"
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '댓글 작성'}
        </button>
      </form>
    );
  };

  // 수정 버튼 핸들러 추가
  const handleEdit = async (item_id) => {
    try {
      console.log('=== 상품 수정 시작 ===');
      console.log('수정할 상품 ID:', item_id);
      
      // 관리자 권한 체크
      if (!isAdmin) {
        alert('관리자만 수정할 수 있습니다.');
        return;
      }

      navigate(`/stuff/item/edit?itemId=${item_id}`);
    } catch (error) {
      console.error('상품 수정 페이지 이동 중 오류:', error);
      alert('상품 수정 페이지로 이동할 수 없습니다.');
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!item) {
    return <div>상품을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="item-detail-container">
      <div className="item-detail">
        {isAdmin && (
          <div className="admin-controls">
            <button 
              onClick={() => handleEdit(item?.item_id)}
              className="edit-button"
            >
              수정
            </button>
          </div>
        )}
        <div className="item-image">
          {item?.image_url ? (
            <img 
              src={item.image_url}
              alt={item.item_name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x200';
              }}
            />
          ) : (
            <img 
              src='https://via.placeholder.com/400x200'
              alt="기본 이미지"
            />
          )}
        </div>
        <div className="item-info">
          <h2>{item?.item_name}</h2>
          <p className="price">가격: {(item?.item_price || 0).toLocaleString()}원</p>
          <p className="stock">재고: {(item?.item_stock || 0).toLocaleString()}개</p>
          <p className="description">{item?.item_description}</p>
        </div>
      </div>

      <div className="comments-section">
        <h3>상품 후기</h3>
        {isLoggedIn ? <CommentForm /> : (
          <p className="login-required">
            댓글을 작성하려면 로그인이 필요합니다.
          </p>
        )}
        {renderComments()}
      </div>
    </div>
  );
}

export default ItemDetail;
