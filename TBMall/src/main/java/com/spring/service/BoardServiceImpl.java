package com.spring.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.dto.BoardDto;
import com.spring.dto.CommentDto;
import com.spring.dto.PagingDto;
import com.spring.mapper.BoardMapper;

import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@Service
//@AllArgsConstructor
public class BoardServiceImpl implements BoardService {
//	public class StaffServiceImpl implements StaffService

	@Setter(onMethod_ = @Autowired)
	private BoardMapper mapper;

	@Override
	public ArrayList<BoardDto> getBoardlist(int currentPage ,int pageSize) {
		log.info("게시판 내 모든 글 리스트 가져오기");
		
		
		
		//페이징 계산
		int offset = (currentPage-1)* pageSize;
		
		PagingDto pagingDto = new PagingDto(pageSize, offset);
		
		//mapper 호출
		ArrayList<BoardDto> board = mapper.getBoardlist(pagingDto);
		return board;
	}
	
	@Override
	public int getPostCount() {
		int totalCount = mapper.getPostCount();
		return totalCount;
	}

	@Override
	public BoardDto readContent(long board_no) {
		log.info("선택한 글 내용 보기");
		return mapper.readContent(board_no);
	}

	@Override
	public void writeContent(BoardDto boarddto) {
		log.info("글 작성");

		mapper.writeContent(boarddto);
	}

	@Override
	public int deleteOneContent(Long board_no) {
		log.info("게시글 삭제: " + board_no);
		try {
			return mapper.deleteOneContent(board_no);
		} catch (Exception e) {
			log.error("게시글 삭제 실패: " + e.getMessage());
			throw new RuntimeException("게시글 삭제에 실패했습니다.");
		}
	}

	@Override
	@Transactional
	public void editContent(BoardDto boardDto) {
		log.info("게시글 수정 수정: " + boardDto);

		try {
			// 수정 실행
			mapper.editContent(boardDto);

		} catch (Exception e) {
			log.error("게시글 수정 오류:", e);
		}

	}
	
//	@Override
//	public List<CommentDto> getCommentList(Long board_no ,int currentComment , int cpageSize) {
//		log.info("해당 board_no 내에 모든 댓글 가져오기");
//		int offset = (currentComment-1) * cpageSize;
//		
//		PagingDto pagingDto = new PagingDto(cpageSize, offset);
//		
//		return mapper.getCommentList(board_no , pagingDto);
//	}
//	
//	@Override
//	public int getCommentCount(Long board_no) {
//		int totalComment = mapper.getCommentCount(board_no);
//		return totalComment;
//	}
//	
//	@Override
//	public void writeComment(CommentDto commentDto) {
//		if (commentDto.getBoard_no() == null || commentDto.getMember_no() == null || commentDto.getComment_content() == null) {
//	        throw new IllegalArgumentException("댓글 정보가 올바르지 않습니다.");
//	    }
//		mapper.writeComment(commentDto);
//	}


}
