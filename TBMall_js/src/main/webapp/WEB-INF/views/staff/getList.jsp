<%@page import="com.spring.dto.StaffDto"%>
<%@page import="com.spring.dto.StaffDto"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
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
	//Model 에 "list" 라는 키로 넣은 객체를 request 내장객체에서 빼올 수 있음.
	
	Object o = request.getAttribute("list");
	ArrayList<StaffDto> list = (ArrayList<StaffDto>)o; 
	for(int i=0;i<list.size();i++){
		Long bno = list.get(i).getMember_no();
		String btext = list.get(i).getMember_id();
%>		
		<%=bno %>	
		<%=btext %>	
		<hr>  
<%		
	}

%>
</body>
</html>