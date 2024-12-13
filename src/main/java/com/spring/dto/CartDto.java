package com.spring.dto;

import lombok.Data;

@Data
public class CartDto {
    private Long cartId;
    private Long itemId;
    private Long userId;
    private int quantity;
    private int price;
    private String itemName;
    private int totalPrice;
} 