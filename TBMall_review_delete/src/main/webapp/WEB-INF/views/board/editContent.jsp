<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>글 수정</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/styles.css">
</head>
<body>
    <div class="edit-form">
        <h2>글 수정</h2>
        
        <form action="/mvc/board/editContent" method="post" onsubmit="return validateForm()">
            <input type="hidden" name="board_no" value="${boardData.boardNo}">
            <input type="hidden" name="member_no" value="${boardData.memberNo}">
            <div class="form-group">
                <label>글 제목</label>
                <input type="text" name="board_title" value="${boardData.board_title}" >
            </div>
            <div class="form-group">
                <label>글 내용</label>
                <textarea name="board_content" rows="4">${boardData.board_content}</textarea>
            </div>
            <div class="button-group">
                <button type="submit">수정</button>
            </div>
        </form>
    </div>
    
    <script>
    function validateForm() {
        var board_title = document.getElementsByName("board_title")[0].value;
        var board_content = document.getElementsByName("board_content")[0].value;
        
        
       /*  if (itemName.trim().length < 2) {
            alert("상품명은 2자 이상이어야 합니다.");
            return false;
        }
        
        if (price < 100) {
            alert("가격은 100원 이상이어야 합니다.");
            return false;
        }
        
        if (stock < 0) {
            alert("재고는 0개 이상이어야 합니다.");
            return false;
        } */
        
        return true;
    }
    </script>
</body>
</html> 