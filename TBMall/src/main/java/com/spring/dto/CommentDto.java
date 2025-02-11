package com.spring.dto;

import java.util.Date;

import lombok.Data;

@Data
public class CommentDto {
	private Long comment_no;
	private Long item_id;
	private Long member_no;
	private String comment_content;
	private Date comment_writedate;
	private int reviewpoint_amount;

	public CommentDto(Long item_id, Long member_no, String comment_content, Date comment_writedate) {
		this.item_id = item_id;
		this.member_no = member_no;
		this.comment_content = comment_content;
		this.comment_writedate = comment_writedate;
	}

	public CommentDto() {
	}

}
