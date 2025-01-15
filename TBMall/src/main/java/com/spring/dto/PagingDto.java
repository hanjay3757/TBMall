package com.spring.dto;

import lombok.Data;

@Data
public class PagingDto {
	private int limit;  // 한 페이지에 표시할 게시글 수
    private int offset; // 조회 시작 위치
	
    public PagingDto(int limit, int offset) {
		super();
		this.limit = limit;
		this.offset = offset;
	}
    
}
