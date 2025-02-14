<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>사원 등록</title>
    <style>
        .register-form {
            width: 500px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ddd;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
        }
        .form-group input, .form-group textarea {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
        }
        .error-message {
            color: red;
            margin-bottom: 10px;
        }
        .button-group {
            margin-top: 20px;
            text-align: center;
        }
        .button-group button, .button-group a {
            padding: 8px 20px;
            margin: 0 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
        }
        .button-group button {
            background-color: #4CAF50;
            color: white;
        }
        .button-group a {
            background-color: #f44336;
            color: white;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="register-form">
        <h2>사원 등록</h2>
        
        <c:if test="${not empty param.error}">
            <div class="error-message">
                ${param.error}
            </div>
        </c:if>
        
        <form action="/mvc/staff/register" method="post" onsubmit="return validateForm()">
            <div class="form-group">
                <label>id</label>
                <input type="text" name="member_id" required minlength="2">
            </div>
            <div class="form-group">
                <label>비밀번호</label>
                <input type="number" name="member_pw" required min="2">
            </div>
            <div class="form-group">
                <label>사원명</label>
                <input type="number" name="member_nick" required min="0">
            </div>
            <div class="form-group">
                <label>성별</label>
                <textarea name="member_gender" ></textarea>
            </div>
            <div class="form-group">
                <label>생일</label>
                <textarea name="member_birth"></textarea>
            </div>
            <div class="form-group">
                <label>전화번호</label>
                <textarea name="member_gender" ></textarea>
            </div>
            <div class="form-group">
                <label>이메일</label>
                <textarea name="member_gender" ></textarea>
            </div>
            
            <div class="button-group">
                <button type="submit">등록</button>
                <a href="/mvc/stuff/item/list">취소</a>
            </div>
        </form>
    </div>
    
    <script>
    function validateForm() {
        var member_id = document.getElementsByName("member_id")[0].value;
        var member_pw = document.getElementsByName("member_pw")[0].value;
        var member_nick = document.getElementsByName("member_nick")[0].value;
        
        if (member_id.trim().length < 2) {
            alert("id는 2자 이상이어야 합니다.");
            return false;
        }
        
        if (member_pw < 2) {
            alert("pw는 2 이상이어야 합니다.");
            return false;
        }
        
        if (member_nick < 0) {
            alert("사원명은 0 이상이어야 합니다.");
            return false;
        }
        
        return true;
    }
    </script>
</body>
</html> 