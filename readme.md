# CloudKeys Documentation

CloudKeys is a powerful npm package that allows you to generate and manage secure cloud access keys. This documentation will guide you through the installation process and show you how to create a script for generating cloud access keys.

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
AZ Login
```

2. Create a configuration file in the root of your project with the name `cloudkeys-config.json`

```json
{
  "keyVaultUrl": "https://KEYVAULTNAME.vault.azure.net/"
}
```
