import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import keyVaultConfig from "../cloudkeys-config.json";
import { writeFileSync } from "fs";

// A Util to check if json file contains all the keys
const hasAllKeys = (obj: Record<string, any>, keys: string[]): boolean => {
  for (const key of keys) {
    if (!(key in obj)) {
      return false;
    }
  }
  return true;
};
// List of keys to check for in the json file
const keysToCheck = ["keyVaultUrl"];
const hasAll = hasAllKeys(keyVaultConfig, keysToCheck);
if (hasAll) {
  const envData = [];
  const keyVaultUrl = keyVaultConfig.keyVaultUrl;
  const credential = new DefaultAzureCredential();
  const client = new SecretClient(keyVaultUrl, credential);
  async function main() {
    for await (const secretProperties of client.listPropertiesOfSecrets()) {
      const secretName = secretProperties.name;
      const secret = await client.getSecret(secretName);
      const secretValue = secret.value;
      envData.push(`${secretName}=${secretValue}`);
    }
    writeFileSync(".env", envData.join("\n"));
    console.log("Secrets exported to .env file.");
  }
  main();
} else {
  throw new Error("Json not complete");
}
