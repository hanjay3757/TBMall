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
  const [memberNo, setMemberNo] = useState(null); // 멤버 번호 상태 추가

  // 댓글 목록 로드 함수 정의
  const loadComments = async (itemId) => {
    try {
      const response = await axios.get(`${SERVER_URL}/mvc/board/commentlist`, {
        params: { 
          item_id: itemId,
          currentComment: currentComment, 
          cpageSize: cpageSize 
        },
        withCredentials: true
      });

      if (response.data && Array.isArray(response.data.comments)) {
        setComments(response.data.comments);
        setTotalComment(response.data.totalComment || 0);
        setCurrentComment(response.data.currentComment || 1);
      } else {
        setComments([]);
        setTotalComment(0);
      }
    } catch (error) {
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

      if (response.data && response.data.isLoggedIn) {
        setIsLoggedIn(true);
        setIsAdmin(response.data.isAdmin);
        setMemberNo(response.data.admin_no); // 멤버 번호 저장
        localStorage.setItem('member_no', response.data.admin_no);
        localStorage.setItem('member_role', response.data.isAdmin ? 'ROLE_ADMIN' : 'ROLE_USER');
        setUserInfo(response.data);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setMemberNo(null);
        localStorage.removeItem('member_no');
        localStorage.removeItem('member_role');
        setUserInfo(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setMemberNo(null);
      setUserInfo(null);
    }
  };

  // 상품 정보와 댓글 목록 로드
  useEffect(() => {
    // 장바구니 관련 리다이렉트 처리
    const params = new URLSearchParams(location.search);
    const redirectFrom = params.get('from');
    if (redirectFrom === 'cart') {
      return; // 장바구니에서 온 경우 상세 페이지 로드 중단
    }

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
        alert('상품 정보를 불러오는데 실패했습니다.');
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    // 로그인 상태 체크 및 사용자 정보 로드
    const storedMemberNo = localStorage.getItem('member_no');
    if (storedMemberNo) {
      setIsLoggedIn(true);
      setMemberNo(storedMemberNo);
      const memberRole = localStorage.getItem('member_role');
      setIsAdmin(memberRole === 'ROLE_ADMIN');
      setUserInfo({
        member_no: storedMemberNo,
        member_role: memberRole
      });
    }

    const loadData = async () => {
      await checkLoginStatus();
      await loadItemDetail();
      if (itemId) {
        await loadComments(itemId);
      }
    };
    
    loadData();

    // 로그인 상태 변경 감지를 위한 이벤트 리스너
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [itemId, currentComment, location.search]);

  // 댓글 작성 함수 - 새로운 댓글을 서버에 전송
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해 주세요.');
      return;
    }

    try {
      // 로그인 여부 확인
      if (!memberNo) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/staff/login');
        return;
      }

      // 1. 세션에 상품 정보 저장 및 로그인 상태 확인
      const sessionResponse = await axios.get(
        `${SERVER_URL}/mvc/board/comment`,
        {
          params: { 
            item_id: Number(itemId),
            member_no: memberNo  // 현재 로그인한 사용자의 member_no를 전달
          },
          withCredentials: true
        }
      );

      // 로그인 세션이 만료된 경우 처리
      if (sessionResponse.data === 'redirect:/staff/login') {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/staff/login');
        return;
      }

      // 2. 댓글 데이터 구성 - 작성자 식별을 위해 member_no 포함
      const commentData = {
        comment_content: newComment.trim(),
        member_no: memberNo  // 이 member_no로 작성자를 식별
      };

      // 3. 댓글 등록 요청
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

      if (response.data.success) {
        setNewComment('');
        await loadComments(itemId);
        alert('댓글이 등록되었습니다.');
      } else {
        throw new Error(response.data.message || '댓글 등록에 실패했습니다.');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/staff/login');
      } else {
        alert(error.response?.data?.message || '댓글 작성에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 댓글 삭제 함수 수정
  const handleDelete = async (item_id, member_no) => {
    try {
      const memberRole = localStorage.getItem('member_role');
      if (memberRole !== 'ROLE_ADMIN') {
        alert('관리자만 댓글을 삭제할 수 있습니다.');
        return;
      }

      const confirmDelete = window.confirm('정말로 이 댓글을 삭제하시겠습니까?');
      if (!confirmDelete) {
        return;
      }

      const deleteUrl = `${SERVER_URL}/mvc/board/comment/${item_id}/${member_no}`;
      const response = await axios.delete(deleteUrl, {
        withCredentials: true
      });

      if (response.data.success) {
        alert('댓글이 성공적으로 삭제되었습니다.');
        await loadComments(itemId);
      } else {
        throw new Error(response.data.message || '댓글 삭제에 실패했습니다.');
      }
    } catch (error) {
      alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCommentPageChange = (page) => {
    if (page >= 1 && page <= totalComment) {
      setCurrentComment(page);
    }
  };

  // 댓글 목록 표시 컴포넌트
  const renderComments = () => {
    if (!comments || comments.length === 0) {
      return <p className="no-comments">등록된 댓글이 없습니다.</p>;
    }

    // 관리자 권한 확인
    const isAdminUser = userInfo?.isAdmin || userInfo?.delete_right_no === 1;

    return (
      <div className="comments-containers">
        {comments.map((comment, index) => {
          // 각 댓글을 고유하게 식별하기 위한 키 생성
          const uniqueKey = `${comment.item_id}-${comment.member_no}-${index}`;

          return (
            <div key={uniqueKey} className="comment-items">
              <div className="comment-headers">
                {/* member_no에 해당하는 사용자의 닉네임 표시 */}
                <span className="comment-authors">{comment.member_nick || '익명'}</span>
                <span className="comment-dates">
                  {new Date(comment.comment_writedate).toLocaleDateString()}
                </span>
              </div>
              <p className="comment-contents">{comment.comment_content}</p>
              {/* 관리자만 삭제 버튼 표시 */}
              {isAdminUser && (
                <button
                  onClick={() => {
                    // item_id와 member_no로 특정 댓글 식별하여 삭제
                    handleDelete(comment.item_id, comment.member_no);
                  }}
                  className="delete-btns"
                >
                  삭제
                </button>
              )}
            </div>
          );
        })}
        
        {/* 페이지네이션 컨트롤 */}
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

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      if (!localComment.trim()) {
        alert('댓글 내용을 입력해 주세요.');
        return;
      }

      try {
        setIsSubmitting(true);
        if (!memberNo) {
          alert('로그인이 필요한 서비스입니다.');
          navigate('/staff/login');
          return;
        }

        const sessionResponse = await axios.get(
          `${SERVER_URL}/mvc/board/comment`,
          {
            params: { 
              item_id: Number(itemId),
              member_no: memberNo
            },
            withCredentials: true
          }
        );

        if (sessionResponse.data === 'redirect:/staff/login') {
          alert('로그인이 필요한 서비스입니다.');
          navigate('/staff/login');
          return;
        }

        const commentData = {
          comment_content: localComment.trim(),
          member_no: memberNo
        };

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

        if (response.data.success) {
          setLocalComment('');
          await loadComments(itemId);
          alert('댓글이 등록되었습니다.');
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          alert('로그인이 필요한 서비스입니다.');
          navigate('/staff/login');
        } else {
          alert(error.response?.data?.message || '댓글 작성에 실패했습니다. 다시 시도해주세요.');
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="comment-forms">
        <textarea
          value={localComment}
          onChange={(e) => setLocalComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          required
          disabled={isSubmitting}
          rows={4}
          className="comment-textareas"
        />
        <button type="submits" disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '댓글 작성'}
        </button>
      </form>
    );
  };

  // 수정 버튼 핸들러 추가
  const handleEdit = async (item_id) => {
    try {
      if (!isAdmin) {
        alert('관리자만 수정할 수 있습니다.');
        return;
      }

      navigate(`/stuff/item/edit?itemId=${item_id}`);
    } catch (error) {
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
        </div>
      </div>

      <div className="comments-sections">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3></h3>
          {isAdmin && (
            <button 
              onClick={() => handleEdit(item?.item_id)}
              className="edit-buttonss"
              style={{ padding: '15px 15px', fontSize: '0.8rem' , marginBottom: '10px'}}
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
