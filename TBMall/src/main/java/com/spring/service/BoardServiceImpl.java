package com.spring.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.dto.BoardDto;
import com.spring.dto.CommentDto;
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
	public ArrayList<BoardDto> getBoardlist() {
		log.info("게시판 내 모든 글 리스트 가져오기");
		return mapper.getBoardlist();
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
	public void deleteOneContent(long board_no) {
		log.info("게시글 삭제");

		int result = mapper.deleteOneContent(board_no);
		if (result != 1) {
			throw new RuntimeException("게시물 삭제에 실패했습니다.");
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
	
	@Override
	public List<CommentDto> getCommentList(Long board_no) {
		log.info("해당 board_no 내에 모든 댓글 가져오기");
		return mapper.getCommentList(board_no);
	}
	
	@Override
	public void writeComment(CommentDto commentDto) {
		if (commentDto.getBoard_no() == null || commentDto.getMember_no() == null || commentDto.getComment_content() == null) {
	        throw new IllegalArgumentException("댓글 정보가 올바르지 않습니다.");
	    }
		mapper.writeComment(commentDto);
	}

//	@Override
//	public ArrayList<StaffDto> getList() {
//		log.info("비지니스 계층===========");
//		return mapper.getList();
//	}
//
//	// 관리자 정보 가져오기
//	@Override
//	public ArrayList<StaffDto> getAdminList() {
//		log.info("관리자 API 가져와");
//		return mapper.getAdminList();
//	}
//
//	@Override
//	public StaffDto read(long member_no) {
//		return mapper.read(member_no);
//	}
//
//	@Override
//	public void softDelete(Long member_no) {
//		log.info("직원 삭제: " + member_no);
//
//		// 삭제하려는 직원이 관리자인지 확인
//		StaffDto staff = mapper.read(member_no);
//		if (staff != null && staff.getAdmins() == 1) {
//			throw new RuntimeException("관리자는 삭제할 수 없습니다.");
//		}
//
//		// 소프트 삭제 실행
//		int result = mapper.softDelete(member_no);
//		if (result != 1) {
//			throw new RuntimeException("직원 삭제에 실패했습니다.");
//		}
//	}
//
//	@Override
//	public void restore(Long member_no) {
//		log.info("직원 복구: " + member_no);
//
//		// 복구 실행
//		int result = mapper.restore(member_no);
//		if (result != 1) {
//			throw new RuntimeException("직원 복구에 실패했습니다.");
//		}
//	}
//
//	@Override
//	public List<StaffDto> getDeletedList() {
//		log.info("삭제된 직원 목록 조회");
//		return mapper.getDeletedStaff();
//	}
//
//	@Override
//	public StaffDto login(String member_id, String member_pw) {
//		StaffDto staff = mapper.login(member_id, member_pw);
//		if (staff != null) {
//			if (staff.getMember_delete() == 1) {
//				log.info("삭제된 계정으로 로그인 시도: " + member_id);
//				return null;
//			}
//			if (staff.getAdmins() == 1) {
//				log.info("관리자 로그인 성공: " + member_id);
//			} else {
//				log.info("일반 사용자 로그인 성공: " + member_id);
//			}
//			return staff;
//		}
//		log.info("로그인 실패: " + member_id);
//		return null;
//	}
//
//	@Override
//	public void update(StaffDto staffDto) {
//		log.info("직원 정보 수정: " + staffDto);
//
//		// 수정 실행
//		int result = mapper.update(staffDto);
//		if (result != 1) {
//			throw new RuntimeException("직원 정보 수정에 실패했습니다.");
//		}
//	}
//
//	@Override
//	public boolean checkIdDuplicate(String member_id) {
//		return mapper.checkIdDuplicate(member_id) > 0;
//	}
//
//	@Override
//	public void register(StaffDto staffDto) {
//		log.info("직원 등록: " + staffDto);
//		try {
//			mapper.register(staffDto);
//		} catch (Exception e) {
//			log.error("직원 등록 실패: " + e.getMessage());
//			throw new RuntimeException("직원 등록에 실패했습니다: " + e.getMessage());
//		}
//	}
//
//	@Override
//	public void adminAppoint(Long member_no) {
//		mapper.adminAppoint(member_no);
//	}
}
