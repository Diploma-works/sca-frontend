# Сборка на этапе билда
FROM maven:3.9.4-eclipse-temurin-17 AS builder

WORKDIR /build

COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .

RUN ./mvnw dependency:go-offline

COPY src src
RUN ./mvnw clean package -DskipTests

# Финальный рантайм-образ
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

USER root
RUN apk update && apk add git

RUN addgroup -S appuser && adduser -S appuser -G appuser
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
