<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@page import="com.spring.dto.StaffDto"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>삭제된 물건 목록</title>
    <style>
        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .item-table th, .item-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
        }
        .restore-btn {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 3px;
        }
    </style>
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
            </tr>
        </c:forEach>
    </table>
    
    <div style="margin-top: 20px">
        <a href="/mvc/stuff/item/list">물건 목록으로 돌아가기</a>
    </div>
</body>
</html> 