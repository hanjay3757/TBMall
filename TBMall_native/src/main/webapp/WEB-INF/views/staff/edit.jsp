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
    <div class="edit-form">
        <h2>정보 수정</h2>
        <form action="/mvc/staff/edit" method="post">
            <input type="hidden" name="bno" value="${staff.bno}">
            
            <c:if test="${loginStaff.admins == 1}">
                <div class="form-group">
                    <label>이름</label>
                    <input type="text" name="btext" value="${staff.btext}" required>
                </div>
                
                <div class="form-group">
                    <label>권한</label>
                    <select name="admins">
                        <option value="0" ${staff.admins == 0 ? 'selected' : ''}>일반 직원</option>
                        <option value="1" ${staff.admins == 1 ? 'selected' : ''}>관리자</option>
                    </select>
                </div>
            </c:if>
            
            <div class="form-group">
                <label>현재 비밀번호</label>
                <input type="password" name="currentPassword" placeholder="현재 비밀번호 입력" required>
            </div>
            
            <div class="form-group">
                <label>새 비밀번호</label>
                <input type="password" name="password" placeholder="변경할 비밀번호 입력" required>
            </div>
            
            <div class="form-group">
                <label>비밀번호 확인</label>
                <input type="password" id="passwordConfirm" placeholder="비밀번호 다시 입력" required>
            </div>
            
            <div class="button-group">
                <button type="submit" onclick="return validatePassword()">수정</button>
                <button type="button" onclick="location.href='/mvc/staff/list'">취소</button>
            </div>
        </form>
    </div>
    
    <script>
    function validatePassword() {
        var currentPassword = document.getElementsByName("currentPassword")[0].value;
        var password = document.getElementsByName("password")[0].value;
        var passwordConfirm = document.getElementById("passwordConfirm").value;
        
        if (!currentPassword) {
            alert("현재 비밀번호를 입력해주세요.");
            return false;
        }
        
        if (password !== passwordConfirm) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return false;
        }
        
        if (password === currentPassword) {
            alert("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
            return false;
        }
        
        return true;
    }
    </script>
</body>
</html> 