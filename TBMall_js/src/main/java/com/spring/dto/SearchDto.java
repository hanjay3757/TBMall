package com.spring.dto;

import java.util.List;
import lombok.Data;

@Data
public class SearchDto {

	@Data
	public static class ItemResponse {
		private Long itemId;
		private String itemName;
		private int itemPrice;
		private int itemStock;
		private String itemDescription;
		private String imageUrl;

		// 생성자
		public ItemResponse(Long itemId, String itemName, int itemPrice, int itemStock, String itemDescription,
				String imageUrl) {
			this.itemId = itemId;
			this.itemName = itemName;
			this.itemPrice = itemPrice;
			this.itemStock = itemStock;
			this.itemDescription = itemDescription;
			this.imageUrl = imageUrl;
		}
	}

	@Data
	public static class SearchResponse {
		private List<ItemResponse> items;

		public SearchResponse(List<ItemResponse> items) {
			this.items = items;
		}
	}

	@Data
	public static class SearchRequest {
		private String keyword;
	}
}
