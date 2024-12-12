package com.spring.dto;

import lombok.Data;

@Data
public class StaffDto {

	public StaffDto() {
	};

	private Long admin_no;
	private Long member_no;
	private String member_id;
	private String member_pw;
	private String member_nick;
	private String member_gender;
	private String member_birth;
	private String member_phone;
	private String member_email;
	private String member_joindate;
	private int delete_right_no;

	public StaffDto(Long admin_no, Long member_no, String member_id, int delete_right_no) {
		super();
		this.admin_no = admin_no;
		this.member_no = member_no;
		this.member_id = member_id;
		this.delete_right_no = delete_right_no;
	}

}
