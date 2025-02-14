package com.spring.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewDTO {
    private Integer reviewId;
    private Long itemId;
    private Integer memberNo;
    private String memberNick;
    private Double rating;
    private String reviewContent;
    private String reviewDate;
    private String imageUrl;
    
    public void setReviewId(Integer reviewId) {
        this.reviewId = reviewId;
    }
}