package com.spring.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.dto.CartDto;
import com.spring.dto.StuffDto;
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
		log.info("장바구니 추가: itemId=" + itemId + ", userId=" + userId + ", quantity=" + quantity);

		// 재고 확인
		int currentStock = mapper.checkStock(itemId);
		if (currentStock < quantity) {
			throw new RuntimeException("재고가 부족합니다. 현재 재고: " + currentStock);
		}

		try {
			// 장바구니에 추가
			mapper.addToCart(itemId, userId, quantity);

			// 재고 감소
			mapper.updateStock(itemId, -quantity);
		} catch (Exception e) {
			log.error("장바구니 추가 실패: " + e.getMessage());
			throw new RuntimeException("장바구니 추가에 실패했습니다.");
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

		// 주문 정보 조회
		CartDto cartItem = mapper.getCartItem(cartId);
		if (cartItem != null) {
			// 재고 복구
			mapper.updateStock(cartItem.getItemId(), cartItem.getQuantity());
			// 주문 삭제
			mapper.removeFromCart(cartId);
		}
	}

	@Override
	@Transactional
	public void processCheckout(Long userId) {
		try {
			List<CartDto> cartItems = mapper.getCartItems(userId);
			if (cartItems.isEmpty()) {
				throw new RuntimeException("장바구니가 비어있습니다.");
			}

			// 장바구니 비우기 (재고는 이미 차감되어 있으므로 추가 조정 불필요)
			mapper.clearCart(userId);

		} catch (Exception e) {
			log.error("체크아웃 처리 중 오류 발생: " + e.getMessage());
			throw new RuntimeException("주문 처리 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	@Override
	public List<StuffDto> getDeletedItemList() {
		log.info("삭제된 물건 목록 조회");
		return mapper.getDeletedItemList();
	}

	@Override
	public void deleteItem(Long item_id) {
		log.info("물건 삭제: " + item_id);
		mapper.deleteItem(item_id);
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
		CartDto currentItem = mapper.getCartItem(cartId);
		if (currentItem == null) {
			throw new RuntimeException("장바구니 아이템을 찾을 수 없습니다.");
		}

		int stockDifference = currentItem.getQuantity() - quantity;
		int availableStock = mapper.checkStock(currentItem.getItemId());

		if (availableStock + stockDifference < 0) {
			throw new RuntimeException("재고가 부족합니다.");
		}

		mapper.updateCartItemQuantity(cartId, quantity);
		if (stockDifference != 0) {
			mapper.updateStock(currentItem.getItemId(), stockDifference);
		}
	}

	@Override
	public List<StuffDto> searchItems(String keyword) {
		log.info("상품 검색: " + keyword);
		return mapper.searchItems(keyword);
	}
}