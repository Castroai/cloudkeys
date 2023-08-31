import { DefaultAzureCredential } from "@azure/identity";
import {
  SecretsManagerClient,
  ListSecretsCommand,
  ListSecretsCommandInput,
} from "@aws-sdk/client-secrets-manager";
import { SecretClient } from "@azure/keyvault-secrets";
import fs from "fs";

interface KeyObject {
  type: string;
}
interface EnvObject {
  [key: string]: string;
}
const configMap: Record<string, KeyObject> = {
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

export class CloudKeysService {
  private configMap = configMap;
  private jsonConfig;
  constructor() {}
  public validateConfig(jsonConfig): boolean {
    this.jsonConfig = jsonConfig;
    for (const key in this.configMap) {
      if (this.configMap.hasOwnProperty(key)) {
        const expectedType = this.configMap[key].type;
        const actualValue = this.jsonConfig[key];

        if (typeof actualValue !== expectedType) {
          console.error(
            `Validation failed for key: ${key}. Expected type: ${expectedType}, Actual value: ${JSON.stringify(
              actualValue
            )} of type ${typeof actualValue}`
          );
          return false;
        }
      }
    }
    return true;
  }
  public async generateAzureKeyvaultEnviormentVariables() {
    const envData: string[] = [];
    const { azure, currentEnvPath, newEnvPath, createBackup, merge } =
      this.jsonConfig;
    if (createBackup) {
      this.createBackup(currentEnvPath);
    }
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(azure.keyVaultUrl, credential);
    for await (const secretProperties of client.listPropertiesOfSecrets()) {
      const secretName = secretProperties.name;
      const secret = await client.getSecret(secretName);
      const secretValue = secret.value;
      envData.push(`${secretName}=${secretValue}`);
    }
    if (merge) {
      const current = this.parseEnvFile(currentEnvPath);
      const incoming = envData.map((data) => {
        const [key, value] = data.split("=");
        if (key && value) {
          const envObject: EnvObject = { [key]: value };
          return envObject;
        }
      });
      const newMergedEnv = this.mergeEnvArrays(current, incoming).map(
        (value) => {
          return `${Object.keys(value)[0]}=${Object.values(value)[0]}`;
        }
      );
      fs.writeFileSync(newEnvPath, newMergedEnv.join("\n"));
      console.log(`Secrets exported to ${newEnvPath} file.`);
      return;
    }
    fs.writeFileSync(newEnvPath, envData.join("\n"));
    console.log(`Secrets exported to ${newEnvPath} file.`);
  }
  public async generateAwsSecretsManagerEnviormentVariables() {
    const envData: string[] = [];
    const { aws, currentEnvPath, newEnvPath, createBackup, merge } =
      this.jsonConfig;
    if (createBackup) {
      this.createBackup(currentEnvPath);
    }

    const client = new SecretsManagerClient({ region: aws.region });
    const input: ListSecretsCommandInput = {
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
    const command = new ListSecretsCommand(input);

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
          const envObject: EnvObject = { [key]: value };
          return envObject;
        }
      });
      const newMergedEnv = this.mergeEnvArrays(current, incoming).map(
        (value) => {
          return `${Object.keys(value)[0]}=${Object.values(value)[0]}`;
        }
      );
      fs.writeFileSync(newEnvPath, newMergedEnv.join("\n"));
      console.log(`Secrets exported to ${newEnvPath} file.`);
      return;
    }
    fs.writeFileSync(newEnvPath, envData.join("\n"));
    console.log(`Secrets exported to ${newEnvPath} file.`);
  }
  private createBackup(currentEnvPath: string) {
    if (!fs.existsSync(currentEnvPath)) {
      console.error(`File does not exist: ${currentEnvPath}`);
      return;
    }

    // Generate the backup file path by adding a '.backup' extension
    const backupFilePath = `${currentEnvPath}.${new Date().getTime()}.backup`;

    // Use fs.createReadStream and fs.createWriteStream to copy the file
    const readStream = fs.createReadStream(currentEnvPath);
    const writeStream = fs.createWriteStream(backupFilePath);

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
  private parseEnvFile(filePath: string): EnvObject[] {
    const envArray: EnvObject[] = [];

    try {
      const envFileContents = fs.readFileSync(filePath, "utf-8");
      const lines = envFileContents.split("\n");

      for (const line of lines) {
        const [key, value] = line.split("=");
        if (key && value) {
          const envObject: EnvObject = { [key]: value };
          envArray.push(envObject);
        }
      }
    } catch (error) {
      console.error(`Error reading or parsing the .env file: ${error}`);
    }

    return envArray;
  }
  private mergeEnvArrays(arr1: EnvObject[], arr2: EnvObject[]): EnvObject[] {
    // Create a map to hold the merged values
    const mergedMap: EnvObject = {};

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
    const mergedArray: EnvObject[] = [];
    for (const key in mergedMap) {
      if (mergedMap.hasOwnProperty(key)) {
        const envObject: EnvObject = { [key]: mergedMap[key] };
        mergedArray.push(envObject);
      }
    }

    return mergedArray;
  }
  public createConfigFile = () => {
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
    fs.appendFile("./cloudkeys-config.json", JSON.stringify(file), (err) => {
      if (err) throw err;
      console.log("Saved!");
    });
  };
}
