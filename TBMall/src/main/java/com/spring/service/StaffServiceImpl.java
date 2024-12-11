package com.spring.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.dto.StaffDto;
import com.spring.mapper.StaffMapper;

import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@Service
//@AllArgsConstructor
public class StaffServiceImpl implements StaffService {
//	public class StaffServiceImpl implements StaffService

	@Setter(onMethod_ = @Autowired)
	private StaffMapper mapper;

	@Override
	public ArrayList<StaffDto> getList() {
		log.info("비지니스 계층===========");
		return mapper.getList();
	}

	@Override
	public StaffDto read(long bno) {
		return mapper.read(bno);
	}

	@Override
	public void remove(Long bno) {
		log.info("삭제" + bno);
		mapper.softDelete(bno);
	}

	@Override
	public void restore(Long bno) {
		log.info("복구: " + bno);
		mapper.restore(bno);
	}

	@Override
	public List<StaffDto> getDeletedList() {
		log.info("삭제된 비디오 목록 조회");
		return mapper.getDeletedStaff();
	}

	@Override
	public StaffDto login(String staffId, String password) {
		StaffDto staff = mapper.login(staffId, password);
		if (staff != null) {
			if (staff.getAdmins() == 1) {
				log.info("관리자 로그인 성공: " + staffId);
			} else {
				log.info("일반 사용자 로그인 성공: " + staffId);
			}
			return staff;
		}
		log.info("로그인 실패: " + staffId);
		return null;
	}

	@Override
	public void update(StaffDto staffDto) {
		log.info("직원 정보 수정: " + staffDto);
		mapper.update(staffDto);
	}

	@Override
	public void insertStaff(StaffDto staffDto) {
		log.info("직원 등록: " + staffDto);
		mapper.insertStaff(staffDto);
	}
}
