<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<c:set var="cp" value="${pageContext.request.contextPath}" />

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>삭제된 직원 목록</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/styles.css">
    <script>
        function confirmRestore(member_no) {
            if(confirm('이 직원을 복구하시겠습니까?')) {
                document.getElementById('restoreForm_' + member_no).submit();
            }
        }
    </script>
</head>
<body>
    <h1>삭제된 직원 목록</h1>
    
    <c:if test="${param.error eq 'auth'}">
        <div style="color: red; margin-bottom: 10px;">
            관리자만 복구할 수 있습니다.
        </div>
    </c:if>
    
    <table class="staff-grid">
        <tr>
            <th>번호</th>
            <th>이름</th>
            <th>권한</th>
            <th>관리</th>
        </tr>
        <c:forEach items="${list}" var="staff" varStatus="status">
            <tr>
                <td>${status.index + 1}</td>
                <td>${staff.member_nick}</td>
                <td>${staff.admins == 0 ? '직원' : '관리자'}</td>
                <td>
                    <c:if test="${loginStaff.admins == 1}">
                        <form id="restoreForm_${staff.member_no}" action="${cp}/staff/restore" method="post">
                            <input type="hidden" name="member_no" value="${staff.member_no}">
                            <button type="button" class="restore-btn" onclick="confirmRestore(${staff.member_no})">복구</button>
                        </form>
                    </c:if>
                    <c:if test="${loginStaff.admins == 0}">
                        <span style="color: gray;">복구 권한 없음</span>
                    </c:if>
                </td>
            </tr>
        </c:forEach>
    </table>
</body>
</html>
