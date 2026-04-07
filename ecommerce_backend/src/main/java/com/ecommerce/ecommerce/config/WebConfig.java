package com.ecommerce.ecommerce.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded product images
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir);

        // Explicitly block the default static resource handler from
        // intercepting /api/** paths — prevents "No static resource" errors
        // on endpoints like /api/products/fakestore/{id}
        registry.addResourceHandler("/api/**")
                .addResourceLocations("classpath:/DOES_NOT_EXIST/");
    }

    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        // Do NOT enable default servlet — keeps all unmatched requests going to DispatcherServlet
    }
}
