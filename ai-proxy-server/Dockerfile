# --- build stage ---------------------------------------------------------------
FROM eclipse-temurin:25-jdk AS build
WORKDIR /build

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl unzip \
    && rm -rf /var/lib/apt/lists/*

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY src/ src/
RUN chmod +x mvnw && ./mvnw -q -B -DskipTests clean package

# --- run stage ---------------------------------------------------------------
FROM eclipse-temurin:25-jre AS run
WORKDIR /app
RUN useradd --system --uid 1001 spring
USER spring

COPY --from=build /build/target/ai-proxy-server-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
