# Stage 1: Build the application using Gradle
FROM gradle:7.6.1-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle clean jar --no-daemon

# Stage 2: Run the application
FROM ibm-semeru-runtimes:open-17-jre-focal
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

ENV PORT 8080
EXPOSE 8080

CMD java -jar app.jar
