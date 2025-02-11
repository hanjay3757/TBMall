//package com.spring.service;
//
//import java.util.ArrayList;
//
//import com.spring.dto.BoardDto;
//import com.spring.dto.CommentDto;
//import com.spring.mapper.BoardMapper;
//import com.spring.mapper.StaffMapper;
//import com.spring.mapper.StuffMapper;
//
//import lombok.Data;
//
//@Data
//public class PagingProcessor {
//	private BoardMapper boardmapper;
//	private StaffMapper staffmapper;
//	private StuffMapper stuffmapper;
//	
//	private ArrayList<BoardDto> post;
//	private ArrayList<CommentDto> commentpost;
////	private ArrayList<E>
//	
//	private int currentPage =1;
//	private int totalPage =0;
//	
//	
//	
//	//페이징 시작
//	//1. 플럭의 총 갯수 (1페이징 블럭 = 보여줄 페이지 개수)
//	int totalBlock = 0;
//	
//	//2. 현재 위치에 있는 블럭
//	int currentBlock =0;
//	
//	//3. 블럭의 시작 페이지
//	int blockStartNo =0;
//	
//	//4. 블럭의 끝 페이지 
//	int blockEndNo =0;
//	
//	//5. 이전/다음 관련 초기화 
//	int prevPage =0;
//	int nextPage =0;
//	
//	//6. 이전/다음 계산 관련
//	boolean hasPrev = true;
//	boolean hasNext = true;
//	
//	public PagingProcessor(BoardMapper mapper, int currentPage) {
//		this.boardmapper = mapper;
//		this.currentPage = currentPage;
//		this.totalPage= 0;
//		
//		totalPage = getPageCount();
//		getList();
//		
//		//블럭 처리 , 총 블럭 갯수
//		totalBlock = (int)Math.ceil((double)totalPage/5);
//		
//		//현재 블럭
//		currentBlock = (int)Math.ceil((double)this.currentPage/5);
//		
//		//블럭 시작페이지
//		blockStartNo = (currentBlock-1)*5 +1;
//		
//		//블럭 끝 페이지 번호
//		blockEndNo = currentBlock*5;
//		
//		//이전/다음 관련 처리
//		//현재 블럭에서 이전/다음 가능한지 여부
//		if(currentBlock ==1) {
//			hasPrev = false;
//		}else {
//			hasPrev = true;
//			prevPage = (currentBlock-1)*5;
//		}
//		
//		if(currentBlock <totalBlock) {
//			hasNext = true;
//			nextPage = currentBlock*5+1;
//		}else {
//			hasNext = false;
//		}
//		
//	}
//	
//	public PagingProcessor(StaffMapper mapper , int currentPage) {
//		
//	}
//	
//	public PagingProcessor(StuffMapper mapper , int currentPage) {
//		
//	}
//	
////	//게시글 리스트 가져오는 메서드
//	public void getList() {
//		int startIndex = (currentPage-1) *5;
//		post = boardmapper.getBoardlist(startIndex);
//	}
//	//댓글 리스트 가져오는 메서드
////	public void getCommentList() {
////		int startIndex = (currentPage-1)*5;
////		commentpost = boardmapper.getCommentList(null)
////	}
//	
//	//총 게시글 수 가져와서 페이지 수로 변환하는 메서드
//	public int getPageCount() {
//		int totalPageCount =0;
//		int count= boardmapper.getPostCount();
//		if(count % 5 == 0) {
//			totalPageCount = count/5;
//		}else {
//			totalPageCount = count/5 +1;
//		}
//		
//		return totalPageCount;
//	}
//	
//	//글 르시스트 객체 얻어오는 함수
//	public ArrayList<BoardDto> getPost(){
//		return post;
//	}
//	
//}
