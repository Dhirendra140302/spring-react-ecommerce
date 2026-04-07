package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.model.CartItem;
import com.ecommerce.ecommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired private CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(cartService.getCart(user.getUsername()));
    }

    @PostMapping
    public CartItem addToCart(@AuthenticationPrincipal UserDetails user,
                              @RequestBody Map<String, Object> body) {
        if (body.get("productId") == null) throw new RuntimeException("productId is required");
        Long productId = Long.valueOf(body.get("productId").toString());
        int quantity = body.containsKey("quantity") ? Integer.parseInt(body.get("quantity").toString()) : 1;
        if (quantity <= 0) throw new RuntimeException("Quantity must be at least 1");
        return cartService.addToCart(user.getUsername(), productId, quantity);
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<?> updateQuantity(@AuthenticationPrincipal UserDetails user,
                                            @PathVariable Long itemId,
                                            @RequestBody Map<String, Integer> body) {
        CartItem item = cartService.updateQuantity(user.getUsername(), itemId, body.get("quantity"));
        return ResponseEntity.ok(item != null ? item : Map.of("message", "Item removed"));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> removeItem(@AuthenticationPrincipal UserDetails user,
                                        @PathVariable Long itemId) {
        cartService.removeItem(user.getUsername(), itemId);
        return ResponseEntity.ok(Map.of("message", "Item removed"));
    }
}
