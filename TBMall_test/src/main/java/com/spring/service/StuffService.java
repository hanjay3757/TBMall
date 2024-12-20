package com.spring.service;

import java.util.List;

import com.spring.dto.CartDto;
import com.spring.dto.StuffDto;

public interface StuffService {
	// 물건 관련
	public List<StuffDto> getItemList();

	public void registerItem(StuffDto stuff);

	// 물건 삭제 기능 24.12.17
	public void deleteItem(Long item_id);

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