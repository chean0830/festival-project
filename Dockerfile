# --- build stage ---------------------------------------------------------------
# Java 25 (matches <java.version>25</java.version> in pom.xml).
FROM eclipse-temurin:25-jdk AS build
WORKDIR /build

# The Maven wrapper is in "only-script" mode, so it downloads Maven itself and
# needs curl + unzip available.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl unzip \
    && rm -rf /var/lib/apt/lists/*

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY src/ src/
RUN chmod +x mvnw && ./mvnw -q -B -DskipTests clean package

# --- run stage ---------------------------------------------------------------
# If the -jre tag is ever unavailable, fall back to eclipse-temurin:25-jdk.
FROM eclipse-temurin:25-jre AS run
WORKDIR /app

# Uploaded files live here; docker-compose mounts a named volume on this path
# so they survive container rebuilds.
RUN mkdir -p /app/uploads && useradd --system --uid 1001 spring && chown -R spring /app
USER spring

COPY --from=build /build/target/demo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
