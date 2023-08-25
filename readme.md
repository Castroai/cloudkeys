# CloudKeys Documentation

CloudKeys is a powerful npm package that allows you to generate and manage secure cloud access keys. This documentation will guide you through the installation process and show you how to create a script for generating cloud access keys.

## Supported Clouds

- Azure (YES)
- GCP (COMING SOON)
- AWS (COMING SOON)

## Installation

To use CloudKeys in your project, you'll need to install it as a dependency. You can do this using npm or yarn. Open your terminal or command prompt and run the following command:

```bash
npm install cloudkeys
```

or

```bash
yarn add cloudkeys
```

This will download and install the CloudKeys package in your project.

## Generating Cloud Access Keys

Once you have CloudKeys installed, you can create a script in your project that will use CloudKeys to generate cloud access keys. Follow these steps to create the script:

1. Install the Azure CLI

```
brew update && brew install azure-cli
```

2. Run

```bash
az Login
```

## Configuration File

| Key            | Value                               | Type    | description                                                                                                          |
| -------------- | ----------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| keyVaultUrl    | `https://KEYVAULT.vault.azure.net/` | string  | The URL for the azure keyvault url                                                                                   |
| currentEnvPath | `./.env `                           | string  | The path to where your .env file is located                                                                          |
| newEnvPath     | `./.env `                           | string  | The path where you would like your new env file created. If the same as `currentEnvPath` your file will be replaced. |
| createBackup   | `true`                              | boolean | Recommended it will create a backup of your `currentEnvPath` file                                                    |
| merge          | `true`                              | boolean | if `true` it will merge the keys from the cloud and the current keys.                                                |

3. Create a configuration file in the root of your project with the name `cloudkeys-config.json`

```json
{
  "keyVaultUrl": "https://KEYVAULT.vault.azure.net/",
  "currentEnvPath": "./.env",
  "newEnvPath": "./env",
  "createBackup": true,
  "merge": true
}
```

4. Update your package json

```json

"scripts":{
   "generate": "cloudkeys -g"
}

```

The command `-g` will generate the your .env file with your keys and secrets from your azure keyvault.
