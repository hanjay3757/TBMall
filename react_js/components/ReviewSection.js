import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReviewSection.css';

function ReviewSection({ itemId, isLoggedIn }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    content: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [itemId]);

  const loadReviews = async () => {
    try {
      const response = await axios.get(`/reviews/list/${itemId}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      setReviews(response.data);
    } catch (error) {
      console.error('리뷰 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('리뷰를 작성하려면 로그인이 필요합니다.');
      return;
    }

    try {
      await axios.post('/reviews/create', {
        itemId: itemId,
        rating: newReview.rating,
        content: newReview.content
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setNewReview({ rating: 5, content: '' });
      loadReviews();
      alert('리뷰가 등록되었습니다.');
    } catch (error) {
      alert('리뷰 등록에 실패했습니다.');
    }
  };

  return (
    <div className="review-section">
      <h3>상품 리뷰</h3>
      
      {isLoggedIn && (
        <form onSubmit={handleSubmitReview} className="review-form">
          <div className="rating-input">
            <label>별점:</label>
            <select 
              value={newReview.rating}
              onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
            >
              <option value="5">★★★★★</option>
              <option value="4">★★★★☆</option>
              <option value="3">★★★☆☆</option>
              <option value="2">★★☆☆☆</option>
              <option value="1">★☆☆☆☆</option>
            </select>
          </div>
          
          <textarea
            value={newReview.content}
            onChange={(e) => setNewReview({...newReview, content: e.target.value})}
            placeholder="리뷰를 작성해주세요"
            required
          />
          <button type="submit">리뷰 등록</button>
        </form>
      )}

      <div className="reviews-list">
        {loading ? (
          <p>리뷰를 불러오는 중...</p>
        ) : reviews.length === 0 ? (
          <p>아직 리뷰가 없습니다.</p>
        ) : (
          reviews.map((review, index) => (
            <div key={index} className="review-item">
              <div className="review-header">
                <span className="review-rating">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                </span>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="review-content">{review.content}</p>
              <p className="review-author">작성자: {review.memberNick}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReviewSection; 