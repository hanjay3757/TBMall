import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './ItemDetail.css';
import { SERVER_URL } from '../config';

function ItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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

  const StarRating = ({rating, setRating}) => {
    return (
      <div className="star-ratings">
        {[1, 2, 3, 4, 5].map((star) => {
          let starClass = "star";
          const starChar = star <= rating ? "⭐" : "☆";
          
          if (star <= rating) {
            starClass += " selected";
          } else {
            starClass += " exceeded";
          }
          
          return (
            <span
              key={star}
              className={starClass}
              onClick={() => setRating(star)}
              onMouseEnter={() => {
                const stars = document.querySelectorAll('.star');
                stars.forEach((s, index) => {
                  if (index < star) {
                    s.classList.add('hover');
                  }
                });
              }}
              onMouseLeave={() => {
                const stars = document.querySelectorAll('.star');
                stars.forEach(s => s.classList.remove('hover'));
              }}
            >
              {starChar}
            </span>
          );
        })}
      </div>
    );
  };

  const StarRatingDisplay = ({ rating }) => {

    console.log("별점 확인:",rating);

    return (
      
      <div className="star-rating" style={{ border: "1px solid red" }}>
        {Array(rating).fill("⭐").join("")} {/* 별을 rating 개수만큼 출력 */}
  
          
      </div>
    );
  };

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
        // 중복 제거를 위해 Set 객체 사용
        const uniqueComments = Array.from(
          new Map(response.data.comments.map(comment => [comment.comment_no, comment])).values()
        );
        
        setComments(uniqueComments);
        // ⭐ 상태 업데이트 후 값을 즉시 확인
        setTimeout(() => {
          console.log("🔥 상태 업데이트 후 comments:", uniqueComments);
        }, 100);
        
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
        setUserInfo(response.data);
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
        await checkLoginStatus();
        await loadItemDetail();
        if (itemId) {
          await loadComments(itemId);
        }
      } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
      }
    };
    
    loadData();

    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [itemId, currentComment]);

  const handleDelete = async (comment_no) => {
    try {
      console.log('=== 댓글 삭제 시작 ===');
      console.log('삭제할 댓글 번호:', comment_no);

      const response = await axios.post(`${SERVER_URL}/mvc/board/deleteComment`, null, {
        params: {
          comment_no: comment_no
        },
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('서버 응답:', response.data);

      if (response.data.success) {
        alert(response.data.message);
        await loadComments(itemId);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('=== 삭제 중 에러 발생 ===');
      console.error('에러 객체:', error);
      alert(error.response?.data?.message || '댓글 삭제에 실패했습니다.');
    }
  };

  const handleCommentPageChange = async (page) => {
    try {
      // 페이지 유효성 검사
      if (page < 1 || page > Math.ceil(totalComment / cpageSize)) {
        return;
      }
      
      setCurrentComment(page);
      await loadComments(itemId); // 새로운 페이지의 댓글 로드
    } catch (error) {
      console.error('페이지 변경 중 오류 발생:', error);
    }
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalComment / cpageSize);
    
    return (
      <div className="pagination">
        <button
          onClick={() => handleCommentPageChange(currentComment - 1)}
          disabled={currentComment <= 1}
        >
          이전
        </button>
        
        {/* 현재 페이지 번호와 전체 페이지 수 표시 */}
        <span>
          {currentComment} / {totalPages}
        </span>
        
        <button
          onClick={() => handleCommentPageChange(currentComment + 1)}
          disabled={currentComment >= totalPages}
        >
          다음
        </button>
      </div>
    );
  };

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
      <div className="comments-containers">
        {comments.map((comment, index) => {
          console.log('댓글 데이터:', {
            item_id: comment.item_id,
            member_no: comment.member_no,
            content: comment.comment_content,
            writedate: comment.comment_writedate,
            reviewpoint_amount: comment.reviewpoint_amount,
            fullComment: comment
          });

          const uniqueKey = `${comment.item_id}-${comment.member_no}-${index}`;

          return (
            <div key={uniqueKey} className="comment-items">
              <div className="comment-headers">
                <span className="comment-authors">{comment.member_nick || '익명'}</span>
                <span className="comment-dates">
                  {new Date(comment.comment_writedate).toLocaleDateString()}
                </span>
              </div>
                 {/* ✅ 댓글 별점 표시 */}
          <StarRatingDisplay rating={comment.reviewpoint_amount || 0} />

          <p className="comment-content">{comment.comment_content}</p>
              {isAdminUser && (
                <button
                  onClick={() => {
                    console.log('=== 삭제 버튼 클릭 ===');
                    console.log('댓글 전체 정보:', comment);
                    console.log('삭제할 댓글 번호:', comment.comment_no);
                    console.log('현재 관리자 여부:', isAdminUser);
                    handleDelete(comment.comment_no);
                  }}
                  className="delete-btns"
                >
                  삭제
                </button>
              )}
              </div>
          );
        })}
        
        {renderPagination()}
      </div>
    );
  };

  const CommentForm = () => {
    const [localComment, setLocalComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rating, setRating] = useState(0);

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

        const commentData = {
          item_id: itemId,
          member_no: memberNo,
          comment_content: localComment.trim(),
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
      <form onSubmit={handleSubmit} className="comment-forms">
        <StarRating rating={rating} setRating={setRating} />
        <textarea
          value={localComment}
          onChange={(e) => setLocalComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          required
          disabled={isSubmitting}
          rows={4}
          className="comment-textareas"
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '댓글 작성'}
        </button>
      </form>
    );
  };

  const handleEdit = async (item_id) => {
    try {
      console.log('=== 상품 수정 시작 ===');
      console.log('수정할 상품 ID:', item_id);
      
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
    <div className="item-detail-containers">
      <div className="item-details">
        <div className="item-imagess">
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
        <div className="item-infos">
          <h2>{item?.item_name}</h2>
          <p className="prices">가격: {(item?.item_price || 0).toLocaleString()}원</p>
          <p className="stocks">재고: {(item?.item_stock || 0).toLocaleString()}개</p>
          <p className="descriptions">{item?.item_description}</p>
          <p>평균 추천:<StarRating rating={item.avg_review_score} /></p>
        </div>
      </div>

      <div className="comments-sections">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3>상품 후기</h3>
          {isAdmin && (
            <button 
              onClick={() => handleEdit(item?.item_id)}
              className="edit-button"
            >
              수정
            </button>
          )}
        </div>
        {isLoggedIn ? <CommentForm /> : (
          <p className="login-requireds">
            댓글을 작성하려면 로그인이 필요합니다.
          </p>
        )}
        {renderComments()}
      </div>
    </div>
  );
}

export default ItemDetail;