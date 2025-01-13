package com.spring.dto;


import java.util.Date;

import lombok.Data;

@Data
public class CommentDto {
	private Long comment_no;
	private Long board_no;
	private Long member_no;
	private String comment_content;
	private Date comment_writedate;
	
	
	public CommentDto(Long board_no, Long member_no, String comment_content, Date comment_writedate) {
		this.board_no = board_no;
		this.member_no = member_no;
		this.comment_content = comment_content;
		this.comment_writedate = comment_writedate;
	}


	public CommentDto() {
	}
	
	
	
}
