package com.example.demo.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/search")
@CrossOrigin(
    origins = {
        "http://localhost:3000", 
        "http://localhost:8081",
        "http://localhost:8080",
        "http://localhost:19006",
        "http://192.168.0.177:8081",
        "http://192.168.0.177:19006",
        "http://192.168.0.177:8080"
    },
    allowedHeaders = "*",
    allowCredentials = "true",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)