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

	// 관리자 정보 불러오기
	@GetMapping("/adminlist")
	public List<StaffDto> getAdminlist() {
		return service.getAdminList();
	}

	@GetMapping("/read")
	public StaffDto read(@RequestParam("member_no") Long member_no) {
		return service.read(member_no);
	}
	// 작동중

	// 직원 삭제 Get ->Post 변경
	@PostMapping("/remove")
	public Map<String, Object> remove(@RequestParam("member_no") Long member_no, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null) {
			response.put("success", false);
			response.put("message", "로그인이 필요합니다.");
			return response;
		}

		if (loginStaff.getAdmins() != 1 || loginStaff.getDelete_right_no() != 1) {
			response.put("success", false);
			response.put("message", "삭제 권한이 있는 관리자만 삭제할 수 있습니다.");
			return response;
		}

		try {
			if (loginStaff.getMember_no().equals(member_no)) {
				response.put("success", false);
				response.put("message", "자신의 계정은 삭제할 수 없습니다.");
				return response;
			}

			service.softDelete(member_no);
			response.put("success", true);
			response.put("message", "직원이 성공적으로 삭제되었습니다.");
		} catch (RuntimeException e) {
			response.put("success", false);
			response.put("message", e.getMessage());
		}

		return response;
	}

//c
	@PostMapping("/restore")
	public Map<String, Object> restore(@RequestParam("member_no") Long member_no, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null) {
			response.put("success", false);
			response.put("message", "로그인이 필요합니다.");
			return response;
		}

		if (loginStaff.getAdmins() != 1 || loginStaff.getDelete_right_no() != 1) {
			response.put("success", false);
			response.put("message", "삭제 권한이 있는 관리자만 복구할 수 있습니다.");
			return response;
		}

		try {
			service.restore(member_no);
			response.put("success", true);
			response.put("message", "직원이 성공적으로 복구되었습니다.");
		} catch (RuntimeException e) {
			response.put("success", false);
			response.put("message", e.getMessage());
		}

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
			if (staff.getMember_delete() == 1) {
				response.put("success", false);
				response.put("message", "삭제된 계정입니다. 관리자에게 문의하세요.");
				return response;
			}
			session.setAttribute("loginStaff", staff);
			response.put("success", true);
			response.put("member_no", staff.getMember_no());
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
	public Map<String, Object> edit(@RequestParam("member_no") Long member_no,
			@RequestParam("member_nick") String member_nick, @RequestParam("member_phone") String member_phone,
			@RequestParam("member_email") String member_email,
			@RequestParam(value = "member_pw", required = false) String member_pw,
			@RequestParam("currentPassword") String currentPassword, HttpSession session) {

		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null) {
			response.put("success", false);
			response.put("message", "로그인이 필요합니다.");
			return response;
		}

		StaffDto currentStaff = service.read(member_no);
		if (!currentStaff.getMember_pw().equals(currentPassword)) {
			response.put("success", false);
			response.put("message", "현재 비밀번호가 올바르지 않습니다.");
			return response;
		}

		if (loginStaff.getAdmins() != 1 && !loginStaff.getMember_no().equals(member_no)) {
			response.put("success", false);
			response.put("message", "권한이 없습니다.");
			return response;
		}

		try {
			StaffDto staffDto = new StaffDto();
			staffDto.setMember_no(member_no);
			staffDto.setMember_nick(member_nick);
			staffDto.setMember_phone(member_phone);
			staffDto.setMember_email(member_email);
			if (member_pw != null && !member_pw.isEmpty()) {
				staffDto.setMember_pw(member_pw);
			}

			service.update(staffDto);
			response.put("success", true);
			response.put("message", "정보가 수정되었습니다.");
		} catch (Exception e) {
			response.put("success", false);
			response.put("message", "수정 중 오류가 발생했습니다.");
		}

		return response;
	}

	@PostMapping("/changePassword")
	public Map<String, Object> changePassword(@RequestParam("currentPassword") String currentPassword,
			@RequestBody StaffDto staffDto, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null || !loginStaff.getMember_no().equals(staffDto.getMember_no())) {
			response.put("success", false);
			response.put("message", "권한이 없습니다.");
			return response;
		}

		StaffDto originalStaff = service.read(staffDto.getMember_no());
		if (!originalStaff.getMember_pw().equals(currentPassword)) {
			response.put("success", false);
			response.put("message", "현재 비밀번호가 일치하지 않습니다.");
			return response;
		}

		originalStaff.setMember_pw(staffDto.getMember_pw());
		service.update(originalStaff);
		response.put("success", true);
		return response;
	}

	@GetMapping("/check-login")
	public Map<String, Object> checkLoginStatus(HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff != null) {
			response.put("isLoggedIn", true);
			// getAdmins()가 1이면 관리자
			response.put("isAdmin", loginStaff.getAdmins() == 1);
			response.put("admin_no", loginStaff.getAdmin_no());
			response.put("delete_right_no", loginStaff.getDelete_right_no());
		} else {
			response.put("isLoggedIn", false);
			response.put("isAdmin", false);
		}

		return response;
	}

//	@PostMapping("/register")
//	public Map<String, Object> register(
//			@RequestParam("member_id") String member_id,
//			@RequestParam("member_pw") String member_pw,
//			@RequestParam("member_nick") String member_nick,
//			@RequestParam("member_gender") String member_gender,
//			@RequestParam("member_birth") String member_birth,
//			@RequestParam("member_phone") String member_phone,
//			@RequestParam("member_email") String member_email,
//			@RequestParam(value = "admins", defaultValue = "0") int admins,
//			HttpSession session) {
//		
//		Map<String, Object> response = new HashMap<>();
//		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
//
//		// 관리자만 직원 등록 가능
//		if (loginStaff == null || loginStaff.getAdmins() != 1) {
//			response.put("success", false);
//			response.put("message", "관리자 권한이 필요합니다.");
//			return response;
//		}
//
//		try {
//			// 아이디 중복 체크
//			if (service.checkIdDuplicate(member_id)) {
//				response.put("success", false);
//				response.put("message", "이미 사용중인 아이디입니다.");
//				return response;
//			}
//
//			// StaffDto 객체 생성
//			StaffDto newStaff = new StaffDto();
//			newStaff.setMember_id(member_id);
//			newStaff.setMember_pw(member_pw);
//			newStaff.setMember_nick(member_nick);
//			newStaff.setMember_gender(member_gender);
//			newStaff.setMember_birth(member_birth);
//			newStaff.setMember_phone(member_phone);
//			newStaff.setMember_email(member_email);
//
//			// 직원 등록
//			service.register(newStaff);
//
//			// 관리자로 등록하는 경우
//			if (admins == 1) {
//				service.adminAppoint(newStaff.getMember_no());
//			}
//
//			response.put("success", true);
//			response.put("message", "직원이 등록되었습니다.");
//		} catch (Exception e) {
//			log.error("직원 등록 실패: " + e.getMessage());
//			response.put("success", false);
//			response.put("message", "직원 등록에 실패했습니다.");
//		}
//
//		return response;
//	}

	@PostMapping("/register")
	public Map<String, Object> register(@RequestBody StaffDto newStaff,
			@RequestParam(value = "admins", defaultValue = "0") int admins, HttpSession session) {

		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		// 관리자만 직원 등록 가능
		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			response.put("success", false);
			response.put("message", "관리자 권한이 필요합니다.");
			return response;
		}

		try {
			// 아이디 중복 체크
			if (service.checkIdDuplicate(newStaff.getMember_id())) {
				response.put("success", false);
				response.put("message", "이미 사용중인 아이디입니다.");
				return response;
			}

			// 직원 등록
			service.register(newStaff);

			// 관리자로 등록하는 경우
			if (admins == 1) {
				service.adminAppoint(newStaff.getMember_no());
			}

			response.put("success", true);
			response.put("message", "직원이 등록되었습니다.");
		} catch (Exception e) {
			log.error("직원 등록 실패: " + e.getMessage());
			response.put("success", false);
			response.put("message", "직원 등록에 실패했습니다.");
		}

		return response;
	}

}