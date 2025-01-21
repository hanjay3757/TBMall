package com.spring.mapper;

import java.util.ArrayList;
import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.spring.dto.PagingDto;
import com.spring.dto.PointDto;
import com.spring.dto.StaffDto;

public interface StaffMapper {
	public ArrayList<StaffDto> getList(PagingDto pagingDto); // 모든 회원 정보 불러오기
	
	public int getStaffCount(); // 회원 총 수 
	
	public ArrayList<StaffDto> getAdminList(); // 관리자 정보 불러오기

	public StaffDto read(long member_no); // 회원 정보 보기

	public void adminAppoint(long member_no); // 관리자 권한 부여

	public int softDelete(Long member_no); // 소프트 삭제

	// 계정 복구
	public int restore(Long member_no);

	// 삭제된 관리자,계정 목록 조회
	public List<StaffDto> getDeletedStaff();

	// 삭제 권한 가진 관리자 목록 조회
	public List<StaffDto> getRightofDelete();

	// 로그인
	StaffDto login(@Param("member_id") String member_id, @Param("member_pw") String member_pw);

	// 직원 정보 수정(닉네임,비번,휴대폰 번호, 이메일 수정 가능)
	public int update(StaffDto staffDto);

	// 아이디 중복 체크
	public int checkIdDuplicate(String member_id);

	// 직원 등록
	public void register(StaffDto staffDto);
	
	
//	
//	//직위 및 포인트 관련
//	public PointDto getPointPosition (long member_no); //직위와 잔여 포인트 가져오기
	
}
