<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>상품 리뷰 목록</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .star-rating { color: #ffd700; }
        .review-image { 
            max-width: 200px; 
            max-height: 200px; 
            object-fit: cover;
        }
        .review-card {
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container mt-5">
        <h2 class="mb-4">상품 리뷰</h2>
        
        <c:if test="${not empty sessionScope.memberNo}">
            <button type="button" class="btn btn-primary mb-4" data-bs-toggle="modal" data-bs-target="#writeReviewModal">
                리뷰 작성
            </button>
        </c:if>

        <div class="row">
            <c:forEach items="${reviews}" var="review">
                <div class="col-md-6 mb-4">
                    <div class="card review-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <span class="fw-bold me-2">${review.memberNick}</span>
                                    <span class="star-rating">
                                        <c:forEach begin="1" end="5" var="i">
                                            <i class="fas fa-star${review.rating >= i ? ' text-warning' : ' text-secondary'}"></i>
                                        </c:forEach>
                                    </span>
                                </div>
                                <small class="text-muted">${review.reviewDate}</small>
                            </div>
                            
                            <c:if test="${not empty review.imageUrl}">
                                <img src="${review.imageUrl}" class="review-image img-fluid mb-3" alt="리뷰 이미지">
                            </c:if>
                            
                            <p class="card-text">${review.reviewContent}</p>
                            
                            <c:if test="${sessionScope.memberNo eq review.memberNo}">
                                <div class="d-flex justify-content-end">
                                    <button class="btn btn-sm btn-outline-primary me-2" 
                                            onclick="editReview(${review.reviewId})">수정</button>
                                    <button class="btn btn-sm btn-outline-danger" 
                                            onclick="deleteReview(${review.reviewId})">삭제</button>
                                </div>
                            </c:if>
                        </div>
                    </div>
                </div>
            </c:forEach>
            
            <c:if test="${empty reviews}">
                <div class="col-12 text-center">
                    <p>등록된 리뷰가 없습니다.</p>
                </div>
            </c:if>
        </div>
    </div>

    <!-- 리뷰 작성 모달 -->
    <div class="modal fade" id="writeReviewModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">리뷰 작성</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="reviewForm">
                        <input type="hidden" name="itemId" value="${itemId}">
                        <input type="hidden" name="memberNo" value="${sessionScope.memberNo}">
                        <div class="mb-3">
                            <label class="form-label">평점</label>
                            <select class="form-select" name="rating" required>
                                <option value="5">5점</option>
                                <option value="4">4점</option>
                                <option value="3">3점</option>
                                <option value="2">2점</option>
                                <option value="1">1점</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">리뷰 내용</label>
                            <textarea class="form-control" name="reviewContent" rows="3" required></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">이미지 첨부</label>
                            <input type="file" class="form-control" name="image" accept="image/*">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                    <button type="button" class="btn btn-primary" onclick="submitReview()">등록</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function submitReview() {
            const form = document.getElementById('reviewForm');
            const formData = new FormData(form);
            
            fetch('/mvc/api/reviews', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if(response.ok) {
                    alert('리뷰가 등록되었습니다.');
                    location.reload();
                } else {
                    alert('리뷰 등록에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('리뷰 등록 중 오류가 발생했습니다.');
            });
        }

        function editReview(reviewId) {
            // 리뷰 수정 로직 구현
        }

        function deleteReview(reviewId) {
            if(confirm('리뷰를 삭제하시겠습니까?')) {
                fetch(`/mvc/api/reviews/${reviewId}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if(response.ok) {
                        alert('리뷰가 삭제되었습니다.');
                        location.reload();
                    } else {
                        alert('리뷰 삭제에 실패했습니다.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('리뷰 삭제 중 오류가 발생했습니다.');
                });
            }
        }
    </script>
</body>
</html> 