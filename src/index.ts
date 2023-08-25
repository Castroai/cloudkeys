#!/usr/bin/env node

import fs from "fs";
import figlet from "figlet";
import { Command } from "commander";
import { CloudKeysService } from "./utils";
console.log(figlet.textSync("CLOUD KEYS CLI"));

const data = fs.readFileSync("cloudkeys-config.json", "utf8");
const keyVaultConfig = JSON.parse(data);
const service = new CloudKeysService(keyVaultConfig);

const program = new Command();
program
  .version("1.0.0")
  .description("A CLI to download env variables")
  .option("-g, --generate", "Generate .env file")
  .parse(process.argv);

async function GenerateEnvFile() {
  const isValid = service.validateConfig();
  if (isValid) {
    await service.generateEnv();
  }
}

const options = program.opts();
if (options.generate) {
  GenerateEnvFile();
}
