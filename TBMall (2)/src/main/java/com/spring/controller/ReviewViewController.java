package com.spring.controller;

import javax.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseBody;

import com.spring.config.GlobalConfig;
import com.spring.service.ReviewService;
import com.spring.dto.ReviewDTO;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = GlobalConfig.ALLOWED_ORIGIN, allowedHeaders = "*", methods = { RequestMethod.GET,
		RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH,
		RequestMethod.OPTIONS }, allowCredentials = "true")
@RequiredArgsConstructor
public class ReviewViewController {

	private static final Logger log = LoggerFactory.getLogger(ReviewViewController.class);

	private final ReviewService reviewService;

	// URL: /reviews/list/{itemId}
	@GetMapping("/list/{itemId}")
	@ResponseBody
	public ResponseEntity<List<ReviewDTO>> getReviewListPage(@PathVariable Long itemId) {
		try {
			log.info("상품 ID {} 의 리뷰 목록 조회 요청", itemId);
			List<ReviewDTO> reviews = reviewService.getItemReviews(itemId);
			log.info("조회된 리뷰 수: {}", reviews.size());
			return ResponseEntity.ok(reviews);
		} catch (Exception e) {
			log.error("리뷰 목록 조회 실패 - 상품ID: {}", itemId, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	// URL: /reviews/my
	@GetMapping("/my")
	@ResponseBody 
	public List<ReviewDTO> getMyReviews(Model model, HttpSession session) {
		Integer memberNo = (Integer) session.getAttribute("memberNo");
		if (memberNo == null) {
			System.out.println("내 리뷰 조회 실패 - 로그인 필요");
			return null;
		}
		try {
			List<ReviewDTO> reviews = reviewService.getMemberReviews(memberNo);
			System.out.println("내 리뷰 목록 조회 - 회원번호: " + memberNo);
			System.out.println("조회된 리뷰 수: " + reviews.size());
			for (ReviewDTO review : reviews) {
				System.out.println("리뷰 이미지 URL: " + review.getImageUrl());
			}
			return reviews;
		} catch (Exception e) {
			System.out.println("내 리뷰 조회 실패 - 회원번호: " + memberNo);
			e.printStackTrace();
			return null;
		}
	}
}