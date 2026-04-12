FROM hashicorp/vault:1.15

# Install curl for health checking in setup script
USER root
RUN apk add --no-cache curl

# Server configuration
COPY config.hcl /vault/config/config.hcl

# Initialization script
COPY setup-secrets.sh /usr/local/bin/setup-secrets.sh
RUN chmod +x /usr/local/bin/setup-secrets.sh

# Data directory
RUN mkdir -p /vault/file && chown -R vault:vault /vault/file

USER vault

ENTRYPOINT ["/usr/local/bin/setup-secrets.sh"]
