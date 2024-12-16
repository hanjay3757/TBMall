package com.spring.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.spring.dto.CartDto;
import com.spring.dto.StaffDto;
import com.spring.dto.StuffDto;
import com.spring.service.StaffService;
import com.spring.service.StuffService;

@RestController
@RequestMapping(value = "/stuff", produces = "application/json;charset=UTF-8")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*", methods = {
		RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS })
public class StuffController {

	private static final Logger log = LoggerFactory.getLogger(StuffController.class);

	@Autowired
	private StuffService service;

	@Autowired
	private StaffService staffService; // StaffService 주입

	// 세션 키 상수 추가
	private static final String LOGIN_STAFF = "loginStaff";

	// 세션 체크 메서드 추가
	private boolean isAdmin(HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		return loginStaff != null && loginStaff.getAdmins() == 1;
	}

	@PostMapping("/cart/checkout")
	public String checkout(HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null) {
			return "redirect:/staff/login";
		}

		try {
			service.processCheckout(loginStaff.getMember_no());
			return "redirect:/stuff/item/list?message=orderComplete";
		} catch (Exception e) {
			log.error("결제 실패: " + e.getMessage());
			return "redirect:/stuff/cart?error=" + e.getMessage();
		}
	}

	@PostMapping("/cart/remove")
	public String removeFromCart(@RequestParam("cartId") Long cartId, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null) {
			return "redirect:/staff/login";
		}

		service.removeFromCart(cartId);
		return "redirect:/stuff/cart";
	}

	// 물건 목록 조회
	@GetMapping("/item/list")
	@ResponseBody
	public List<StuffDto> getList() {
		return service.getItemList();
	}

	// 물건 등록 페이지
	@GetMapping("/item/register")
	public String registerForm(HttpSession session) {
		if (!isAdmin(session)) {
			return "redirect:/staff/login";
		}
		return "stuff/register";
	}

	// 물건 등록 처리
	@PostMapping("/item/register")
	@ResponseBody
	public Map<String, Object> register(StuffDto stuff, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			response.put("success", false);
			response.put("message", "관리자 권한이 필요합니다.");
			return response;
		}

		try {
			stuff.setAdmin_no(loginStaff.getAdmin_no());
			service.registerItem(stuff);
			response.put("success", true);
			response.put("message", "물건이 등록되었습니다.");
		} catch (Exception e) {
			log.error("물건 등록 실패: " + e.getMessage());
			response.put("success", false);
			response.put("message", e.getMessage());
		}

		return response;
	}

	// 장바구니에 추가
	@PostMapping("/cart/add")
	@ResponseBody
	public Map<String, String> addToCart(@RequestBody Map<String, Object> request, HttpSession session) {
		Map<String, String> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);

		if (loginStaff == null) {
			response.put("status", "error");
			response.put("message", "로그인이 필요합니다.");
			return response;
		}

		try {
			Long itemId = ((Number) request.get("itemId")).longValue();
			int quantity = ((Number) request.get("quantity")).intValue();

			service.addToCart(itemId, loginStaff.getMember_no(), quantity);

			response.put("status", "success");
			response.put("message", "장바구니에 추가되었습니다.");
		} catch (Exception e) {
			log.error("장바구니 추가 실패: " + e.getMessage());
			response.put("status", "error");
			response.put("message", e.getMessage());
		}

		return response;
	}

	// 장바구니 조회
	@GetMapping("/cart")
	public String viewCart(HttpSession session, Model model) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null) {
			return "redirect:/staff/login";
		}

		model.addAttribute("cartItems", service.getCartItems(loginStaff.getMember_no()));
		return "stuff/cart";
	}

	@GetMapping("/item/deleted")
	@ResponseBody
	public Map<String, Object> getDeletedItems(HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			response.put("success", false);
			response.put("message", "관리자 권한이 필요합니다.");
			return response;
		}

		try {
			List<StuffDto> deletedItems = service.getDeletedItemList();
			response.put("success", true);
			response.put("data", deletedItems);
		} catch (Exception e) {
			log.error("삭제된 물건 목록 조회 실패: " + e.getMessage());
			response.put("success", false);
			response.put("message", "삭제된 물건 목록을 불러오는데 실패했습니다.");
		}

		return response;
	}

	// 물건 삭제
	@PostMapping("/item/delete")
	public String deleteItem(@RequestParam("itemId") Long itemId, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			return "redirect:/staff/login";
		}

		service.deleteItem(itemId);
		return "redirect:/stuff/item/list";
	}

	// 물건 수정 페이지
	@GetMapping("/item/edit")
	public String editItemForm(@RequestParam("itemId") Long itemId, Model model, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			return "redirect:/staff/login";
		}

		model.addAttribute("item", service.getItem(itemId));
		return "stuff/edit";
	}

	// 물건 수정 처리
	@PostMapping("/item/edit")
	public String editItem(StuffDto stuff, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			return "redirect:/staff/login";
		}

		service.updateItem(stuff);
		return "redirect:/stuff/item/list";
	}

	// 물건 복구
	@PostMapping("/item/restore")
	@ResponseBody
	public Map<String, String> restoreItem(@RequestParam("itemId") Long itemId, HttpSession session) {
		Map<String, String> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);

		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			response.put("status", "error");
			response.put("message", "관리자 권한이 필요합니다.");
			return response;
		}

		try {
			service.restoreItem(itemId);
			response.put("status", "success");
			response.put("message", "물건이 복구되었습니다.");
		} catch (Exception e) {
			response.put("status", "error");
			response.put("message", e.getMessage());
		}

		return response;
	}

	// 장바구니 조회 API 수정
	@GetMapping("/cart/list")
	@ResponseBody
	public List<CartDto> getCartItems(HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null) {
			throw new RuntimeException("로그인이 필요합니다.");
		}
		return service.getCartItems(loginStaff.getMember_no());
	}

	// 장바구니 아이템 삭제 API 추가
	@DeleteMapping("/cart/{cartId}")
	@ResponseBody
	public void deleteCartItem(@PathVariable Long cartId, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null) {
			throw new RuntimeException("로그인이 필요합니다.");
		}
		service.removeFromCart(cartId);
	}

	// 장바구니 수량 업데이트 API 추가
	@PatchMapping("/cart/{cartId}")
	@ResponseBody
	public void updateCartItemQuantity(@PathVariable Long cartId, @RequestBody Map<String, Integer> payload,
			HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null) {
			throw new RuntimeException("로그인이 필요합니다.");
		}
		service.updateCartItemQuantity(cartId, payload.get("quantity"));
	}
}