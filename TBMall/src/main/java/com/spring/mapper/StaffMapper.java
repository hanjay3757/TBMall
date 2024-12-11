package com.spring.mapper;

import java.util.ArrayList;
import java.util.List;

import com.spring.dto.StaffDto;
import org.apache.ibatis.annotations.Param;

public interface StaffMapper {
	public ArrayList<StaffDto> getList();

	public StaffDto read(long bno);

	public void softDelete(Long bno);

	public void restore(Long vno);

	// 삭제된 비디오 목록 조회
	public List<StaffDto> getDeletedStaff();

	StaffDto login(@Param("staffId") String staffId, @Param("password") String password);

	// 직원 정보 수정
	public int update(StaffDto staffDto);

	public void insertStaff(StaffDto staffDto);
}
