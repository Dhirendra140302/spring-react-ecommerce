package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.model.Wishlist;
import com.ecommerce.ecommerce.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired private WishlistService wishlistService;

    @GetMapping
    public List<Wishlist> getWishlist(@AuthenticationPrincipal UserDetails user) {
        return wishlistService.getWishlist(user.getUsername());
    }

    @PostMapping("/{productId}")
    public Wishlist add(@AuthenticationPrincipal UserDetails user, @PathVariable Long productId) {
        return wishlistService.addToWishlist(user.getUsername(), productId);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> remove(@AuthenticationPrincipal UserDetails user, @PathVariable Long productId) {
        wishlistService.removeFromWishlist(user.getUsername(), productId);
        return ResponseEntity.ok(Map.of("message", "Removed from wishlist"));
    }
}
