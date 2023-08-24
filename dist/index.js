#! /usr/bin/env node
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const identity_1 = require("@azure/identity");
const keyvault_secrets_1 = require("@azure/keyvault-secrets");
const fs_1 = require("fs");
const figlet_1 = __importDefault(require("figlet"));
const commander_1 = require("commander");
const data = fs_2.default.readFileSync("cloudkeys-config.json", "utf8");
const keyVaultConfig = JSON.parse(data);
// A Util to check if json file contains all the keys
const hasAllKeys = (obj, keys) => {
    for (const key of keys) {
        if (!(key in obj)) {
            return false;
        }
    }
    return true;
};
const fs_2 = __importDefault(require("fs"));
console.log(figlet_1.default.textSync("CLOUD KEYS"));
const program = new commander_1.Command();
program
    .version("1.0.0")
    .description("A CLI to download env variables")
    .option("-g, --generate", "Generate .env file")
    .parse(process.argv);
function GenerateEnvFile() {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const keysToCheck = ["keyVaultUrl"];
        const hasAll = hasAllKeys(keyVaultConfig, keysToCheck);
        if (hasAll) {
            const envData = [];
            const keyVaultUrl = keyVaultConfig.keyVaultUrl;
            const credential = new identity_1.DefaultAzureCredential();
            const client = new keyvault_secrets_1.SecretClient(keyVaultUrl, credential);
            try {
                for (var _d = true, _e = __asyncValues(client.listPropertiesOfSecrets()), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const secretProperties = _c;
                    const secretName = secretProperties.name;
                    const secret = yield client.getSecret(secretName);
                    const secretValue = secret.value;
                    envData.push(`${secretName}=${secretValue}`);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            (0, fs_1.writeFileSync)(".env", envData.join("\n"));
            console.log("Secrets exported to .env file.");
        }
        else {
            throw new Error("Json not complete");
        }
    });
}
const options = program.opts();
if (options.generate) {
    GenerateEnvFile();
}
