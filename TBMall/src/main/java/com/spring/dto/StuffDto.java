package com.spring.dto;

import java.util.Date;
import lombok.Data;

@Data
public class StuffDto {
    private Long item_id;
    private String item_name;
    private int item_price;
    private int item_stock;
    private String item_description;
    private String image_url;
    private Date reg_date;
    private Long admin_no;
    private int member_delete;
    private int item_delete;
    private Date delete_date;
    
    private int total_review_count;
    private int total_review_score;
    private double avg_review_score;
} 