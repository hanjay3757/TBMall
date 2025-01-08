package com.spring.service;

import java.util.ArrayList;
import java.util.List;

import com.spring.dto.BoardDto;
import com.spring.dto.CommentDto;

public interface BoardService {
	public ArrayList<BoardDto> getBoardlist(); // 모든 글 정보 가져오기

	// 게시판 내 글 읽기
	public BoardDto readContent(long board_no);

	// 게시판 글 쓰기
	public void writeContent(BoardDto boarddto);

	// 게시판 글 삭제
	public void deleteOneContent(long board_no);
	
	// 게시글 정보 수정(제목,글내용 수정 가능)
	public void editContent(BoardDto boarddto);

	
	//댓글 관련
	public List<CommentDto> getCommentList(Long board_no);//댓글 리스트 가져오기
	public void writeComment(CommentDto commentDto);//댓글 쓰기
	


}
