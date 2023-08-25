#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const figlet_1 = __importDefault(require("figlet"));
const commander_1 = require("commander");
const utils_1 = require("./utils");
console.log(figlet_1.default.textSync("CLOUD KEYS CLI"));
const data = fs_1.default.readFileSync("cloudkeys-config.json", "utf8");
const keyVaultConfig = JSON.parse(data);
const service = new utils_1.CloudKeysService(keyVaultConfig);
const program = new commander_1.Command();
program
    .version("1.0.0")
    .description("A CLI to download env variables")
    .option("-g, --generate", "Generate .env file")
    .parse(process.argv);
function GenerateEnvFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const isValid = service.validateConfig();
        if (isValid) {
            yield service.generateEnv();
        }
    });
}
const options = program.opts();
if (options.generate) {
    GenerateEnvFile();
}
