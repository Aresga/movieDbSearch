#!/bin/sh
set -e

# Config
export VAULT_ADDR='http://127.0.0.1:8200'
STORAGE_DIR='/vault/file'
UNSEAL_FILE="$STORAGE_DIR/vault_unseal_key"
TOKEN_FILE="$STORAGE_DIR/vault_root_token"
INIT_TEMP="$STORAGE_DIR/init.txt"

# Start Vault server in background
echo "Starting Vault server..."
vault server -config=/vault/config/config.hcl &
VAULT_PID=$!

# Wait for API availability (max 30s)
echo "Waiting for Vault to be ready..."
MAX_RETRIES=30
COUNT=0
until curl -s $VAULT_ADDR/v1/sys/health > /dev/null; do
  COUNT=$((COUNT + 1))
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "Error: Vault startup timed out."
    kill $VAULT_PID
    exit 1
  fi
  sleep 1
done

# Initialize Vault if not already initialized
if ! vault status -format=json | grep -Eq '"initialized"[[:space:]]*:[[:space:]]*true'; then
  echo "First-time setup: Initializing Vault..."
  vault operator init -key-shares=1 -key-threshold=1 > "$INIT_TEMP"

  grep "Unseal Key 1:" "$INIT_TEMP" | awk '{print $NF}' > "$UNSEAL_FILE"
  grep "Initial Root Token:" "$INIT_TEMP" | awk '{print $NF}' > "$TOKEN_FILE"
  rm -f "$INIT_TEMP"

  chmod 600 "$UNSEAL_FILE"
  chmod 644 "$TOKEN_FILE"
  echo "Initialization complete."
fi

# Auto-unseal Vault using stored key
if [ -f $UNSEAL_FILE ]; then
  echo "Unsealing Vault..."
  vault operator unseal $(cat $UNSEAL_FILE)
fi

# Authenticate and provision initial secrets
export VAULT_TOKEN=$(cat $TOKEN_FILE)
echo "Provisioning initial KV secrets..."
vault secrets enable -path=secret kv-v2 || true
vault kv put secret/movies @/run/secrets/initial_secrets

echo "Vault is ready and unsealed."
wait $VAULT_PID
