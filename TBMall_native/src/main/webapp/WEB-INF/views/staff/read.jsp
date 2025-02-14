<%@page import="com.spring.dto.StaffDto"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
<%
	StaffDto read = (StaffDto)request.getAttribute("read");
	long bno = read.getMember_no();
	String btext = read.getMember_id();
%>	

글본문
글번호:<%=bno %>
글내용:<%=btext %>
</body>
</html>