package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.dto.CheckoutRequest;
import com.ecommerce.ecommerce.dto.PaymentVerifyRequest;
import com.ecommerce.ecommerce.model.*;
import com.ecommerce.ecommerce.repository.*;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Transactional
    public Map<String, Object> createOrder(String email, CheckoutRequest req) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) throw new RuntimeException("Cart is empty");

        // Validate stock for all items before creating order
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            if (p.getStock() != null && p.getStock() < ci.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + p.getName());
            }
        }

        double total = cartItems.stream()
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();

        // Create Razorpay order
        RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        JSONObject options = new JSONObject();
        options.put("amount", (int) (total * 100)); // amount in paise
        options.put("currency", "INR");
        options.put("receipt", "order_" + System.currentTimeMillis());
        com.razorpay.Order rzpOrder = client.orders.create(options);

        // Persist order in DB
        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(total);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setRazorpayOrderId(rzpOrder.get("id").toString());
        order.setAddress(req.getAddress());
        order.setPhone(req.getPhone());

        List<OrderItem> items = new ArrayList<>();
        for (CartItem ci : cartItems) {
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(ci.getProduct());
            oi.setQuantity(ci.getQuantity());
            oi.setPrice(ci.getProduct().getPrice());
            items.add(oi);
        }
        order.setItems(items);
        orderRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", rzpOrder.get("id").toString());
        response.put("amount", ((Number) rzpOrder.get("amount")).intValue());
        response.put("currency", "INR");
        response.put("key", razorpayKeyId);
        return response;
    }

    @Transactional
    public Map<String, String> verifyPayment(String email, PaymentVerifyRequest req) throws Exception {
        // Verify Razorpay HMAC-SHA256 signature
        String payload = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(
                razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        String generated = sb.toString();

        if (!generated.equals(req.getRazorpaySignature())) {
            throw new RuntimeException("Payment verification failed: invalid signature");
        }

        Order order = orderRepository.findByRazorpayOrderId(req.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Idempotency — prevent double-processing
        if (order.getStatus() == Order.OrderStatus.PAID) {
            return Map.of("message", "Already verified", "orderId", order.getId().toString());
        }

        order.setStatus(Order.OrderStatus.PAID);
        order.setPaymentId(req.getRazorpayPaymentId());
        orderRepository.save(order);

        // Deduct stock for each ordered item
        List<OrderItem> orderItems = order.getItems();
        if (orderItems != null) {
            for (OrderItem oi : orderItems) {
                Product p = oi.getProduct();
                if (p != null && p.getStock() != null && oi.getQuantity() != null) {
                    p.setStock(Math.max(0, p.getStock() - oi.getQuantity()));
                    productRepository.save(p);
                }
            }
        }

        // Clear the user's cart
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        cartItemRepository.deleteByUser(user);

        return Map.of("message", "Payment verified successfully", "orderId", order.getId().toString());
    }

    public List<Order> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Order> getAllOrders() {
        // Return newest orders first
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Order updateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        try {
            order.setStatus(Order.OrderStatus.valueOf(status.trim().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }
        return orderRepository.save(order);
    }
}
