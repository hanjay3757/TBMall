<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>로그인</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/styles.css">
    <script>
        function redirectToList() {
            window.location.href = '/stuff/item/list';
        }
    </script>
</head>
<body>
    <div class="login-container">
        <h2 style="text-align: center;">로그인</h2>
        
        <c:if test="${not empty error}">
            <div class="error-message">
                ${error}
            </div>
        </c:if>
        
        <form action="./login" method="post" onsubmit="redirectToList()">
            <div class="form-group">
                <label for="staffId">아이디</label>
                <input type="text" id="staffId" name="staffId" required>
            </div>
            
            <div class="form-group">
                <label for="password">비밀번호</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="login-btn">로그인</button>
        </form>
    </div>
</body>
</html> 