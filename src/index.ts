#!/usr/bin/env node

import fs from "fs";
import figlet from "figlet";
import { Command } from "commander";
import { CloudKeysService } from "./utils";
console.log(figlet.textSync("CLOUD KEYS CLI"));

const service = new CloudKeysService();

const program = new Command();
program
  .version("1.0.0")
  .description("A CLI to download env variables")
  .option("-g, --generate <cloud_provider>", "Generate .env file")
  .option("-i, --init", "Create cloudkeys-config.json file")
  .parse(process.argv);

async function GenerateEnvFile(cloud_provider: string) {
  const data = fs.readFileSync("cloudkeys-config.json", "utf8");
  const keyVaultConfig = JSON.parse(data);
  const isValid = service.validateConfig(keyVaultConfig);
  if (isValid) {
    switch (cloud_provider) {
      case "azure":
        await service.generateAzureKeyvaultEnviormentVariables();
        return;
      case "aws":
        await service.generateAwsSecretsManagerEnviormentVariables();
        return;
      default:
        break;
    }
  }
}

const options = program.opts();
const cloud_provider = options.generate;
if (options.generate) {
  GenerateEnvFile(cloud_provider);
} else if (options.init) {
  service.createConfigFile();
}
