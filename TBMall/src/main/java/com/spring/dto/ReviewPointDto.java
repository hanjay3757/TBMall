package com.spring.dto;

import java.util.Date;

import lombok.Data;

@Data
public class ReviewPointDto {
	private Long reviewpoint_no;
	private Long comment_no;
	private Long item_id;
	private Long member_no;
	private int reviewpoint_amount;
	private Date reviewpoint_writedate;

	

	public ReviewPointDto() {
	}



	public ReviewPointDto(Long reviewpoint_no, Long comment_no, Long item_id, Long member_no, int reviewpoint_amount,
			Date reviewpoint_writedate) {
		super();
		this.reviewpoint_no = reviewpoint_no;
		this.comment_no = comment_no;
		this.item_id = item_id;
		this.member_no = member_no;
		this.reviewpoint_amount = reviewpoint_amount;
		this.reviewpoint_writedate = reviewpoint_writedate;
	}

}
