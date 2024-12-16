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
    private Date reg_date;
    private int admin_no;
    private int member_delete;
    private int item_delete;
    private Date delete_date;
} 