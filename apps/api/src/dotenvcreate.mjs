import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

console.time('dotenvcreate');

const secretsManagerClient = new SecretsManagerClient({
  region: 'eu-west-2',
});

const secretName = process.argv[2];

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to retrieve secret value
async function getSecretValue(secretName) {
  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const data = await secretsManagerClient.send(command);

    // Check if the secret value is a string or binary
    if (data.SecretString) {
      return JSON.parse(data.SecretString);
    } else {
      // Handle binary secret value (optional)
      let buff = Buffer.from(data.SecretBinary, 'base64');

      return JSON.parse(buff.toString('ascii'));
    }
  } catch (err) {
    console.error('Error retrieving secret:', err);
    throw err;
  }
}

// Function to escape or quote values for .env format
function escapeValue(value) {
  // If the value contains special characters or spaces, quote it
  if (value && /[ \t"=$]/.test(value)) {
    // Escape existing double quotes and wrap the value in quotes
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

// Function to update or add to .env file with new key-value pairs
async function updateEnvFile() {
  try {
    const secret = await getSecretValue(secretName);
    const envPath = resolve(__dirname, '.env'); // Ensure .env is created in the script's directory

    // Read the existing .env file if it exists
    let envContent = '';
    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf8');
    }

    // Create a Map to store existing keys from .env
    const existingEnvVars = new Map();
    envContent.split('\n').forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        existingEnvVars.set(key.trim(), value.trim());
      }
    });

    // Convert secret into .env format
    const newEnvVariables = Object.entries(secret).map(([key, value]) => {
      // Escape value to handle special characters/spaces correctly
      const escapedValue = escapeValue(value);

      // Update or add new key-value pair
      if (existingEnvVars.has(key)) {
        existingEnvVars.set(key, escapedValue); // Update existing value
      } else {
        existingEnvVars.set(key, escapedValue); // Add new key-value pair
      }
    });

    // Combine all the updated key-value pairs into a string
    const updatedEnvContent = Array.from(existingEnvVars.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Write the updated .env file
    writeFileSync(envPath, updatedEnvContent);
    console.log('.env file updated successfully');
  } catch (err) {
    console.error('Error updating .env file:', err);
  }
}

// Run the script
updateEnvFile();
console.timeEnd('dotenvcreate');