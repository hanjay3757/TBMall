package com.spring.dto;

import lombok.Data;

@Data
public class StaffDto {

	public StaffDto() {
	};

	private Long bno;
	private String id;
	private String password;
	private String btext;
	private int admins;
	private int deleted;

	public StaffDto(Long bno, String btext, int admins) {
		super();
		this.bno = bno;
		this.btext = btext;
		this.admins = admins;
	}
}
