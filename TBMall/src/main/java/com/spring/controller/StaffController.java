package com.spring.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.dto.StaffDto;
import com.spring.service.StaffService;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@RequestMapping("/staff/*")
@RestController
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
		RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
@AllArgsConstructor
public class StaffController {
	private StaffService service;

	@GetMapping("/list")
	public List<StaffDto> getList() {
		return service.getList();
	}

	@GetMapping("/read")
	public StaffDto read(@RequestParam("bno") Long bno) {
		return service.read(bno);
	}

	@PostMapping("/remove")
	public Map<String, Object> remove(@RequestParam("bno") Long bno, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			response.put("success", false);
			response.put("message", "관리자 권한이 필요합니다.");
			return response;
		}

		service.remove(bno);
		response.put("success", true);
		return response;
	}

	@PostMapping("/restore")
	public Map<String, Object> restore(@RequestParam("bno") Long bno, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			response.put("success", false);
			response.put("message", "관리자 권한이 필요합니다.");
			return response;
		}

		service.restore(bno);
		response.put("success", true);
		return response;
	}

	@GetMapping("/removelist")
	public Map<String, Object> getRemoveList(HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
		
		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			response.put("success", false);
			response.put("message", "관리자 권한이 필요합니다.");
			return response;
		}

		response.put("success", true);
		response.put("list", service.getDeletedList());
		return response;
	}

	@PostMapping("/login")
	public Map<String, Object> login(@RequestParam("staffId") String staffId, @RequestParam("password") String password,
			HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto staff = service.login(staffId, password);

		if (staff != null) {
			session.setAttribute("loginStaff", staff);
			response.put("success", true);
			response.put("isAdmin", staff.getAdmins() == 1);
		} else {
			response.put("success", false);
			response.put("message", "아이디 또는 비밀번호가 올바르지 않습니다.");
		}
		return response;
	}

	@PostMapping("/logout")
	public Map<String, Object> logout(HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		session.invalidate();
		response.put("success", true);
		return response;
	}

	@PostMapping("/edit")
	public Map<String, Object> edit(@RequestBody StaffDto staffDto,
			@RequestParam("currentPassword") String currentPassword, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null) {
			response.put("success", false);
			response.put("message", "로그인이 필요합니다.");
			return response;
		}

		StaffDto currentStaff = service.read(staffDto.getBno());
		if (!currentStaff.getPassword().equals(currentPassword)) {
			response.put("success", false);
			response.put("message", "현재 비밀번호가 일치하지 않습니다.");
			return response;
		}

		if (loginStaff.getAdmins() != 1 && !loginStaff.getBno().equals(staffDto.getBno())) {
			response.put("success", false);
			response.put("message", "권한이 없습니다.");
			return response;
		}

		service.update(staffDto);
		response.put("success", true);
		return response;
	}

	@PostMapping("/changePassword")
	public Map<String, Object> changePassword(@RequestParam("currentPassword") String currentPassword,
			@RequestBody StaffDto staffDto, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null || !loginStaff.getBno().equals(staffDto.getBno())) {
			response.put("success", false);
			response.put("message", "권한이 없습니다.");
			return response;
		}

		StaffDto originalStaff = service.read(staffDto.getBno());
		if (!originalStaff.getPassword().equals(currentPassword)) {
			response.put("success", false);
			response.put("message", "현재 비밀번호가 일치하지 않습니다.");
			return response;
		}

		originalStaff.setPassword(staffDto.getPassword());
		service.update(originalStaff);
		response.put("success", true);
		return response;
	}

	@GetMapping("/check-login")
	public Map<String, Object> checkLoginStatus(HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
		response.put("isLoggedIn", loginStaff != null);
		response.put("isAdmin", loginStaff != null && loginStaff.getAdmins() == 1);
		return response;
	}
}