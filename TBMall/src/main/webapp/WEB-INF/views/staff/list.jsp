<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Staff List</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/styles.css">
    <script>
        function confirmDelete(bno) {
            if(confirm('정말 삭제하시겠습니까?')) {
                window.location.href = '/mvc/staff/remove?bno=' + bno;
            }
        }
        function editStaff(bno) {
            window.location.href = '/mvc/staff/edit?bno=' + bno;
        }
    </script>
</head>
<body>
    <div class="header">
        <h1>Staff List</h1>
        <div class="auth-buttons">
            <c:choose>
                <c:when test="${empty loginStaff}">
                    <a href="/mvc/staff/login">로그인</a>
                </c:when>
                <c:otherwise>
                    <a href="/mvc/staff/edit?bno=${loginStaff.bno}" class="edit-link">비밀번호 변경</a>
                    <a href="/mvc/staff/logout">로그아웃</a>
                </c:otherwise>
            </c:choose>
        </div>
    </div>
    <table border="1">
        <c:forEach items="${list}" var="staff">
            <tr>
                <c:if test="${loginStaff.admins == 1}">
        <tr>
            <th>No</th>
            <th>btext</th>
            <th>권한</th>
            <th>관리</th>
        </tr>
                        <td>${staff.bno}</td>
                        <td>${staff.btext}</td>
                        <td>${staff.admins == 0 ? '직원' : '관리자'}</td>
                        <td>
                        <button onclick="confirmDelete(${staff.bno})">삭제</button>
                        <button onclick="editStaff(${staff.bno})">수정</button>
                    </c:if>
                    <c:if test="${loginStaff.admins == 0}">
                        <span style="color: gray;"></span>
                    </c:if>
                </td>
            </tr>
        </c:forEach>
    </table>
    <div style="margin-top: 20px">
        <c:if test="${loginStaff.admins == 1}">
            <a href="${pageContext.request.contextPath}/staff/removelist">삭제된 직원 목록 보기</a>
        </c:if>
    </div>
</body>
</html>