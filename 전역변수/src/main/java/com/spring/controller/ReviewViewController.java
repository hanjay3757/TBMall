package com.spring.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@CrossOrigin(
    origins = "http://192.168.0.141:3000",
    allowCredentials = "true",
    allowedHeaders = "*",
    exposedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST}
)
public class ReviewViewController {
    
    private final ReviewService reviewService;
    
    @GetMapping("/list/{itemId}")
    public ResponseEntity<?> getItemReviews(@PathVariable Long itemId) {
        try {
            List<Review> reviews = reviewService.getItemReviews(itemId);
            return ResponseEntity.ok()
                               .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                               .header("Access-Control-Allow-Credentials", "true")
                               .body(reviews);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                               .header("Access-Control-Allow-Credentials", "true")
                               .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    @PostMapping("/create")
    public ResponseEntity<?> createReview(@RequestBody ReviewRequest request, HttpSession session) {
        Integer memberNo = (Integer) session.getAttribute("memberNo");
        if (memberNo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                               .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                               .header("Access-Control-Allow-Credentials", "true")
                               .body(Collections.singletonMap("error", "로그인이 필요합니다."));
        }
        
        try {
            Review review = reviewService.createReview(request.getItemId(), memberNo, 
                                                     request.getRating(), request.getContent());
            return ResponseEntity.ok()
                               .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                               .header("Access-Control-Allow-Credentials", "true")
                               .body(review);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                               .header("Access-Control-Allow-Credentials", "true")
                               .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    @GetMapping("/my")
    public ResponseEntity<?> getMyReviews(HttpSession session) {
        Integer memberNo = (Integer) session.getAttribute("memberNo");
        if (memberNo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                               .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                               .header("Access-Control-Allow-Credentials", "true")
                               .body(Collections.singletonMap("error", "로그인이 필요합니다."));
        }
        
        try {
            List<Review> reviews = reviewService.getMemberReviews(memberNo);
            return ResponseEntity.ok()
                               .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                               .header("Access-Control-Allow-Credentials", "true")
                               .body(reviews);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                               .header("Access-Control-Allow-Credentials", "true")
                               .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
} 