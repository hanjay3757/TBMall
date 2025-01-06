package com.spring.mapper;

import java.util.ArrayList;

import com.spring.dto.BoardDto;

public interface BoardMapper {
	public ArrayList<BoardDto> getBoardlist(); // 게시판 게시글 리스트 보기

	// 게시판 글 보기
	public BoardDto readContent(long board_no);

	// 게시글 쓰기
	public void writeContent(BoardDto boarddto);

	// 게시글 삭제
	public int deleteOneContent(long board_no);

//	public StaffDto read(long member_no); // 회원 정보 보기
//
//	public void adminAppoint(long member_no); // 관리자 권한 부여
//
//	public int softDelete(Long member_no); // 소프트 삭제
//
//	// 계정 복구
//	public int restore(Long member_no);
//
//	// 삭제된 관리자,계정 목록 조회
//	public List<StaffDto> getDeletedStaff();
//
//	// 삭제 권한 가진 관리자 목록 조회
//	public List<StaffDto> getRightofDelete();
//
//	// 로그인
//	StaffDto login(@Param("member_id") String member_id, @Param("member_pw") String member_pw);
//
	// 게시글 정보 수정(제목,글내용)
	public int editContent(BoardDto boardDto);
//
//	// 아이디 중복 체크
//	public int checkIdDuplicate(String member_id);
//
//	// 직원 등록
//	public void register(StaffDto staffDto);
}
