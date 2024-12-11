package com.spring.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.dto.StuffDto;
import com.spring.dto.CartDto;
import com.spring.mapper.StuffMapper;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class StuffServiceImpl implements StuffService {
    
    @Autowired
    private StuffMapper mapper;
    
    @Override
    public List<StuffDto> getItemList() {
        log.info("물건 목록 조회...");
        return mapper.getItemList();
    }
    
    @Override
    public void registerItem(StuffDto stuff) {
        log.info("물건 등록..." + stuff);
        mapper.registerItem(stuff);
    }
    
    @Override
    @Transactional
    public void addToCart(Long itemId, Long userId, int quantity) {
        log.info("장바구니에 추가: itemId=" + itemId + ", userId=" + userId + ", quantity=" + quantity);
        
        // 재고 확인
        int currentStock = mapper.checkStock(itemId);
        if (currentStock < quantity) {
            throw new RuntimeException("재고가 부족합니다. 현재 재고: " + currentStock);
        }
        
        // 장바구니에 추가
        mapper.addToCart(itemId, userId, quantity);
        
        // 재고 감소 (재고가 0이 되면 자동으로 deleted=1로 설정됨)
        mapper.updateStock(itemId, quantity);
        
        // 재고가 0이 되었는지 다시 확인하고 삭제 처리
        int remainingStock = mapper.checkStock(itemId);
        if (remainingStock <= 0) {
            log.info("재고가 0이 되어 자동으로 삭제됨: itemId=" + itemId);
            mapper.deleteItem(itemId);  // 물건을 삭제 상태로 변경
        }
    }
    
    @Override
    public List<CartDto> getCartItems(Long userId) {
        log.info("장바구니 조회: userId=" + userId);
        return mapper.getCartItems(userId);
    }
    
    @Override
    @Transactional
    public void removeFromCart(Long cartId) {
        log.info("장바구니에서 제거: cartId=" + cartId);
        
        // 재고 복구를 위해 카트 아이템 정보 조회
        CartDto cartItem = mapper.getCartItem(cartId);
        if (cartItem != null) {
            // 재고 증가 (음수 수량을 전달하여 재고 증가)
            mapper.updateStock(cartItem.getItemId(), -cartItem.getQuantity());
            // 장바구니에서 제거
            mapper.removeFromCart(cartId);
        }
    }
    
    @Override
    @Transactional
    public void processCheckout(Long userId) {
        try {
            // 장바구니 아이템을 주문으로 변환
            mapper.createOrder(userId);
            // 장바구니 비우기
            mapper.clearCart(userId);
        } catch (Exception e) {
            log.error("체크아웃 처리 중 오류 발생: " + e.getMessage());
            throw new RuntimeException("주문 처리 중 오류가 발생했습니다.");
        }
    }
    
    @Override
    public List<StuffDto> getDeletedItemList() {
        log.info("삭제된 물건 목록 조회");
        return mapper.getDeletedItemList();
    }
    
    @Override
    public void deleteItem(Long itemId) {
        log.info("물건 삭제: " + itemId);
        mapper.deleteItem(itemId);
    }
    
    @Override
    public void updateItem(StuffDto stuff) {
        log.info("물건 수정: " + stuff);
        mapper.updateItem(stuff);
    }
    
    @Override
    public StuffDto getItem(Long itemId) {
        log.info("물건 조회: " + itemId);
        return mapper.getItem(itemId);
    }
    
    @Override
    public void restoreItem(Long itemId) {
        log.info("물건 복구: " + itemId);
        mapper.restoreItem(itemId);
    }
    
    @Override
    @Transactional
    public void updateCartItemQuantity(Long cartId, int quantity) {
        log.info("장바구니 수량 업데이트: cartId=" + cartId + ", quantity=" + quantity);
        
        // 현재 카트 아이템 정보 조회
        CartDto currentItem = mapper.getCartItem(cartId);
        if (currentItem == null) {
            throw new RuntimeException("존재하지 않는 장바구니 아이템입니다.");
        }
        
        // 재고 확인
        int currentStock = mapper.checkStock(currentItem.getItemId());
        int stockDifference = quantity - currentItem.getQuantity();
        
        if (currentStock < stockDifference) {
            throw new RuntimeException("재고가 부족합니다.");
        }
        
        // 재고 업데이트
        mapper.updateStock(currentItem.getItemId(), stockDifference);
        
        // 장바구니 수량 업데이트
        mapper.updateCartItemQuantity(cartId, quantity);
    }
} 