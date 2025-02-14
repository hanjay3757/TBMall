package com.spring.controller;

import java.util.List;

import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.dto.StaffDto;
import com.spring.dto.StuffDto;
import com.spring.service.StaffService;
import com.spring.service.StuffService;

@RestController
@RequestMapping(value = "/stuff", produces = "application/json;charset=UTF-8")
@CrossOrigin(origins = "http://localhost:3000") // React 앱의 주소
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
			service.processCheckout(loginStaff.getBno());
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
	public String register(StuffDto stuff, HttpSession session) {
		if (!isAdmin(session)) {
			return "redirect:/staff/login";
		}

		try {
			service.registerItem(stuff);
			return "redirect:/stuff/item/list";
		} catch (Exception e) {
			// 에러 처리 추가
			log.error("물건 등록 실패: " + e.getMessage());
			return "redirect:/stuff/item/register?error=" + e.getMessage();
		}
	}

	// 장바구니에 추가
	@PostMapping("/cart/add")
	public String addToCart(@RequestParam("itemId") Long itemId, @RequestParam("quantity") int quantity,
			HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null) {
			return "redirect:/staff/login";
		}

		try {
			service.addToCart(itemId, loginStaff.getBno(), quantity);
			return "redirect:/stuff/item/list?message=addedToCart";
		} catch (Exception e) {
			log.error("장바구니 추가 실패: " + e.getMessage());
			return "redirect:/stuff/item/list?error=" + e.getMessage();
		}
	}

	// 장바구니 조회
	@GetMapping("/cart")
	public String viewCart(HttpSession session, Model model) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null) {
			return "redirect:/staff/login";
		}

		model.addAttribute("cartItems", service.getCartItems(loginStaff.getBno()));
		return "stuff/cart";
	}

	@GetMapping("/item/deleted")
	public String getDeletedItems(Model model, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			return "redirect:/staff/login";
		}

		model.addAttribute("items", service.getDeletedItemList());
		return "stuff/deleted";
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
	public String restoreItem(@RequestParam("itemId") Long itemId, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			return "redirect:/staff/login";
		}

		service.restoreItem(itemId);
		return "redirect:/stuff/item/deleted";
	}
}