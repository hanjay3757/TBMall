package com.spring.dto;

import java.util.Date;

import lombok.Data;

@Data
public class BoardDto {
	private Long board_no;
	private Long member_no;
	private String board_title;
	private String board_content;
	private int board_readcount;
	private Date board_writedate;

	public BoardDto() {

	}

	public BoardDto(Long board_no, Long member_no, String board_content) {
		super();
		this.board_no = board_no;
		this.member_no = member_no;
		this.board_content = board_content;
	}

}
