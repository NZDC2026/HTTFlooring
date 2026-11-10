FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /source
COPY pom.xml .
COPY src src
RUN mvn --batch-mode -DskipTests package

FROM eclipse-temurin:21-jre-jammy AS api
WORKDIR /app
COPY --from=build /source/target/htt-backend-java-0.1.0-SNAPSHOT.jar /app/htt.jar
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/htt.jar"]

FROM api AS migrations
ENV HTT_PROCESS_MODE=migrate

FROM eclipse-temurin:21-jre-jammy AS worker
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
COPY infra/pdf-requirements.txt /opt/pdf-requirements.txt
RUN python3 -m venv /opt/htt-pdf && /opt/htt-pdf/bin/pip install --no-cache-dir -r /opt/pdf-requirements.txt
ENV HTT_PYTHON=/opt/htt-pdf/bin/python3 HTT_PROCESS_MODE=worker HTT_PDF_FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
WORKDIR /app
COPY --from=build /source/target/htt-backend-java-0.1.0-SNAPSHOT.jar /app/htt.jar
USER 10001:10001
ENTRYPOINT ["java","-jar","/app/htt.jar"]
