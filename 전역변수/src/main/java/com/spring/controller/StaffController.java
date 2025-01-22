package com.spring.controller;

import java.util.Collections;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.spring.dto.StaffDto;
import com.spring.service.StaffService;

@RestController
@RequestMapping("/staff")
@CrossOrigin(
    origins = "http://192.168.0.141:3000",
    allowCredentials = "true",
    allowedHeaders = "*",
    exposedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, 
               RequestMethod.DELETE, RequestMethod.OPTIONS, RequestMethod.PATCH}
)
public class StaffController {
    
    @Autowired
    private StaffService staffService;

    // 로그인 상태 확인 - POST 메서드 유지
    @PostMapping("/check-login")
    public ResponseEntity<?> checkLoginStatus(HttpSession session) {
        try {
            Map<String, Object> response = new HashMap<>();
            StaffDto staff = (StaffDto) session.getAttribute("loginStaff");
            
            if (staff != null) {
                response.put("isLoggedIn", true);
                response.put("isAdmin", staff.getAdmins() == 1);
                response.put("admin_no", staff.getAdmin_no());
                response.put("delete_right_no", staff.getDelete_right_no());
                response.put("member_no", staff.getMember_no());
            } else {
                response.put("isLoggedIn", false);
                response.put("isAdmin", false);
            }
            
            return ResponseEntity.ok()
                               .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                               .header("Access-Control-Allow-Credentials", "true")
                               .body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                               .header("Access-Control-Allow-Credentials", "true")
                               .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // 직원 목록 조회 - POST 메서드 유지
    @PostMapping("/list")
    public ResponseEntity<?> getStaffList(HttpSession session) {
        try {
            List<StaffDto> staffList = staffService.getStaffList();
            return ResponseEntity.ok(staffList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/edit")
    @CrossOrigin(
        origins = "http://192.168.0.141:3000",
        allowCredentials = "true",
        exposedHeaders = {"Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"}
    )
    public ResponseEntity<?> editStaff(
            @RequestParam Long member_no,
            @RequestParam String member_id,
            @RequestParam String member_nick,
            @RequestParam String member_phone,
            @RequestParam String member_email,
            @RequestParam String member_gender,
            @RequestParam String member_birth,
            @RequestParam(required = false) String member_pw,
            @RequestParam(required = false) String currentPassword,
            HttpSession session) {
        
        try {
            Map<String, Object> response = new HashMap<>();
            StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
            
            if (loginStaff == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                   .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                                   .header("Access-Control-Allow-Credentials", "true")
                                   .body(response);
            }

            // 관리자가 아닌 경우 현재 비밀번호 확인
            if (loginStaff.getDelete_right_no() != 1) {
                if (currentPassword == null || !staffService.checkPassword(member_no, currentPassword)) {
                    response.put("success", false);
                    response.put("message", "현재 비밀번호가 올바르지 않습니다.");
                    return ResponseEntity.badRequest()
                                       .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                                       .header("Access-Control-Allow-Credentials", "true")
                                       .body(response);
                }
            }

            StaffDto staffDto = new StaffDto();
            staffDto.setMember_no(member_no);
            staffDto.setMember_id(member_id);
            staffDto.setMember_nick(member_nick);
            staffDto.setMember_phone(member_phone);
            staffDto.setMember_email(member_email);
            staffDto.setMember_gender(member_gender);
            staffDto.setMember_birth(member_birth);
            
            if (member_pw != null && !member_pw.isEmpty()) {
                staffDto.setMember_pw(member_pw);
            }

            boolean updated = staffService.updateStaff(staffDto);
            
            if (updated) {
                response.put("success", true);
                response.put("message", "직원 정보가 수정되었습니다.");
                return ResponseEntity.ok()
                                   .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                                   .header("Access-Control-Allow-Credentials", "true")
                                   .body(response);
            } else {
                response.put("success", false);
                response.put("message", "직원 정보 수정에 실패했습니다.");
                return ResponseEntity.badRequest()
                                   .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                                   .header("Access-Control-Allow-Credentials", "true")
                                   .body(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest()
                               .header("Access-Control-Allow-Origin", "http://192.168.0.141:3000")
                               .header("Access-Control-Allow-Credentials", "true")
                               .body(response);
        }
    }
} 