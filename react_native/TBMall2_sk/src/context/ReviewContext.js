import React, { createContext, useState, useContext } from 'react';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState({});  // productId를 키로 사용

  const addReview = (productId, review) => {
    setReviews(prev => ({
      ...prev,
      [productId]: [...(prev[productId] || []), { ...review, id: Date.now() }]
    }));
  };

  const deleteReview = (productId, reviewId) => {
    setReviews(prev => ({
      ...prev,
      [productId]: prev[productId].filter(review => review.id !== reviewId)
    }));
  };

  const getProductReviews = (productId) => {
    return reviews[productId] || [];
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        addReview,
        deleteReview,
        getProductReviews,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => useContext(ReviewContext); 