package com.spring.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.spring.dto.CartDto;
import com.spring.dto.PagingDto;
import com.spring.dto.StuffDto;

public interface StuffMapper {
	// 물건 관련
	public List<StuffDto> getItemList(PagingDto pagingDto);

	//페이징 목적 등록 물건의 총 개수 구하는 메서드
	public int getCountItemList();
	
	public void registerItem(StuffDto stuff);

	public StuffDto getItem(Long item_id);

	public void updateItem(StuffDto stuff);

	public void deleteItem(Long item_id);

	public List<StuffDto> getDeletedItemList();

	public void restoreItem(Long item_id);

	// 재고 관련
	public int checkStock(@Param("itemId") Long item_id);

	public void updateStock(@Param("itemId") Long item_id, @Param("quantity") int quantity);

	// 장바구니 관련
	public void addToCart(@Param("itemId") Long itemId, @Param("userId") Long userId, @Param("quantity") int quantity);

	public List<CartDto> getCartItems(@Param("member_no") Long memberNo);

	public CartDto getCartItem(@Param("cartId") Long cartId);

	public void removeFromCart(@Param("cartId") Long cartId);

	public void updateCartItemQuantity(@Param("cartId") Long cartId, @Param("quantity") int quantity);

	public void clearCart(@Param("member_no") Long memberNo);

	public int getActiveItemCount();
}
