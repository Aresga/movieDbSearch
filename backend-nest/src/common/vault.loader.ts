import * as fs from 'fs';
import vault = require('node-vault');

export async function loadVaultSecrets() {
  // Read token from secret file
  const tokenPath = process.env.VAULT_TOKEN_FILE;

  if (!tokenPath) {
    throw new Error('VAULT_TOKEN_FILE environment variable is not set.');
  }

  const vaultToken = fs.readFileSync(tokenPath, 'utf8').trim();

  const client = vault({
    apiVersion: 'v1',
    endpoint: process.env.VAULT_ADDR,
    token: vaultToken,
  });

  console.log('Connecting to Vault...');

  while (true) {
    try {
      // Get secrets from KV-v2 path
      const response = await client.read('secret/data/movies');
      const secrets = response.data.data;

      Object.assign(process.env, secrets);
      
      process.env.DATABASE_URL = `postgresql://${process.env.POSTGRES_USER}:${secrets.POSTGRES_PASSWORD}@postgres:5432/${process.env.POSTGRES_DB}?schema=public`;
      process.env.MONGO_URI = `mongodb://${process.env.MONGO_ROOT_USERNAME}:${secrets.MONGO_ROOT_PASSWORD}@mongodb:27017/${process.env.MONGO_DB_NAME}?authSource=admin`;

      console.log('Vault secrets loaded.');
      return response.data.data; 
    } catch (error: any) {
      // Retry if secrets are not yet injected
      console.log('Waiting for secrets injection...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}