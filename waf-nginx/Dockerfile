FROM owasp/modsecurity-crs:nginx

USER root

RUN apt-get update && apt-get install -y --no-install-recommends openssl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/nginx/conf && \
    openssl req -x509 -newkey rsa:4096 -keyout /etc/nginx/conf/server.key \
    -out /etc/nginx/conf/server.crt -days 7 -nodes \
    -subj "/C=FI/ST=UUSIMAA/L=Helsinki/O=HIVE/OU=Unit/CN=localhost"

COPY default.conf /etc/nginx/templates/conf.d/default.conf.template

RUN chmod 644 /etc/nginx/conf/server.key /etc/nginx/conf/server.crt

EXPOSE 443