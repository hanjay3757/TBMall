package com.spring.service;

import java.util.ArrayList;
import java.util.List;

import com.spring.dto.StaffDto;

public interface StaffService {
	public ArrayList<StaffDto> getList();

	public StaffDto read(long member_no);

	public void remove(Long member_no);

	// 삭제된 계정 복구
	public void restore(Long member_no);

	// 삭제 계정 목록 조회
	public List<StaffDto> getDeletedList();

	public StaffDto login(String member_id, String member_pw);

	// 직원 정보 수정(닉네임, 비번, 휴대폰번호, 이메일 수정 가능)
	public void update(StaffDto staffDto);

}
