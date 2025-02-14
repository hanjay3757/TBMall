package com.spring.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.dto.BoardDto;
import com.spring.dto.PagingDto;
import com.spring.dto.PointDto;
import com.spring.dto.StaffDto;
import com.spring.mapper.PointMapper;
import com.spring.mapper.StaffMapper;

import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@Service
//@AllArgsConstructor
public class PointServiceImpl implements PointService {
//	public class StaffServiceImpl implements StaffService

	@Setter(onMethod_ = @Autowired)
	private PointMapper mapper;


	
	@Override
	public PointDto getPointPosition(Long member_no) {
		return mapper.getPointPosition(member_no);
	}
	
	@Override
	public Long pointAdd(Long member_no) {
		return mapper.pointAdd(member_no);
	}
	
	@Override
	public void pointUse(Long itemId, Long memberNo , int quantity) {
		Map<String, Object> paramMap = new HashMap<>();
		paramMap.put("itemId", itemId);
		paramMap.put("member_no", memberNo);
		paramMap.put("quantity", quantity);
		
		System.out.println("pointUse() paramMap:" +paramMap);
		
		mapper.pointUse(paramMap);
	}
	
}
