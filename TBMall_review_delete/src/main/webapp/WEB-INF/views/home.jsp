<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page session="false" %>
<html>
<head>
    <title>Home</title>
    <script type="text/javascript">
        // Function to update the countdown every second
        var countdown = 4;  // Starting countdown from 4 seconds
        function updateCountdown() {
            if (countdown > 0) {
                document.getElementById("countdown").innerHTML = "You will be redirected in " + countdown + " seconds...";
                countdown--;
            } else {
                window.location.href = "./stuff/item/list";  // Redirect after countdown reaches 0
            }
        }

        // Update countdown every second
        setInterval(updateCountdown, 1000);
    </script>
</head>
<body>
    <h1>헬로우 월드</h1>
    <p id="countdown">You will be redirected in 5 seconds...</p>
</body>
</html>
