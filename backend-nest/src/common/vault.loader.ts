import vault = require('node-vault');

export async function loadVaultSecrets() {
  const client = vault({
    apiVersion: 'v1',
    endpoint: process.env.VAULT_ADDR || 'http://vault:8200',
    token: process.env.VAULT_TOKEN || 'root-token',
  });

  console.log('Attempting to load secrets from Vault...');

  while (true) {
    try {
      // Reading from KV engine v2 path: secret/data/<path>
      const response = await client.read('secret/data/movie-secrets');
      
      console.log('Vault secrets loaded successfully.');
      // Return the actual key-value data
      return response.data.data; 
    } catch (error: any) {
      console.log('Waiting for Vault secrets... Please save data in Vault UI (localhost:8200).');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}