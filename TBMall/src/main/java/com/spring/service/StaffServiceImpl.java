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

	// 관리자 정보 가져오기
	@Override
	public ArrayList<StaffDto> getAdminList() {
		log.info("관리자 API 가져와");
		return mapper.getAdminList();
	}

	@Override
	public StaffDto read(long member_no) {
		return mapper.read(member_no);
	}

	@Override
	public void remove(Long member_no) {
		log.info("직원 삭제: " + member_no);

		// 삭제하려는 직원이 관리자인지 확인
		StaffDto staff = mapper.read(member_no);
		if (staff != null && staff.getAdmins() == 1) {
			throw new RuntimeException("관리자는 삭제할 수 없습니다.");
		}

		mapper.softDelete(member_no);
	}

	@Override
	public void restore(Long member_no) {
		log.info("복구: " + member_no);
		mapper.restore(member_no);
	}

	@Override
	public List<StaffDto> getDeletedList() {
		log.info("삭제된 직원 목록 조회");
		return mapper.getDeletedStaff();
	}

	@Override
	public StaffDto login(String member_id, String member_pw) {
		StaffDto staff = mapper.login(member_id, member_pw);
		if (staff != null) {
			if (staff.getMember_delete() == 1) {
				log.info("삭제된 계정으로 로그인 시도: " + member_id);
				return null;
			}
			if (staff.getAdmins() == 1) {
				log.info("관리자 로그인 성공: " + member_id);
			} else {
				log.info("일반 사용자 로그인 성공: " + member_id);
			}
			return staff;
		}
		log.info("로그인 실패: " + member_id);
		return null;
	}

	@Override
	public void update(StaffDto staffDto) {
		log.info("직원 정보 수정: " + staffDto);
		mapper.update(staffDto);
	}
}
