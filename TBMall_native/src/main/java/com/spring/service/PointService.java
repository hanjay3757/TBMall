package com.spring.service;

import java.util.ArrayList;
import java.util.List;

import com.spring.dto.PointDto;
import com.spring.dto.StaffDto;

public interface PointService {
//	public ArrayList<StaffDto> getList(int currentPage , int pageSize); // 모든 회원 정보 가져오기
//	
//	public int getStaffCount(); // 모든 회원의 수 가져오기
//	
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
	
//	//포인트 및 직위 관련
	public PointDto getPointPosition(Long member_no);
	
	public Long pointAdd(Long member_no);
	
	public void pointUse(Long itemId , Long member_no ,int quantity );

}
