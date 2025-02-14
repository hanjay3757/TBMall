package com.spring.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.config.GlobalConfig;
import com.spring.dto.PointDto;
import com.spring.dto.StaffDto;
import com.spring.service.PointService;
import com.spring.service.StaffService;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@RequestMapping("/staff")
@RestController
@CrossOrigin(origins = GlobalConfig.ALLOWED_ORIGIN, allowedHeaders = "*", methods = { RequestMethod.GET,
		RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH,
		RequestMethod.OPTIONS }, allowCredentials = "true")
@AllArgsConstructor
public class StaffController {
	private StaffService service;
	private PointService pointservice;

	@PostMapping("/list")
	public ResponseEntity<Map<String, Object>> getList(@RequestBody Map<String, Object> params) {
		int currentPage = (int) params.getOrDefault("currentPage", 1);
		int pageSize = (int) params.getOrDefault("pageSize", 5);

		System.out.println("currentPage :" + currentPage);
		System.out.println("Pagesize :" + pageSize);

		// 전체 회원 수 가져오기
		int totaCount = service.getStaffCount();

		// 총 페이지 수 계산
		int totalPage = (int) Math.ceil((double) totaCount / pageSize);

		// 현재 페이지에 해당하는 목록 가져오기
		ArrayList<StaffDto> staff = service.getList(currentPage, pageSize);

		// 클라이언트로 반환할 데이터 Map에 담기
		Map<String, Object> response = new HashMap<>();
		response.put("staff", staff);
		response.put("totalPage", totalPage);
		response.put("currentPage", currentPage);

		// 응답 반환
		return ResponseEntity.ok(response);
	}

	@GetMapping("/list")
	public ResponseEntity<?> getStaffList(@RequestBody Map<String, Object> params) {
		int currentPage = (int) params.getOrDefault("currentPage", 1);
		int pageSize = (int) params.getOrDefault("pageSize", 5);
		try {
			List<StaffDto> staffList = service.getList(currentPage, pageSize);
			return ResponseEntity.ok(staffList);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Collections.singletonMap("error", e.getMessage()));
		}
	}

	// 관리자 정보 불러오기
	@PostMapping("/adminlist")
	public List<StaffDto> getAdminlist() {
		return service.getAdminList();
	}

	@PostMapping("/read")
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

	@PostMapping("/removelist")
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

		try {
			StaffDto staff = service.login(staffId, password);
			if (staff != null) {
				if (staff.getMember_delete() == 1) {
					response.put("success", false);
					response.put("message", "삭제된 계정입니다. 관리자에게 문의하세요.");
					return response;
				}
				PointDto pointDto = pointservice.getPointPosition(staff.getMember_no());

				session.setAttribute("loginStaff", staff);
				session.setAttribute("pointPosition", pointDto);

				response.put("success", true);
				response.put("member_no", staff.getMember_no());
				response.put("isAdmin", staff.getAdmins() == 1);
//				response.put("staff", staff);
				response.put("name", staff.getMember_nick());
				response.put("position_no", staff.getPosition_no());
				response.put("points", pointDto != null ? pointDto.getPoint_amount() : 0);

			} else {
				response.put("success", false);
				response.put("message", "아이디 또는 비밀번호가 올바르지 않습니다.");
			}

		} catch (Exception e) {
			response.put("success", false);
			response.put("message", "로그인 처리 중 오류가 발생했습니다.");
			e.printStackTrace();
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

	@RequestMapping(value = "/edit", method = { RequestMethod.GET, RequestMethod.POST })
	public ResponseEntity<?> editStaff(@RequestBody(required = false) StaffDto staffDto, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		try {
			StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

			// GET 요청 처리
			if (staffDto == null) {
				if (loginStaff == null) {
					return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
							.body(Collections.singletonMap("message", "로그인이 필요합니다."));
				}
				return ResponseEntity.ok(service.read(loginStaff.getMember_no()));
			}

			// POST 요청 처리
			if (loginStaff == null) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
						.body(Collections.singletonMap("message", "로그인이 필요합니다."));
			}

			if (loginStaff.getAdmins() != 1 && !loginStaff.getMember_no().equals(staffDto.getMember_no())) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(Collections.singletonMap("message", "수정 권한이 없습니다."));
			}

			service.update(staffDto);
			response.put("success", true);
			response.put("message", "직원 정보가 수정되었습니다.");
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			response.put("success", false);
			response.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		}
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

	@PostMapping("/check-login")
	public Map<String, Object> checkLoginStatus(HttpSession session) {
		Map<String, Object> response = new HashMap<>();

		try {
			StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
			PointDto loginStaffPoint = (PointDto) session.getAttribute("pointPosition");
			if (loginStaff != null) {
				// getAdmins()가 1이면 관리자
				response.put("isAdmin", loginStaff.getAdmins() == 1);
				response.put("admin_no", loginStaff.getAdmin_no());
				response.put("name", loginStaff.getMember_nick());
				response.put("delete_right_no", loginStaff.getDelete_right_no());
				response.put("name", loginStaff.getMember_nick());

				response.put("points", loginStaffPoint != null ? loginStaffPoint.getPoint_amount() : 0);
				response.put("isLoggedIn", true);
			} else {
				response.put("isLoggedIn", false);
				response.put("isAdmin", false);
			}

		} catch (Exception e) {
			response.put("isLoggedIn", false);
			response.put("isAdmin", false);
			e.printStackTrace();
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

	@PostMapping("/pointAdd")
	public Map<String, Object> pointAdd(@RequestParam("member_no") Long member_no, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null) {
			response.put("success", false);
			response.put("message", "로그인이 필요합니다.");
			return response;
		}

		try {
			Long pointAdd = pointservice.pointAdd(member_no);
			response.put("success", true);
			response.put("message", "출석체크 완료.");
			response.put("pointAdd", pointAdd);
		} catch (RuntimeException e) {
			response.put("success", false);
			response.put("message", e.getMessage());
		}

		return response;
	}

//	//포인트 및 직위 가져오기
//	
//	@GetMapping("/point-position")
//	public ResponseEntity<?> getPointPosition(@RequestParam("member_no") Long member_no) {
//	    try {
//	        PointDto pointDto = service.getPointPosition(member_no);
//	        if (pointDto != null) {
//	            return ResponseEntity.ok(pointDto);
//	        } else {
//	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
//	                                 .body(Collections.singletonMap("message", "회원 정보를 찾을 수 없습니다."));
//	        }
//	    } catch (Exception e) {
//	        log.error("포인트 및 직위 조회 실패: " + e.getMessage());
//	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//	                             .body(Collections.singletonMap("message", "오류가 발생했습니다."));
//	    }
//	}

}