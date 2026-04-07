package com.ecommerce.ecommerce.config;

import com.ecommerce.ecommerce.model.Product;
import com.ecommerce.ecommerce.repository.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Component
@Order(1)   // run before anything else that depends on products
public class FakestoreSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(FakestoreSeeder.class);
    private static final String FAKESTORE_URL = "https://fakestoreapi.com/products";

    @Autowired private ProductRepository productRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("FakestoreSeeder: checking product table...");
        try {
            RestTemplate restTemplate = new RestTemplate();
            String json = restTemplate.getForObject(FAKESTORE_URL, String.class);

            if (json == null || json.isBlank()) {
                log.warn("FakestoreSeeder: empty response from FakeStore API");
                return;
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode products = mapper.readTree(json);

            int seeded = 0;
            for (JsonNode node : products) {
                int fakestoreId = node.get("id").asInt();

                if (productRepository.existsByFakestoreId(fakestoreId)) continue;

                Product p = new Product();
                p.setFakestoreId(fakestoreId);
                p.setName(node.get("title").asText());
                p.setPrice(node.get("price").asDouble());
                p.setDescription(node.get("description").asText());
                p.setImage(node.get("image").asText());
                p.setCategory(node.get("category").asText());
                p.setStock(99);

                JsonNode rating = node.get("rating");
                if (rating != null) {
                    p.setRating(rating.get("rate").asDouble());
                    p.setRatingCount(rating.get("count").asInt());
                }

                productRepository.save(p);
                seeded++;
            }

            if (seeded > 0) {
                log.info("FakestoreSeeder: ✅ seeded {} products", seeded);
            } else {
                log.info("FakestoreSeeder: ✅ all {} products already in DB", productRepository.count());
            }

        } catch (Exception e) {
            log.error("FakestoreSeeder: ❌ failed — {}", e.getMessage(), e);
        }
    }
}
