package com.spring.mapper;

import java.util.ArrayList;
import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.spring.dto.BoardDto;
import com.spring.dto.CommentDto;
import com.spring.dto.PagingDto;

public interface BoardMapper {
	//게시판 관련 기본
	public ArrayList<BoardDto> getBoardlist(PagingDto pagingDto); // 게시판 게시글 리스트 보기
//	public ArrayList<BoardDto> getBoardlist(); // 게시판 게시글 리스트 보기
	public BoardDto readContent(long board_no);// 게시판 글 보기
	public void writeContent(BoardDto boarddto);// 게시글 쓰기
	public int deleteOneContent(long board_no);	// 게시글 삭제
	public int editContent(BoardDto boardDto);// 게시글 정보 수정(제목,글내용)
	
	public int getPostCount();// 게시판 페이징 관련 게시글 총 개수
	
	
	// 댓글 관련
	public List<CommentDto> getCommentList(@Param("board_no") Long board_no, @Param("pagingDto") PagingDto pagingDto); //댓글 목록 가져오기
	public void writeComment(CommentDto commentDto);//댓글 쓰기

	public int getCommentCount(@Param("board_no") Long board_no);
}
