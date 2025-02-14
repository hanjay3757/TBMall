<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>장바구니</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/styles.css">
</head>
<body>
    <h1>장바구니</h1>
    
    <table class="cart-table">
        <tr>
            <th>상품명</th>
            <th>수량</th>
            <th>가격</th>
            <th>총액</th>
            <th>관리</th>
        </tr>
        <c:forEach items="${cartItems}" var="item">
            <tr>
                <td>${item.itemName}</td>
                <td><fmt:formatNumber value="${item.quantity}" pattern="#,###"/>개</td>
                <td><fmt:formatNumber value="${item.price}" pattern="#,###"/>원</td>
                <td><fmt:formatNumber value="${item.price * item.quantity}" pattern="#,###"/>원</td>
                <td>
                    <form action="/mvc/stuff/cart/remove" method="post">
                        <input type="hidden" name="cartId" value="${item.cartId}">
                        <button type="submit">삭제</button>
                    </form>
                </td>
            </tr>
        </c:forEach>
    </table>
    
    <div class="cart-summary">
        <c:set var="totalAmount" value="0" />
        <c:forEach items="${cartItems}" var="item">
            <c:set var="totalAmount" value="${totalAmount + (item.price * item.quantity)}" />
        </c:forEach>
        <h3>총 결제금액: <fmt:formatNumber value="${totalAmount}" pattern="#,###"/>원</h3>
    </div>
    
    <div class="button-group">
        <a href="/mvc/stuff/item/list" class="btn">쇼핑 계속하기</a>
        <c:if test="${not empty cartItems}">
            <form action="/mvc/stuff/cart/checkout" method="post" style="display: inline;">
                <button type="submit" class="btn btn-primary" 
                        onclick="return confirm('결제하시겠습니까? 총액: <fmt:formatNumber value="${totalAmount}" pattern="#,###"/>원')">
                    결제하기
                </button>
            </form>
        </c:if>
    </div>
</body>
</html> 