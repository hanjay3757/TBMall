package com.spring.dto;

import lombok.Data;

@Data
//직위, 포인트 관련 DTO
public class PointDto {
	private int position_no;
	private int point_no;
	private int point_amount;
	
	//StaffDto 포함
	private StaffDto staffDto;
	
	
	public PointDto(int position_no, int point_no, int point_amount , StaffDto staffDto) {
		this.position_no = position_no;
		this.point_no = point_no;
		this.point_amount = point_amount;
		this.staffDto = staffDto;
	}
	
	public PointDto() {
	}
	
	
}
