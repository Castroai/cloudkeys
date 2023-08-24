#!/usr/bin/env node

import fs from "fs";
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import figlet from "figlet";
import { Command } from "commander";
console.log(figlet.textSync("CLOUD KEYS"));

const data = fs.readFileSync("cloudkeys-config.json", "utf8");

const keyVaultConfig = JSON.parse(data);
// A Util to check if json file contains all the keys
const hasAllKeys = (obj: Record<string, any>, keys: string[]): boolean => {
  for (const key of keys) {
    if (!(key in obj)) {
      return false;
    }
  }
  return true;
};

const program = new Command();
program
  .version("1.0.0")
  .description("A CLI to download env variables")
  .option("-g, --generate", "Generate .env file")
  .parse(process.argv);

async function GenerateEnvFile() {
  const keysToCheck = ["keyVaultUrl"];
  const hasAll = hasAllKeys(keyVaultConfig, keysToCheck);
  if (hasAll) {
    const envData = [];
    const keyVaultUrl = keyVaultConfig.keyVaultUrl;
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(keyVaultUrl, credential);
    for await (const secretProperties of client.listPropertiesOfSecrets()) {
      const secretName = secretProperties.name;
      const secret = await client.getSecret(secretName);
      const secretValue = secret.value;
      envData.push(`${secretName}=${secretValue}`);
    }
    fs.writeFileSync(".env", envData.join("\n"));
    console.log("Secrets exported to .env file.");
  } else {
    throw new Error("Json not complete");
  }
}

const options = program.opts();
if (options.generate) {
  GenerateEnvFile();
}
