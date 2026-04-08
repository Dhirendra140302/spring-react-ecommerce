# ── Stage 1: Build ───────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
# Cache dependencies layer separately
COPY pom.xml .
RUN mvn dependency:go-offline -q
# Build
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=build /app/target/ecommerce-0.0.1-SNAPSHOT.jar app.jar
# Cloud Run injects PORT env var — must listen on it
EXPOSE 8080
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
