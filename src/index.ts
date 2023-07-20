#! /usr/bin/env node

import figlet from "figlet";
import { Command } from "commander";
import fs from "fs";
console.log(figlet.textSync("CLOUD KEYS"));
const program = new Command();
program
  .version("1.0.0")
  .description("A CLI to download env variables")
  .option("-g, --generate", "Generate .env file")
  .parse(process.argv);

async function GenerateEnvFile() {
  const filePath = "./.env";
  const content = "This is the content of the new file.";
  try {
    fs.writeFile(filePath, content, (err) => {
      if (err) {
        console.error("Error creating the file:", err);
      } else {
        console.log("File created successfully!");
      }
    });
  } catch (error) {}
}

const options = program.opts();
if (options.generate) {
  GenerateEnvFile();
}
