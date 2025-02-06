package com.spring.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMethod;

import com.spring.dto.CartDto;
import com.spring.dto.StaffDto;
import com.spring.dto.StuffDto;
import com.spring.service.PointService;
import com.spring.service.StaffService;
import com.spring.service.StuffService;

@RestController
@RequestMapping("/stuff")
@CrossOrigin(
	origins = "http://192.168.0.128:3000",
	allowedHeaders = "*",
	methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, 
			   RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS},
	allowCredentials = "true"
)
public class StuffController {

	private static final Logger log = LoggerFactory.getLogger(StuffController.class);

	@Autowired
	private StuffService service;
	
	@Autowired
	private StaffService staffService;
	
	@Autowired
	private PointService pointservice;

	private static final String LOGIN_STAFF = "loginStaff";

	private boolean isAdmin(HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		return loginStaff != null && loginStaff.getAdmins() == 1;
	}

//	// 장바구니 체크아웃 API
//	@PostMapping("/api/cart/checkout")
//	@ResponseBody
//	public Map<String, String> checkout(@RequestBody Map<String, List<CartDto>> request, HttpSession session) {
//		System.out.println("받는 데이터 : "+ request);
//		
//		Map<String, String> response = new HashMap<>();
//		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
//		
//		if (loginStaff == null) {
//			response.put("status", "error");
//			response.put("message", "로그인이 필요합니다.");
//			return response;
//		}
//
//		try {
//			List<CartDto> items = request.get("cartItems");
//			
//			for(CartDto item : items) {
//				Long itemId = item.getItemId();
//				int orderQuantity = item.getQuantity();
//				
//				
//				//장바구니에 있는 물건 정보 가져오기
//				service.processCheckout(loginStaff.getMember_no(),itemId,orderQuantity);
//				pointservice.pointUse(itemId, loginStaff.getMember_no(),orderQuantity);
//			}
//			
//			
//			response.put("status", "success");
//			response.put("message", "주문이 완료되었습니다.");
//		} catch (Exception e) {
//			log.error("결제 실패: " + e.getMessage());
//			response.put("status", "error");
//			response.put("message", e.getMessage());
//		}
//		return response;
//	}
	// 장바구니 체크아웃 API
	@PostMapping("/api/cart/checkout")
	public ResponseEntity<?> checkout(@RequestBody Map<String, Object> requestData) {
	    List<Map<String, Object>> itemList = (List<Map<String, Object>>) requestData.get("itemIds");
	    Long memberNo = Long.valueOf(requestData.get("member_no").toString());

	    if (memberNo == null || itemList == null || itemList.isEmpty()) {
	        return ResponseEntity.badRequest().body("잘못된 요청입니다.");
	    }

	    System.out.println("📦 주문 아이템: " + itemList);
	    System.out.println("👤 주문한 사용자: " + memberNo);
	    
	    try {
	        for (Map<String, Object> item : itemList) {
	            Long itemId = Long.valueOf(item.get("itemId").toString());  // itemId 추출
	            Integer quantity = Integer.valueOf(item.get("quantity").toString());  // quantity 추출
	            
	            // PointService의 메서드를 호출하여 포인트 계산 또는 적립
	            pointservice.pointUse( itemId,memberNo,quantity);  // PointService 메서드 예시
	        }

	        return ResponseEntity.ok().body(Map.of("status", "success", "message", "주문 완료"));
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류 발생");
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
	public ResponseEntity<Map<String, Object>> getList(@RequestParam(defaultValue = "1") int currentPage ,@RequestParam(defaultValue = "3") int pageSize) {
		//전체 등록된 물건 수 가져오기
		int totalCount = service.getCountItemList();
		
		//총 페이지 수 계산
		int totalPage = (int)Math.ceil((double)totalCount/pageSize);
		
		//현재 페이지에 해당하는 물건 목록 가져오기
		List<StuffDto> stuffs = service.getItemList(currentPage, pageSize);
		
		//클라이언트에 반환할 데이터를 Map 에 담기
		Map<String, Object> response = new HashMap<>();
		response.put("items", stuffs);
		response.put("totalPage", totalPage);
		response.put("currentPage", currentPage);
		
		return ResponseEntity.ok(response);
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
	@PostMapping("/api/cart/add")
	@ResponseBody
	public Map<String, String> addToCart(@RequestParam("itemId") Long itemId, @RequestParam("quantity") int quantity,
			HttpSession session) {
		Map<String, String> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);

		if (loginStaff == null) {
			response.put("status", "error");
			response.put("message", "로그인이 필요합니다.");
			return response;
		}

		try {
			// 재고 확인
			StuffDto item = service.getItem(itemId);
			if (item == null) {
				response.put("status", "error");
				response.put("message", "상품을 찾을 수 없습니다.");
				return response;
			}

			if (item.getItem_stock() < quantity) {
				response.put("status", "error");
				response.put("message", "재고가 부족합니다. 현재 재고: " + item.getItem_stock());
				return response;
			}

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

	@PostMapping("/item/deleted")
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
	public String deleteItem(@RequestParam("item_id") Long item_id, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			return "redirect:/staff/login";
		}

		service.deleteItem(item_id);
		System.out.println("받은 item_id" + item_id);
		return "redirect:/stuff/item/list";
	}

	// 물건 수정 페이지
	@GetMapping("/item/edit")
	public String editItemForm(Long itemId, Model model, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			return "redirect:/staff/login";
		}

		model.addAttribute("item", service.getItem(itemId));
		return "stuff/edit";
	}

	// 물건 수정 처리
	@PostMapping("/item/edit")
	public String editItem(StuffDto stuffDto, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null || loginStaff.getAdmins() != 1) {
			return "redirect:/staff/login";
		}

		service.updateItem(stuffDto);
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

	// 장바구니 조회 API
	@GetMapping("/api/cart")
	@ResponseBody
	public List<CartDto> getCartItems(HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
		if (loginStaff == null) {
			return null;
		}
		return service.getCartItems(loginStaff.getMember_no());
	}

	// 장바구니 아이템 삭제 API
	@DeleteMapping("/api/cart/{cartId}")
	@ResponseBody
	public Map<String, String> deleteCartItem(@PathVariable Long cartId, HttpSession session) {
		Map<String, String> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);

		if (loginStaff == null) {
			response.put("status", "error");
			response.put("message", "로그인이 필요합니다.");
			return response;
		}

		try {
			service.removeFromCart(cartId);
			response.put("status", "success");
			response.put("message", "상품이 장바구니에서 제거되었습니다.");
		} catch (Exception e) {
			response.put("status", "error");
			response.put("message", e.getMessage());
		}
		return response;
	}

	// 장바구니 수량 업데이트 API
	@PatchMapping("/api/cart/{cart_id}")
	@ResponseBody
	public Map<String, String> updateCartItemQuantity(@PathVariable Long cart_id,
			@RequestBody Map<String, Integer> payload, HttpSession session) {
		Map<String, String> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);

		if (loginStaff == null) {
			response.put("status", "error");
			response.put("message", "로그인이 필요합니다.");
			return response;
		}

		try {
			service.updateCartItemQuantity(cart_id, payload.get("quantity"));
			response.put("status", "success");
			response.put("message", "수량이 업데이트되었습니다.");
		} catch (Exception e) {
			response.put("status", "error");
			response.put("message", e.getMessage());
		}
		return response;
	}
}