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
exports.CloudKeysService = void 0;
const identity_1 = require("@azure/identity");
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const keyvault_secrets_1 = require("@azure/keyvault-secrets");
const fs_1 = __importDefault(require("fs"));
const configMap = {
    azure: {
        type: "object",
    },
    aws: {
        type: "object",
    },
    currentEnvPath: {
        type: "string",
    },
    newEnvPath: {
        type: "string",
    },
    createBackup: {
        type: "boolean",
    },
    merge: {
        type: "boolean",
    },
};
class CloudKeysService {
    constructor() {
        this.configMap = configMap;
        this.createConfigFile = () => {
            const file = {
                currentEnvPath: "./.env",
                newEnvPath: "./env",
                createBackup: true,
                merge: true,
                azure: {
                    keyVaultUrl: "https://KEYVAULT.vault.azure.net/",
                },
                aws: {
                    region: "REGION",
                },
            };
            fs_1.default.appendFile("./cloudkeys-config.json", JSON.stringify(file), (err) => {
                if (err)
                    throw err;
                console.log("Saved!");
            });
        };
    }
    validateConfig(jsonConfig) {
        this.jsonConfig = jsonConfig;
        for (const key in this.configMap) {
            if (this.configMap.hasOwnProperty(key)) {
                const expectedType = this.configMap[key].type;
                const actualValue = this.jsonConfig[key];
                if (typeof actualValue !== expectedType) {
                    console.error(`Validation failed for key: ${key}. Expected type: ${expectedType}, Actual value: ${JSON.stringify(actualValue)} of type ${typeof actualValue}`);
                    return false;
                }
            }
        }
        return true;
    }
    generateAzureKeyvaultEnviormentVariables() {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const envData = [];
            const { azure, currentEnvPath, newEnvPath, createBackup, merge } = this.jsonConfig;
            if (createBackup) {
                this.createBackup(currentEnvPath);
            }
            const credential = new identity_1.DefaultAzureCredential();
            const client = new keyvault_secrets_1.SecretClient(azure.keyVaultUrl, credential);
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
            if (merge) {
                const current = this.parseEnvFile(currentEnvPath);
                const incoming = envData.map((data) => {
                    const [key, value] = data.split("=");
                    if (key && value) {
                        const envObject = { [key]: value };
                        return envObject;
                    }
                });
                const newMergedEnv = this.mergeEnvArrays(current, incoming).map((value) => {
                    return `${Object.keys(value)[0]}=${Object.values(value)[0]}`;
                });
                fs_1.default.writeFileSync(newEnvPath, newMergedEnv.join("\n"));
                console.log(`Secrets exported to ${newEnvPath} file.`);
                return;
            }
            fs_1.default.writeFileSync(newEnvPath, envData.join("\n"));
            console.log(`Secrets exported to ${newEnvPath} file.`);
        });
    }
    generateAwsSecretsManagerEnviormentVariables() {
        return __awaiter(this, void 0, void 0, function* () {
            const envData = [];
            const { aws, currentEnvPath, newEnvPath, createBackup, merge } = this.jsonConfig;
            if (createBackup) {
                this.createBackup(currentEnvPath);
            }
            const client = new client_secrets_manager_1.SecretsManagerClient({ region: aws.region });
            const input = {
            // // ListSecretsRequest
            // IncludePlannedDeletion: true || false,
            // MaxResults: Number("int"),
            // NextToken: "STRING_VALUE",
            // Filters: [
            //   // FiltersListType
            //   {
            //     // Filter
            //     Key:
            //       "description" ||
            //       "name" ||
            //       "tag-key" ||
            //       "tag-value" ||
            //       "primary-region" ||
            //       "owning-service" ||
            //       "all",
            //     Values: [
            //       // FilterValuesStringList
            //       "STRING_VALUE",
            //     ],
            //   },
            // ],
            // SortOrder: "asc" || "desc",
            };
            const command = new client_secrets_manager_1.ListSecretsCommand(input);
            // for await (const secretProperties of client.listPropertiesOfSecrets()) {
            //   const secretName = secretProperties.name;
            //   const secret = await client.getSecret(secretName);
            //   const secretValue = secret.value;
            //   envData.push(`${secretName}=${secretValue}`);
            // }
            if (merge) {
                const current = this.parseEnvFile(currentEnvPath);
                const incoming = envData.map((data) => {
                    const [key, value] = data.split("=");
                    if (key && value) {
                        const envObject = { [key]: value };
                        return envObject;
                    }
                });
                const newMergedEnv = this.mergeEnvArrays(current, incoming).map((value) => {
                    return `${Object.keys(value)[0]}=${Object.values(value)[0]}`;
                });
                fs_1.default.writeFileSync(newEnvPath, newMergedEnv.join("\n"));
                console.log(`Secrets exported to ${newEnvPath} file.`);
                return;
            }
            fs_1.default.writeFileSync(newEnvPath, envData.join("\n"));
            console.log(`Secrets exported to ${newEnvPath} file.`);
        });
    }
    createBackup(currentEnvPath) {
        if (!fs_1.default.existsSync(currentEnvPath)) {
            console.error(`File does not exist: ${currentEnvPath}`);
            return;
        }
        // Generate the backup file path by adding a '.backup' extension
        const backupFilePath = `${currentEnvPath}.${new Date().getTime()}.backup`;
        // Use fs.createReadStream and fs.createWriteStream to copy the file
        const readStream = fs_1.default.createReadStream(currentEnvPath);
        const writeStream = fs_1.default.createWriteStream(backupFilePath);
        // Copy the file data
        readStream.pipe(writeStream);
        // Handle errors during the copying process
        readStream.on("error", (err) => {
            console.error(`Error reading the file: ${err}`);
        });
        writeStream.on("error", (err) => {
            console.error(`Error writing the backup file: ${err}`);
        });
        writeStream.on("finish", () => {
            console.log(`Backup file created: ${backupFilePath}`);
        });
    }
    parseEnvFile(filePath) {
        const envArray = [];
        try {
            const envFileContents = fs_1.default.readFileSync(filePath, "utf-8");
            const lines = envFileContents.split("\n");
            for (const line of lines) {
                const [key, value] = line.split("=");
                if (key && value) {
                    const envObject = { [key]: value };
                    envArray.push(envObject);
                }
            }
        }
        catch (error) {
            console.error(`Error reading or parsing the .env file: ${error}`);
        }
        return envArray;
    }
    mergeEnvArrays(arr1, arr2) {
        // Create a map to hold the merged values
        const mergedMap = {};
        // Add values from the first array to the merged map
        for (const env of arr1) {
            for (const key in env) {
                if (env.hasOwnProperty(key)) {
                    mergedMap[key] = env[key];
                }
            }
        }
        // Add values from the second array, which will override values from the first array if there are duplicates
        for (const env of arr2) {
            for (const key in env) {
                if (env.hasOwnProperty(key)) {
                    mergedMap[key] = env[key];
                }
            }
        }
        // Convert the merged map back to an array of objects
        const mergedArray = [];
        for (const key in mergedMap) {
            if (mergedMap.hasOwnProperty(key)) {
                const envObject = { [key]: mergedMap[key] };
                mergedArray.push(envObject);
            }
        }
        return mergedArray;
    }
}
exports.CloudKeysService = CloudKeysService;
