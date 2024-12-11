package com.spring.service;

import java.util.List;
import com.spring.dto.StuffDto;
import com.spring.dto.CartDto;

public interface StuffService {
    // 물건 관련
    public List<StuffDto> getItemList();
    public void registerItem(StuffDto stuff);
    public void deleteItem(Long itemId);
    public void updateItem(StuffDto stuff);
    public StuffDto getItem(Long itemId);
    public List<StuffDto> getDeletedItemList();
    public void restoreItem(Long itemId);
    
    // 장바구니 관련
    public void addToCart(Long itemId, Long userId, int quantity);
    public List<CartDto> getCartItems(Long userId);
    public void removeFromCart(Long cartId);
    void processCheckout(Long userId);
    void updateCartItemQuantity(Long cartId, int quantity);
} 