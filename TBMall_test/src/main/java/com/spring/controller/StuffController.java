package com.spring.controller;

// 필요한 Java 유틸리티 클래스들을 임포트
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// HTTP 세션 관리를 위한 임포트
import javax.servlet.http.HttpSession;

// 로깅을 위한 임포트
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// Spring 프레임워크 관련 임포트
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

// DTO 클래스 임포트
import com.spring.dto.CartDto;
import com.spring.dto.StaffDto;
import com.spring.dto.StuffDto;
import com.spring.service.StaffService;
import com.spring.service.StuffService;

// REST API 컨트롤러 설정
@RestController
@RequestMapping("/stuff")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*")
public class StuffController {

    // 로깅을 위한 Logger 객체 생성
    // SLF4J 로깅 프레임워크를 사용하여 애플리케이션의 동작을 추적하고 디버깅하기 위해 사용
    private static final Logger log = LoggerFactory.getLogger(StuffController.class);

    // 서비스 계층 의존성 주입
    // StuffService를 통해 물건 관련 비즈니스 로직을 처리하기 위해 사용
    @Autowired
    private StuffService service;

    // StaffService를 통해 직원 관련 비즈니스 로직을 처리하기 위해 사용
    @Autowired
    private StaffService staffService;

    // 로그인된 직원 세션 키 상수
    // 세션에서 로그인한 직원 정보를 식별하기 위한 키값으로 사용
    private static final String LOGIN_STAFF = "loginStaff";

    // 관리자 권한 체크 메서드
    // 현재 로그인한 사용자가 관리자 권한을 가지고 있는지 확인하기 위해 사용
    // admins 값이 1이면 관리자, 아니면 일반 직원
    private boolean isAdmin(HttpSession session) {
        StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
        return loginStaff != null && loginStaff.getAdmins() == 1;
    }

    // 장바구니 체크아웃 처리
    // 로그인된 사용자의 장바구니 내역을 주문으로 전환
    @PostMapping("/api/cart/checkout")
    @ResponseBody
    public Map<String, String> checkout(HttpSession session) {
        // API 응답을 위한 Map 객체 생성
        // response.put()을 사용하여 클라이언트에게 전달할 상태와 메시지를 key-value 형태로 저장
        Map<String, String> response = new HashMap<>();
        // 세션에서 로그인한 직원 정보 조회
        StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);

        // 로그인 여부 확인
        if (loginStaff == null) {
            // 로그인되지 않은 경우 에러 상태와 메시지를 Map에 저장
            // status key에 "error" 값을 저장하여 클라이언트에게 처리 실패를 알림
            response.put("status", "error");
            // message key에 구체적인 에러 메시지를 저장하여 사용자에게 표시
            response.put("message", "로그인이 필요합니다.");
            return response;
        }

        try {
            // 체크아웃 프로세스 실행
            service.processCheckout(loginStaff.getMember_no());
            // 성공 시 상태와 메시지를 Map에 저장
            // status key에 "success" 값을 저장하여 클라이언트에게 처리 성공을 알림
            response.put("status", "success");
            // message key에 성공 메시지를 저장하여 사용자에게 표시
            response.put("message", "주문이 완료되었습니다.");
        } catch (Exception e) {
            // 에러 발생 시 로그 기록 및 에러 응답
            log.error("결제 실패: " + e.getMessage());
            // 예외 발생 시 에러 상태와 메시지를 Map에 저장
            // status key에 "error" 값을 저장하여 클라이언트에게 처리 실패를 알림
            response.put("status", "error");
            // message key에 발생한 예외의 메시지를 저장하여 구체적인 에러 내용을 전달
            response.put("message", e.getMessage());
        }
        return response;
    }

    // 장바구니에서 상품 제거
    // 특정 장바구니 아이템을 삭제하는 기능
    @PostMapping("/cart/remove")
    public String removeFromCart(@RequestParam("cartId") Long cartId, HttpSession session) {
        StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
        if (loginStaff == null) {
            return "redirect:/staff/login";
        }

        service.removeFromCart(cartId);
        return "redirect:/stuff/cart";
    }

    // 물건 목록 조회 API
    // 모든 물건 목록을 반환하는 엔드포인트
    @GetMapping("/item/list")
    @ResponseBody
    public List<StuffDto> getList() {
        return service.getItemList();
    }

    // 물건 등록 페이지 이동
    // 관리자만 접근 가능한 물건 등록 페이지
    @GetMapping("/item/register")
    public String registerForm(HttpSession session) {
        if (!isAdmin(session)) {
            return "redirect:/staff/login";
        }
        return "stuff/register";
    }

    // 물건 등록 처리 API
    // 관리자만 물건을 등록할 수 있음
    @PostMapping("/item/register")
    @ResponseBody
    public Map<String, Object> register(StuffDto stuff, HttpSession session) {
        // API 응답을 위한 Map 객체 생성
        // response.put()을 사용하여 클라이언트에게 전달할 처리 결과와 메시지를 저장
        Map<String, Object> response = new HashMap<>();
        // 세션에서 로그인한 직원 정보 조회
        StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

        // 관리자 권한 체크
        if (loginStaff == null || loginStaff.getAdmins() != 1) {
            // 권한이 없는 경우 실패 상태와 메시지를 Map에 저장
            // success key에 false를 저장하여 클라이언트에게 처리 실패를 알림
            response.put("success", false);
            // message key에 권한 부족 메시지를 저장하여 사용자에게 표시
            response.put("message", "관리자 권한이 필요합니다.");
            return response;
        }

        try {
            // 등록자 정보 설정 및 물건 등록
            stuff.setAdmin_no(loginStaff.getAdmin_no());
            service.registerItem(stuff);
            // 성공 시 상태와 메시지를 Map에 저장
            // success key에 true를 저장하여 클라이언트에게 처리 성공을 알림
            response.put("success", true);
            // message key에 성공 메시지를 저장하여 사용자에게 표시
            response.put("message", "물건이 등록되었습니다.");
        } catch (Exception e) {
            // 에러 발생 시 로그 기록 및 에러 응답
            log.error("물건 등록 실패: " + e.getMessage());
            // 예외 발생 시 실패 상태와 메시지를 Map에 저장
            // success key에 false를 저장하여 클라이언트에게 처리 실패를 알림
            response.put("success", false);
            // message key에 발생한 예외의 메시지를 저장하여 구체적인 에러 내용을 전달
            response.put("message", e.getMessage());
        }

        return response;
    }

    // 장바구니에 상품 추가 API
    // 재고 확인 후 장바구니에 추가
    @PostMapping("/api/cart/add")
    @ResponseBody
    public Map<String, String> addToCart(@RequestParam("itemId") Long itemId, @RequestParam("quantity") int quantity,
            HttpSession session) {
        // API 응답을 위한 Map 객체 생성
        // response.put()을 사용하여 장바구니 추가 결과를 클라이언트에게 전달
        Map<String, String> response = new HashMap<>();
        // 세션에서 로그인한 직원 정보 조회
        StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);

        // 로그인 여부 확인
        if (loginStaff == null) {
            // 로그인되지 않은 경우 에러 상태와 메시지를 Map에 저장
            response.put("status", "error");
            response.put("message", "로그인이 필요합니다.");
            return response;
        }

        try {
            // 재고 확인
            StuffDto item = service.getItem(itemId);
            if (item == null) {
                // 상품이 존재하지 않는 경우 에러 상태와 메시지를 Map에 저장
                response.put("status", "error");
                response.put("message", "상품을 찾을 수 없습니다.");
                return response;
            }

            // 재고 수량 체크
            if (item.getItem_stock() < quantity) {
                // 재고가 부족한 경우 에러 상태와 메시지를 Map에 저장
                response.put("status", "error");
                response.put("message", "재고가 부족합니다. 현재 재고: " + item.getItem_stock());
                return response;
            }

            // 장바구니에 상품 추가
            service.addToCart(itemId, loginStaff.getMember_no(), quantity);
            // 성공 시 상태와 메시지를 Map에 저장
            response.put("status", "success");
            response.put("message", "장바구니에 추가되었습니다.");
        } catch (Exception e) {
            // 에러 발생 시 로그 기록 및 에러 응답
            log.error("장바구니 추가 실패: " + e.getMessage());
            // 예외 발생 시 에러 상태와 메시지를 Map에 저장
            response.put("status", "error");
            response.put("message", e.getMessage());
        }

        return response;
    }

    // 장바구니 페이지 조회
    // 로그인한 사용자의 장바구니 내역을 보여주는 페이지
    @GetMapping("/cart")
    public String viewCart(HttpSession session, Model model) {
        StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
        if (loginStaff == null) {
            return "redirect:/staff/login";
        }

        model.addAttribute("cartItems", service.getCartItems(loginStaff.getMember_no()));
        return "stuff/cart";
    }

    // 삭제된 물건 목록 조회 API
    // 관리자만 접근 가능
    @GetMapping("/item/deleted")
    @ResponseBody
    public Map<String, Object> getDeletedItems(HttpSession session) {
        // API 응답을 위한 Map 객체 생성
        // response.put()을 사용하여 삭제된 물건 목록 조회 결과를 클라이언트에게 전달
        Map<String, Object> response = new HashMap<>();
        // 세션에서 로그인한 직원 정보 조회
        StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

        // 관리자 권한 체크
        if (loginStaff == null || loginStaff.getAdmins() != 1) {
            // 권한이 없는 경우 실패 상태와 메시지를 Map에 저장
            response.put("success", false);
            response.put("message", "관리자 권한이 필요합니다.");
            return response;
        }

        try {
            // 삭제된 물건 목록 조회
            List<StuffDto> deletedItems = service.getDeletedItemList();
            // 성공 시 상태와 데이터를 Map에 저장
            response.put("success", true);
            // data key에 조회된 삭제된 물건 목록을 저장
            response.put("data", deletedItems);
        } catch (Exception e) {
            // 에러 발생 시 로그 기록 및 에러 응답
            log.error("삭제된 물건 목록 조회 실패: " + e.getMessage());
            // 예외 발생 시 실패 상태와 메시지를 Map에 저장
            response.put("success", false);
            response.put("message", "삭제된 물건 목록을 불러오는데 실패했습니다.");
        }

        return response;
    }

    // 물건 삭제 처리
    // 관리자만 물건을 삭제할 수 있음
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

    // 물건 수정 페이지 이동
    // 관리자만 접근 가능한 물건 수정 페이지
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
    // 관리자만 물건 정보를 수정할 수 있음
    @PostMapping("/item/edit")
    public String editItem(StuffDto stuff, HttpSession session) {
        StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
        if (loginStaff == null || loginStaff.getAdmins() != 1) {
            return "redirect:/staff/login";
        }

        service.updateItem(stuff);
        return "redirect:/stuff/item/list";
    }

    // 삭제된 물건 복구 API
    // 관리자만 물건을 복구할 수 있음
    @PostMapping("/item/restore")
    @ResponseBody
    public Map<String, String> restoreItem(@RequestParam("itemId") Long itemId, HttpSession session) {
        // API 응답을 위한 Map 객체 생성
        // response.put()을 사용하여 물건 복구 처리 결과를 클라이언트에게 전달
        Map<String, String> response = new HashMap<>();
        // 세션에서 로그인한 직원 정보 조회
        StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);

        // 관리자 권한 체크
        if (loginStaff == null || loginStaff.getAdmins() != 1) {
            // 권한이 없는 경우 에러 상태와 메시지를 Map에 저장
            response.put("status", "error");
            response.put("message", "관리자 권한이 필요합니다.");
            return response;
        }

        try {
            // 물건 복구 처리
            service.restoreItem(itemId);
            // 성공 시 상태와 메시지를 Map에 저장
            response.put("status", "success");
            response.put("message", "물건이 복구되었습니다.");
        } catch (Exception e) {
            // 예외 발생 시 에러 상태와 메시지를 Map에 저장
            response.put("status", "error");
            response.put("message", e.getMessage());
        }

        return response;
    }

    // 장바구니 조회 API
    // 로그인한 사용자의 장바구니 내역을 반환
    @GetMapping("/api/cart")
    @ResponseBody
    public List<CartDto> getCartItems(HttpSession session) {
        StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);
        if (loginStaff == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        return service.getCartItems(loginStaff.getMember_no());
    }

    // 장바구니 아이템 삭제 API
    // 특정 장바구니 아이템을 삭제하는 REST API
    @DeleteMapping("/api/cart/{cartId}")
    @ResponseBody
    public Map<String, String> deleteCartItem(@PathVariable Long cartId, HttpSession session) {
        // API 응답을 위한 Map 객체 생성
        // response.put()을 사용하여 장바구니 아이템 삭제 결과를 클라이언트에게 전달
        Map<String, String> response = new HashMap<>();
        // 세션에서 로그인한 직원 정보 조회
        StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);

        // 로그인 여부 확인
        if (loginStaff == null) {
            // 로그인되지 않은 경우 에러 상태와 메시지를 Map에 저장
            response.put("status", "error");
            response.put("message", "로그인이 필요합니다.");
            return response;
        }

        try {
            // 장바구니 아이템 삭제
            service.removeFromCart(cartId);
            // 성공 시 상태와 메시지를 Map에 저장
            response.put("status", "success");
            response.put("message", "상품이 장바구니에서 제거되었습니다.");
        } catch (Exception e) {
            // 예외 발생 시 에러 상태와 메시지를 Map에 저장
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }

    // 장바구니 수량 업데이트 API
    // 장바구니 내 특정 상품의 수량을 수정하는 REST API
    @PatchMapping("/api/cart/{cart_id}")
    @ResponseBody
    public Map<String, String> updateCartItemQuantity(@PathVariable Long cart_id,
            @RequestBody Map<String, Integer> payload, HttpSession session) {
        // API 응답을 위한 Map 객체 생성
        // response.put()을 사용하여 장바구니 수량 업데이트 결과를 클라이언트에게 전달
        Map<String, String> response = new HashMap<>();
        // 세션에서 로그인한 직원 정보 조회
        StaffDto loginStaff = (StaffDto) session.getAttribute(LOGIN_STAFF);

        // 로그인 여부 확인
        if (loginStaff == null) {
            // 로그인되지 않은 경우 에러 상태와 메시지를 Map에 저장
            response.put("status", "error");
            response.put("message", "로그인이 필요합니다.");
            return response;
        }

        try {
            // 장바구니 아이템 수량 업데이트
            service.updateCartItemQuantity(cart_id, payload.get("quantity"));
            // 성공 시 상태와 메시지를 Map에 저장
            response.put("status", "success");
            response.put("message", "수량이 업데이트되었습니다.");
        } catch (Exception e) {
            // 예외 발생 시 에러 상태와 메시지를 Map에 저장
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }
}