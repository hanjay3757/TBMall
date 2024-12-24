package com.spring.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.dto.CartDto;
import com.spring.dto.StuffDto;
import com.spring.mapper.StuffMapper;

import lombok.extern.log4j.Log4j;

/**
 * 물건과 장바구니 관련 비즈니스 로직을 처리하는 서비스 구현체
 * 
 * 참고: views/stuff 디렉토리가 없어도 서비스 로직은 정상 동작합니다.
 * 뷰 파일이 없는 경우 해당 페이지만 404 에러가 발생하며,
 * 백엔드 API는 정상적으로 동작합니다.
 */
@Log4j
@Service
public class StuffServiceImpl implements StuffService {

    /**
     * MyBatis Mapper 인터페이스 주입
     */
    @Autowired
    private StuffMapper mapper;

    /**
     * 전체 물건 목록을 조회하는 메서드
     * @return 물건 목록(List<StuffDto>)
     */
    @Override
    public List<StuffDto> getItemList() {
        log.info("물건 목록 조회...");
        return mapper.getItemList();
    }

    /**
     * 새로운 물건을 등록하는 메서드
     * @param stuff 등록할 물건 정보
     */
    @Override
    public void registerItem(StuffDto stuff) {
        log.info("물건 등록..." + stuff);
        mapper.registerItem(stuff);
    }

    /**
     * 장바구니에 물건을 추가하는 메서드
     * 재고를 확인하고 충분한 경우에만 장바구니에 추가
     * @param itemId 물건 ID
     * @param userId 사용자 ID
     * @param quantity 수량
     */
    @Override
    @Transactional
    public void addToCart(Long itemId, Long userId, int quantity) {
        log.info("장바구니 추가: itemId=" + itemId + ", userId=" + userId + ", quantity=" + quantity);

        // 현재 재고 수량 확인
        int currentStock = mapper.checkStock(itemId);
        if (currentStock < quantity) {
            throw new RuntimeException("재고가 부족합니다. 현재 재고: " + currentStock);
        }

        try {
            // 장바구니에 물건 추가
            mapper.addToCart(itemId, userId, quantity);

            // 재고 수량 감소
            mapper.updateStock(itemId, -quantity);
        } catch (Exception e) {
            log.error("장바구니 추가 실패: " + e.getMessage());
            throw new RuntimeException("장바구니 추가에 실패했습니다.");
        }
    }

    /**
     * 사용자의 장바구니 목록을 조회하는 메서드
     * @param userId 사용자 ID
     * @return 장바구니 목록(List<CartDto>)
     */
    @Override
    public List<CartDto> getCartItems(Long userId) {
        log.info("장바구니 조회: userId=" + userId);
        return mapper.getCartItems(userId);
    }

    /**
     * 장바구니에서 물건을 제거하는 메서드
     * 제거 시 해당 수량만큼 재고 복구
     * @param cartId 장바구니 ID
     */
    @Override
    @Transactional
    public void removeFromCart(Long cartId) {
        log.info("장바구니에서 제거: cartId=" + cartId);

        // 장바구니 아이템 정보 조회
        CartDto cartItem = mapper.getCartItem(cartId);
        if (cartItem != null) {
            // 재고 수량 복구
            mapper.updateStock(cartItem.getItemId(), cartItem.getQuantity());
            // 장바구니에서 아이템 제거
            mapper.removeFromCart(cartId);
        }
    }

    /**
     * 장바구니 결제 처리 메서드
     * 장바구니의 모든 물건을 처리하고 장바구니를 비움
     * @param userId 사용자 ID
     */
    @Override
    @Transactional
    public void processCheckout(Long userId) {
        try {
            List<CartDto> cartItems = mapper.getCartItems(userId);
            if (cartItems.isEmpty()) {
                throw new RuntimeException("장바구니가 비어있습니다.");
            }

            // 장바구니 비우기 (재고는 이미 차감되어 있음)
            mapper.clearCart(userId);

        } catch (Exception e) {
            log.error("체크아웃 처리 중 오류 발생: " + e.getMessage());
            throw new RuntimeException("주문 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 삭제된 물건 목록을 조회하는 메서드
     * @return 삭제된 물건 목록(List<StuffDto>)
     */
    @Override
    public List<StuffDto> getDeletedItemList() {
        log.info("삭제된 물건 목록 조회");
        return mapper.getDeletedItemList();
    }

    /**
     * 물건을 삭제하는 메서드
     * @param item_id 삭제할 물건 ID
     */
    @Override
    public void deleteItem(Long item_id) {
        log.info("물건 삭제: " + item_id);
        mapper.deleteItem(item_id);
    }

    /**
     * 물건 정보를 수정하는 메서드
     * @param stuff 수정할 물건 정보
     */
    @Override
    public void updateItem(StuffDto stuff) {
        log.info("물건 수정: " + stuff);
        mapper.updateItem(stuff);
    }

    /**
     * 특정 물건 정보를 조회하는 메서드
     * @param itemId 조회할 물건 ID
     * @return 물건 정보(StuffDto)
     */
    @Override
    public StuffDto getItem(Long itemId) {
        log.info("물건 조회: " + itemId);
        return mapper.getItem(itemId);
    }

    /**
     * 삭제된 물건을 복구하는 메서드
     * @param itemId 복구할 물건 ID
     */
    @Override
    public void restoreItem(Long itemId) {
        log.info("물건 복구: " + itemId);
        mapper.restoreItem(itemId);
    }

    /**
     * 장바구니 물건의 수량을 업데이트하는 메서드
     * 재고 확인 후 수량 변경 및 재고 조정
     * @param cartId 장바구니 ID
     * @param quantity 변경할 수량
     */
    @Override
    @Transactional
    public void updateCartItemQuantity(Long cartId, int quantity) {
        // 현재 장바구니 아이템 정보 조회
        CartDto currentItem = mapper.getCartItem(cartId);
        if (currentItem == null) {
            throw new RuntimeException("장바구니 아이템을 찾을 수 없습니다.");
        }

        // 수량 변경에 따른 재고 차이 계산
        int stockDifference = currentItem.getQuantity() - quantity;
        // 현재 가용 재고 확인
        int availableStock = mapper.checkStock(currentItem.getItemId());

        // 재고 부족 체크
        if (availableStock + stockDifference < 0) {
            throw new RuntimeException("재고가 부족합니다.");
        }

        // 장바구니 수량 업데이트
        mapper.updateCartItemQuantity(cartId, quantity);
        // 재고 수량 조정
        if (stockDifference != 0) {
            mapper.updateStock(currentItem.getItemId(), stockDifference);
        }
    }
}