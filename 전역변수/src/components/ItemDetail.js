import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ItemDetail.css';

function ItemDetail({ isLoggedIn }) {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    content: ''
  });
  const [loading, setLoading] = useState(true);

  // 상품 정보 로드
  useEffect(() => {
    const loadItemDetail = async () => {
      try {
        const response = await axios.get(`/stuff/item/detail/${itemId}`, {
          withCredentials: true
        });
        setItem(response.data);
      } catch (error) {
        console.error('상품 정보 로딩 실패:', error);
        alert('상품 정보를 불러오는데 실패했습니다.');
      }
    };

    // 리뷰 목록 로드
    const loadReviews = async () => {
      try {
        const response = await axios.get(`/reviews/list/${itemId}`, {
          withCredentials: true
        });
        setReviews(response.data);
      } catch (error) {
        console.error('리뷰 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItemDetail();
    loadReviews();
  }, [itemId]);

  // 리뷰 작성 처리
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('리뷰를 작성하려면 로그인이 필요합니다.');
      return;
    }

    try {
      const response = await axios.post(`/reviews/add/${itemId}`, {
        rating: newReview.rating,
        content: newReview.content
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        alert('리뷰가 등록되었습니다.');
        setReviews([response.data.review, ...reviews]);
        setNewReview({ rating: 5, content: '' });
      }
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      alert('리뷰 등록에 실패했습니다.');
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
        <div className="item-image">
          <img 
            src={item.image_url || 'https://via.placeholder.com/400x400'} 
            alt={item.item_name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400';
            }}
          />
        </div>
        <div className="item-info">
          <h2>{item.item_name}</h2>
          <p className="price">가격: {item.item_price.toLocaleString()}원</p>
          <p className="stock">재고: {item.item_stock.toLocaleString()}개</p>
          <p className="description">{item.item_description}</p>
        </div>
      </div>

      <div className="review-section">
        <h3>상품 리뷰</h3>
        
        {isLoggedIn && (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <div className="rating-select">
              <label>평점:</label>
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview({...newReview, rating: e.target.value})}
              >
                {[5,4,3,2,1].map(num => (
                  <option key={num} value={num}>{num}점</option>
                ))}
              </select>
            </div>
            <textarea
              value={newReview.content}
              onChange={(e) => setNewReview({...newReview, content: e.target.value})}
              placeholder="리뷰를 작성해주세요"
              required
            />
            <button type="submit">리뷰 작성</button>
          </form>
        )}

        <div className="review-list">
          {reviews.length === 0 ? (
            <p>아직 리뷰가 없습니다.</p>
          ) : (
            reviews.map(review => (
              <div key={review.review_id} className="review-item">
                <div className="review-header">
                  <span className="review-rating">{'★'.repeat(review.rating)}</span>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="review-content">{review.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetail; 