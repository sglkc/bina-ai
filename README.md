# BINA AI: Blind-friendly Intelligent Navigation Assistant

A browser extension-based assistive technology that helps blind users navigate the web through speech recognition, text-to-speech, and smart AI guidance.

## Requirements

1. [Node.js](https://nodejs.org/en/download)
2. [Mistral account](https://console.mistral.ai/)
3. [pnpm (optional)](https://pnpm.io/installation#using-npm)

## Mistral Setup

You must have a Mistral account to use this project. Thanks to Mistral team for giving generous free

### Agent

1. Log in or create a new Mistral account
2. Navigate to [La Plateforme - Agents](https://console.mistral.ai/build/agents)
3. Create a new agent
4. Copy the prompt inside `./api/prompt.md` and paste to instructions (system prompt)
5. You can give it a name and freely change the [model](https://docs.mistral.ai/getting-started/models/models_overview/#free-models) and randomness (temperature)
6. Click Deploy once you're done
7. Click on Agent ID to copy your agent ID

### API Key

1. Navigate to [La Plateforme - API Keys](https://console.mistral.ai/api-keys)
2. Create new key
3. Give it a name
4. Copy key and keep it safe!

## Project Setup

1. Clone the repository

   ```sh
   git clone https://github.com/sglkc/bina-ai.git
   cd bina-ai
   ```

2. Install dependencies

   ```sh
   pnpm install
   ```

3. Setup environment variables, add Mistral API key and agent ID

   ```sh
   cp ./api/.env.example ./api/.env
   ```

4. Run api and extension in development mode

   ```sh
   pnpm -r dev
   ```

## LICENSE

This project is licensed under the AGPL-3.0 License. See the [LICENSE](LICENSE) file for details.
