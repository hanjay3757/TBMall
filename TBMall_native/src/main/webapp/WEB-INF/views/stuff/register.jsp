<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>물건 등록</title>
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
        <h2>물건 등록</h2>
        
        <c:if test="${not empty param.error}">
            <div class="error-message">
                ${param.error}
            </div>
        </c:if>
        
        <form action="/mvc/stuff/item/register" method="post" onsubmit="return validateForm()">
            <div class="form-group">
                <label>상품명</label>
                <input type="text" name="itemName" required minlength="2">
            </div>
            <div class="form-group">
                <label>가격</label>
                <input type="number" name="price" required min="100">
            </div>
            <div class="form-group">
                <label>재고</label>
                <input type="number" name="stock" required min="0">
            </div>
            <div class="form-group">
                <label>설명</label>
                <textarea name="description" rows="4"></textarea>
            </div>
            <div class="button-group">
                <button type="submit">등록</button>
                <a href="/mvc/stuff/item/list">취소</a>
            </div>
        </form>
    </div>
    
    <script>
    function validateForm() {
        var itemName = document.getElementsByName("itemName")[0].value;
        var price = document.getElementsByName("price")[0].value;
        var stock = document.getElementsByName("stock")[0].value;
        
        if (itemName.trim().length < 2) {
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
        }
        
        return true;
    }
    </script>
</body>
</html> 