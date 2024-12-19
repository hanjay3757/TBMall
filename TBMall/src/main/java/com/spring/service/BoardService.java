package com.spring.service;

import java.util.ArrayList;

import com.spring.dto.BoardDto;

public interface BoardService {
	public ArrayList<BoardDto> getBoardlist(); // 모든 글 정보 가져오기

	// 게시판 내 글 읽기
	public BoardDto readContent(long board_no);

	// 게시판 글 쓰기
	public void writeContent(BoardDto dto);

//	public ArrayList<StaffDto> getAdminList(); // 모든 관리자 정보 가져오기
//
//	public StaffDto read(long member_no);
//
//	public void softDelete(Long member_no);
//
//	// 삭제된 계정 복구
//	public void restore(Long member_no);
//
//	// 삭제 계정 목록 조회
//	public List<StaffDto> getDeletedList();
//
//	public StaffDto login(String member_id, String member_pw);
//
//	// 직원 정보 수정(닉네임, 비번, 휴대폰번호, 이메일 수정 가능)
//	public void update(StaffDto staffDto);
//
//	boolean checkIdDuplicate(String member_id);
//
//	public void register(StaffDto staffDto);
//
//	public void adminAppoint(Long member_no); // 추가

}
