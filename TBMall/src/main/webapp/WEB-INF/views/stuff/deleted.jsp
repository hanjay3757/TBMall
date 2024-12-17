<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>삭제된 물건 목록</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/styles.css">
</head>
<body>
    <h1>삭제된 물건 목록</h1>
    
    <table class="item-table">
        <tr>
            <th>상품명</th>
            <th>가격</th>
            <th>재고</th>
            <th>관리</th>
        </tr>
        <c:forEach items="${items}" var="item">
            <tr>
                <td>${item.itemName}</td>
                <td>${item.price}원</td>
                <td>${item.stock}개</td>
                <td>
                    <form action="/mvc/stuff/item/restore" method="post" style="display: inline;">
                        <input type="hidden" name="itemId" value="${item.itemId}">
                        <button type="submit" class="restore-btn">복구</button>
                    </form>
                </td>
        </c:forEach>
            </tr>
    </table>
    
    <div style="margin-top: 20px">
        <a href="/mvc/stuff/item/list">물건 목록으로 돌아가기</a>
    </div>
</body>
</html> 