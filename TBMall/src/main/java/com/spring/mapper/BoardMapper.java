package com.spring.mapper;

import java.util.ArrayList;
import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.spring.dto.BoardDto;
import com.spring.dto.CommentDto;
import com.spring.dto.PagingDto;
import com.spring.dto.ReviewPointDto;

public interface BoardMapper {
	// 게시판 관련 기본
	public ArrayList<BoardDto> getBoardlist(PagingDto pagingDto); // 게시판 게시글 리스트 보기
//	public ArrayList<BoardDto> getBoardlist(); // 게시판 게시글 리스트 보기

	public BoardDto readContent(long board_no);// 게시판 글 보기

	public void writeContent(BoardDto boarddto);// 게시글 쓰기

	public int deleteOneContent(long board_no); // 게시글 삭제

	public int editContent(BoardDto boardDto);// 게시글 정보 수정(제목,글내용)

	public int getPostCount();// 게시판 페이징 관련 게시글 총 개수

	// 댓글 관련
	public List<CommentDto> getCommentList(@Param("item_id") Long item_id, @Param("pagingDto") PagingDto pagingDto); // 댓글
																														// 목록
																														// 가져오기

	public void writeComment(CommentDto commentDto);// 댓글 쓰기

	public int getCommentCount(@Param("item_id") Long item_id);

	// 댓글 삭제
	void deleteComment(Long comment_no);

//	void deleteCommentByItemAndMember(@Param("item_id") Long item_id, @Param("member_no") Long member_no);
//	
	
	 //별점 정보 입력하기
    public void insertReviewPoint(ReviewPointDto reviewpointDto);
    
    public int getReviewPointList(@Param("item_id") Long item_id); //별점 내용 가져오기

//    public double getAvgReviewPoint();

}
