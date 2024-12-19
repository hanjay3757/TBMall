<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>

<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
</head>
<body>
    <div class="write-form">
        <h2>물건 등록</h2>
        
        <c:if test="${not empty param.error}">
            <div class="error-message">
                ${param.error}
            </div>
        </c:if>
        
        <form action="/mvc/board/register" method="post" onsubmit="return validateForm()">
            <div class="form-group">
                <label>글 제목</label>
                <input type="text" name="board_title">
            </div>
            <div class="form-group">
                <label>글 쓴이</label>
                <input type="text" name="member_no" >
            </div>
            
            <div class="form-group">
                <label>글 내용</label>
                <textarea name="board_content" rows="4"></textarea>
            </div>
            <div class="button-group">
                <button type="submit">등록</button>
                <a href="/mvc/board/list">취소</a>
            </div>
        </form>
    </div>
</body>
</html>