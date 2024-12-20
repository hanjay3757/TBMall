<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>비밀번호 변경</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/styles.css">
</head>
<body>
    <div class="password-form">
        <h2>비밀번호 변경</h2>
        <form action="/mvc/staff/changePassword" method="post" onsubmit="return validatePassword()">
            <input type="hidden" name="bno" value="${staff.bno}">
            
            <div class="form-group">
                <label>새 비밀번호</label>
                <input type="password" name="password" required>
            </div>
            
            <div class="form-group">
                <label>비밀번호 확인</label>
                <input type="password" id="passwordConfirm" required>
            </div>
            
            <div class="button-group">
                <button type="submit">변경</button>
                <button type="button" onclick="location.href='/mvc/stuff/item/list'">취소</button>
            </div>
        </form>
    </div>
    
</body>
</html> 