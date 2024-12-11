package com.spring.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Param;
import com.spring.dto.StuffDto;
import com.spring.dto.CartDto;

public interface StuffMapper {
    // 물건 관련
    public List<StuffDto> getItemList();
    public void registerItem(StuffDto stuff);
    public int checkStock(Long itemId);
    public void updateStock(@Param("itemId") Long itemId, @Param("quantity") int quantity);
    
    // 물건 삭제 (soft delete)
    public void deleteItem(Long itemId);
    
    // 물건 수정
    public void updateItem(StuffDto stuff);
    
    // 물건 조회
    public StuffDto getItem(Long itemId);
    
    // 삭제된 물건 목록
    public List<StuffDto> getDeletedItemList();
    
    // 물건 복구
    public void restoreItem(Long itemId);
    
    // 장바구니 관련
    public void addToCart(@Param("itemId") Long itemId, 
                         @Param("userId") Long userId, 
                         @Param("quantity") int quantity);
    public List<CartDto> getCartItems(Long userId);
    public void removeFromCart(Long cartId);
    void createOrder(Long userId);
    void clearCart(Long userId);
    
    // 장바구니 아이템 단일 조회
    public CartDto getCartItem(Long cartId);
    
    // 장바구니 수량 업데이트
    public void updateCartItemQuantity(@Param("cartId") Long cartId, @Param("quantity") int quantity);
}
