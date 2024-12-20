package com.spring.dto;

import lombok.Data;
import java.util.Date;

@Data
public class CartDto {
    private Long cartId;
    private Long itemId;
    private Long memberNo;
    private int quantity;
    private String itemName;
    private int itemPrice;
    private int itemStock;
    private String imageUrl;
    private int totalPrice;
    private Date orderDate;
    private boolean itemDelete;
} 