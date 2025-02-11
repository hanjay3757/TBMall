package com.spring.dto;

import java.util.Date;

import lombok.Data;

@Data
public class StaffDto {

	public StaffDto() {
	};

	private Long admin_no;
	private Long position_no;
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
	private int member_delete;
	private Date member_delete_at;

//이름 교체
	public StaffDto(Long admin_no, Long member_no, String member_id, int delete_right_no) {
		super();
		this.admin_no = admin_no;
		this.member_no = member_no;
		this.member_id = member_id;
		this.delete_right_no = delete_right_no;
	}

	public int getAdmins() {
		if (this.admin_no != null && this.delete_right_no == 1) {
			return 1;
		}
		return 0;
	}

	public void setPassword(String member_pw) {
		this.member_pw = member_pw;

	}

}
