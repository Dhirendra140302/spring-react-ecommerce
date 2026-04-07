package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.model.*;
import com.ecommerce.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    @Autowired private WishlistRepository wishlistRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;

    public List<Wishlist> getWishlist(String email) {
        User user = getUser(email);
        return wishlistRepository.findByUser(user);
    }

    @Transactional
    public Wishlist addToWishlist(String email, Long productId) {
        User user = getUser(email);
        if (wishlistRepository.existsByUserAndProductId(user, productId)) {
            throw new RuntimeException("Product already in wishlist");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Wishlist w = new Wishlist();
        w.setUser(user);
        w.setProduct(product);
        return wishlistRepository.save(w);
    }

    @Transactional
    public void removeFromWishlist(String email, Long productId) {
        User user = getUser(email);
        Wishlist w = wishlistRepository.findByUserAndProductId(user, productId)
                .orElseThrow(() -> new RuntimeException("Product not in wishlist"));
        wishlistRepository.delete(w);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
