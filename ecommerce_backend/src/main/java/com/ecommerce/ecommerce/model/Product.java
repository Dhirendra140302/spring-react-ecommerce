package com.ecommerce.ecommerce.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(length = 2000)
    private String description;

    @Column(length = 1000)
    private String image;

    private String category;

    private Integer stock = 99;

    private Double rating = 0.0;

    private Integer ratingCount = 0;

    // Tracks the original FakeStore product ID so the frontend can match them
    @Column(unique = true)
    private Integer fakestoreId;
}
