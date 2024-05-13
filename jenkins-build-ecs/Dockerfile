FROM openjdk:17-jdk-alpine

ARG JAR_FILE

ENV JAR_FILE=${JAR_FILE}

WORKDIR /app

COPY Build/libs/${JAR_FILE} /app/

CMD java -jar ${JAR_FILE}