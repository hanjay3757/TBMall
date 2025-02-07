package com.spring.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.dto.ReviewDTO;

@Mapper
public interface ReviewMapper {
    // 리뷰 등록
    void insertReview(ReviewDTO reviewDTO);
    
    // 리뷰 수정
    void updateReview(ReviewDTO reviewDTO);
    
    // 리뷰 삭제
    void deleteReview(Integer reviewId);
    
    // 특정 리뷰 조회
    ReviewDTO getReviewById(Integer reviewId);
    
    // 상품별 리뷰 목록 조회
    List<ReviewDTO> getReviewsByItemId(Long itemId);
    
    // 회원별 리뷰 목록 조회
    List<ReviewDTO> getReviewsByMemberNo(Integer memberNo);
}