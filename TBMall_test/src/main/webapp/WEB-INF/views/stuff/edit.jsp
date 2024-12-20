<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>물건 수정</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/styles.css">
</head>
<body>
    <div class="edit-form">
        <h2>물건 수정</h2>
        
        <form action="/mvc/stuff/item/edit" method="post" onsubmit="return validateForm()">
            <input type="hidden" name="itemId" value="${item.itemId}">
            <div class="form-group">
                <label>상품명</label>
                <input type="text" name="itemName" value="${item.itemName}" required minlength="2">
            </div>
            <div class="form-group">
                <label>가격</label>
                <input type="number" name="price" value="${item.price}" required min="100">
            </div>
            <div class="form-group">
                <label>재고</label>
                <input type="number" name="stock" value="${item.stock}" required min="0">
            </div>
            <div class="form-group">
                <label>설명</label>
                <textarea name="description" rows="4">${item.description}</textarea>
            </div>
            <div class="button-group">
                <button type="submit">수정</button>
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