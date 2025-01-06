//package com.spring.controller;
//
//import java.util.ArrayList;
//import java.util.List;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestMethod;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//import com.spring.dto.SearchDto;
//import com.spring.dto.SearchDto.ItemResponse;
//import com.spring.dto.StuffDto;
//import com.spring.service.StuffService;
//
//@RestController
//@RequestMapping("/search")
//@CrossOrigin(
//	origins = "*",
//	allowedHeaders = "*",
//	methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
//)
//public class SearchController {
//
//	private static final Logger log = LoggerFactory.getLogger(SearchController.class);
//
//	@Autowired
//	private StuffService stuffService;
//
//	@PostMapping("/items")
//	public ResponseEntity<?> searchItems(@RequestBody SearchDto.SearchRequest request) {
//		List<StuffDto> items = stuffService.searchItems(request.getKeyword());
//		List<ItemResponse> results = new ArrayList<>();
//
//		for (StuffDto item : items) {
//			ItemResponse itemResponse = new ItemResponse(item.getItem_id(), item.getItem_name(), item.getItem_price(),
//					item.getItem_stock(), item.getItem_description(), item.getImage_url());
//			results.add(itemResponse);
//		}
//
//		return ResponseEntity.ok(new SearchDto.SearchResponse(results));
//	}
//
//	@GetMapping("/items")
//	public ResponseEntity<?> searchItemsGet(@RequestParam(required = false) String keyword) {
//		try {
//			List<StuffDto> items = stuffService.searchItems(keyword);
//			List<ItemResponse> results = new ArrayList<>();
//			
//			for (StuffDto item : items) {
//				String imageUrl = item.getImage_url();
//				if (imageUrl != null && imageUrl.startsWith("https://")) {
//					imageUrl = imageUrl.replace("https://", "http://");
//				}
//				
//				ItemResponse itemResponse = new ItemResponse(
//					item.getItem_id(), 
//					item.getItem_name(),
//					item.getItem_price(), 
//					item.getItem_stock(), 
//					item.getItem_description(), 
//					imageUrl
//				);
//				results.add(itemResponse);
//			}
//			
//			return ResponseEntity.ok()
//				.header("Access-Control-Allow-Origin", "*")
//				.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
//				.header("Access-Control-Allow-Headers", "*")
//				.body(new SearchDto.SearchResponse(results));
//		} catch (Exception e) {
//			log.error("검색 중 오류 발생: ", e);
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//				.body("검색 중 오류가 발생했습니다.");
//		}
//	}
//}
