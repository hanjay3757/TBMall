package com.spring.service;

import java.util.ArrayList;
import java.util.List;

import com.spring.dto.PointDto;
import com.spring.dto.StaffDto;

public interface PointService {

	
//	//포인트 및 직위 관련
	public PointDto getPointPosition(Long member_no);
	
	public Long pointAdd(Long member_no);
	
	public void pointUse(Long itemId , Long member_no ,int quantity );

}
