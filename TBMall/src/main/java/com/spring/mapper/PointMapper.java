package com.spring.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

import com.spring.dto.PagingDto;
import com.spring.dto.PointDto;
import com.spring.dto.StaffDto;

public interface PointMapper {

	//직위 및 포인트 관련
		public PointDto getPointPosition (long member_no); //직위와 잔여 포인트 가져오기
		
		
		//출석체크시 포인트 차등 지급
		public Long pointAdd(long member_no); //직위에 따라 출책시 포인트 지급
		
		//포인트 차감 
		public void pointUse(Map<String, Object> paramMap);

}
