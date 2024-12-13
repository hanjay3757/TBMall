package com.spring.dto;

import java.util.Date;
import lombok.Data;

@Data
public class StuffDto {
    private Long itemId;
    private String itemName;
    private Integer price;
    private Integer stock;
    private String description;
    private Integer deleted;
    private Date regDate;
    private String imageUrl;
} 