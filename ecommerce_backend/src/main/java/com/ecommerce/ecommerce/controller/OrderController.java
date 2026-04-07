package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.dto.CheckoutRequest;
import com.ecommerce.ecommerce.dto.PaymentVerifyRequest;
import com.ecommerce.ecommerce.model.Order;
import com.ecommerce.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CheckoutRequest req) throws Exception {
        return ResponseEntity.ok(orderService.createOrder(user.getUsername(), req));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyPayment(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody PaymentVerifyRequest req) throws Exception {
        return ResponseEntity.ok(orderService.verifyPayment(user.getUsername(), req));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Order>> myOrders(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(orderService.getUserOrders(user.getUsername()));
    }
}
