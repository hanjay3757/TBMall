<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>물건 목록</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/styles.css">
</head>
<body>
    <div class="top-menu">
        <h1 class="section-title" style="margin: 0;">물건 목록</h1>
        <div>
            <c:if test="${param.message eq 'addedToCart'}">
                <span style="color: green; margin-right: 20px;">장바구니에 추가되었습니다!</span>
            </c:if>
            <a href="/mvc/stuff/cart" class="cart-link">
                🛒 장바구니
            </a>
        </div>
    </div>
    
    <c:if test="${loginStaff.admins == 1}">
        <div class="admin-menu">
            <a href="/mvc/stuff/item/register">물건 등록</a>
            <a href="/mvc/stuff/item/deleted">삭제된 물건 목록</a>
            <a href="/mvc/staff/removelist">삭제된 직원 목록</a>
        </div>
    </c:if>
    <button onclick="window.location.href='/mvc/staff/edit?bno=${loginStaff.bno}'" class="edit-link">비밀번호 변경</button>
    <c:if test="${empty loginStaff}">
        <button onclick="window.location.href='/mvc/staff/login'">로그인</button>
    </c:if>
    <div class="item-grid">
        <c:forEach items="${items}" var="item">
            <div class="item-card">
                <h3>${item.itemName}</h3>
                <p>가격: <fmt:formatNumber value="${item.price}" pattern="#,###"/>원</p>
                <p>재고: <fmt:formatNumber value="${item.stock}" pattern="#,###"/>개</p>
                <form action="/mvc/stuff/cart/add" method="post">
                    <input type="hidden" name="itemId" value="${item.itemId}">
                    <input type="number" name="quantity" min="1" max="${item.stock}" value="1">
                    <button type="submit">장바구니에 추가</button>
                </form>
                <c:if test="${loginStaff.admins == 1}">
                    <button onclick="editStuffItem('${item.itemId}')">수정</button>
                    <button onclick="deleteStuffItem('${item.itemId}')">삭제</button>
                </c:if>
            </div>
        </c:forEach>
    </div>

    <c:if test="${loginStaff.admins == 1}">
        <h2 class="section-title">직원 목록</h2>
        <table class="staff-table">
            <tr>
                <th>직원번호</th>
                <th>아이디</th>
                <th>이름</th>
                <th>관리자 여부</th>
                <th>관리</th>
            </tr>
            <c:forEach items="${staffList}" var="staff">
                <tr>
                    <td>${staff.bno}</td>
                    <td>${staff.id}</td>
                    <td>${staff.btext}</td>
                    <td>${staff.admins == 1 ? '관리자' : '일반 직원'}</td>
                    <td>
                        <button onclick="confirmDelete(${staff.bno})">삭제</button>
                        <button onclick="editStaff(${staff.bno})">수정</button>
                       
                    </td>
                </tr>
            </c:forEach>
        </table>
    </c:if>
    
    <script>
    function editStuffItem(itemId) {
        window.location.href = '/mvc/stuff/item/edit?itemId=' + itemId;
    }

    function deleteStuffItem(itemId) {
        if(confirm('이 물건을 삭제하시겠습니까?')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/mvc/stuff/item/delete';
            
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'itemId';
            input.value = itemId;
            
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        }
    }

    function confirmDelete(bno) {
        if(confirm('이 직원을 삭제하시겠습니까?')) {
            window.location.href = '/mvc/staff/remove?bno=' + bno;
        }
    }

    function editStaff(bno) {
        window.location.href = '/mvc/staff/edit?bno=' + bno;
    }
    </script>
</body>
</html>