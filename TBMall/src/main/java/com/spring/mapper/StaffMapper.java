package com.spring.mapper;

import java.util.ArrayList;
import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.spring.dto.StaffDto;

public interface StaffMapper {
	public ArrayList<StaffDto> getList(); // 회원 정보들 불러오는거?

	public StaffDto read(long member_no); // 회원 정보 보기

	public void adminAppoint(long member_no); // 관리자 권한 부여

	public void softDelete(Long member_no); // 관리자 삭제 권한 부여

	// 계정 복구
	public void restore(Long member_no);

	// 삭제된 관리자,계정 목록 조회
	public List<StaffDto> getDeletedStaff();

	// 삭제 권한 가진 관리자 목록 조회
	public List<StaffDto> getRightofDelete();

	// 로그인
	StaffDto login(@Param("member_id") String member_id, @Param("member_pw") String member_pw);

	// 직원 정보 수정(닉네임,비번,휴대폰 번호, 이메일 수정 가능)
	public int update(StaffDto staffDto);
}
