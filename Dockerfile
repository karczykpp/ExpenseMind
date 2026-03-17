# Etap 1: Budowanie (Kompilacja kodu)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Kopiujemy pliki konfiguracyjne i kod źródłowy
COPY pom.xml .
COPY src ./src

# Budujemy paczkę .jar (pomijamy testy, żeby było szybciej)
RUN mvn clean package -DskipTests

# Etap 2: Uruchomienie (Lekki kontener tylko z niezbędną Javą)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Kopiujemy zbudowany plik z Etapu 1
COPY --from=build /app/target/*.jar app.jar

# Informujemy chmurę, że nasza apka działa na porcie 8080
EXPOSE 8080

# Komenda uruchamiająca serwer
ENTRYPOINT ["java", "-jar", "app.jar"]