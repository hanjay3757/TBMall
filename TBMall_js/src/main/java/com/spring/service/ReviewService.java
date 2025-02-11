package com.spring.service;

import java.util.List;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.spring.dto.ReviewDTO;
import com.spring.mapper.ReviewMapper;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);
    
    private final ReviewMapper reviewMapper;
    
    public void createReview(ReviewDTO reviewDTO) {
        reviewMapper.insertReview(reviewDTO);
    }
    
    public void updateReview(ReviewDTO reviewDTO) {
        reviewMapper.updateReview(reviewDTO);
    }
    
    public void deleteReview(Integer reviewId) {
        reviewMapper.deleteReview(reviewId);
    }
    
    public ReviewDTO getReview(Integer reviewId) {
        return reviewMapper.getReviewById(reviewId);
    }
    
    public List<ReviewDTO> getItemReviews(Long itemId) {
        try {
            log.info("상품 ID {} 에 대한 리뷰 조회 시작", itemId);
            List<ReviewDTO> reviews = reviewMapper.getReviewsByItemId(itemId);
            log.info("조회된 리뷰 수: {}", reviews.size());
            return reviews;
        } catch (Exception e) {
            log.error("리뷰 조회 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("리뷰 목록을 가져오는데 실패했습니다.", e);
        }
    }
    
    public List<ReviewDTO> getMemberReviews(Integer memberNo) {
        return reviewMapper.getReviewsByMemberNo(memberNo);
    }
} 