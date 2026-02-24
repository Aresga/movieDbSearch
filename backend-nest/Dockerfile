FROM node:24-alpine
WORKDIR /app
RUN apk add openssl
COPY package*.json ./
RUN npm install
COPY . .
RUN chmod +x docker-entrypoint.sh
EXPOSE 3000
CMD ["/bin/sh", "./docker-entrypoint.sh"]