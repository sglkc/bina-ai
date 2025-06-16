import { Mistral } from '@mistralai/mistralai'
import { Messages } from '@mistralai/mistralai/models/components'
import { PromptContent, PromptRequest, PromptResponse } from '../../utils/types'

let tokens = 0
const agentId = 'ag:f54ec292:20250410:bina-ai:ca935324'

// Dynamic client creation based on stored API key
let client: Mistral | null = null

async function getClient(): Promise<Mistral> {
  if (client) return client

  // Get API key from chrome.storage.local
  const result = await chrome.storage.local.get(['mistral_api_key'])
  const apiKey = result.mistral_api_key

  if (!apiKey) {
    throw new Error('Mistral API key not found. Please configure your API key in the extension options.')
  }

  client = new Mistral({ apiKey })
  return client
}

// Reset client when API key changes (useful for testing or key updates)
export function resetClient() {
  client = null
}

export function parsePrompt({ page, url, prompt, image }: Partial<PromptRequest>): PromptContent {
  console.log('>> generating content', page?.length, '/', url?.substring(0, 20), ':', prompt)
  const text = (page ?
    '```markdown\n'
      + page + '\n'
      + '```' + '\n'
    : '')
    + (url ? `URL: ${url}\n` : '')
    + (prompt ? `\nPrompt: ${prompt}` : '')

  if (!image) return text;

  // https://docs.mistral.ai/capabilities/vision/
  return [
    { type: 'text', text },
    { type: 'image_url', imageUrl: image }
  ]
}

export default async function prompt(content: PromptContent, messages: Messages[] = []): Promise<PromptResponse> {
  const start = Date.now()

  console.info('> generating message')

  messages.push({ role: 'user', content })

  const client = await getClient()
  const response = await client.agents.complete({
    agentId,
    messages,
    responseFormat: {
      type: 'json_object'
    }
  })

  const raw = response.choices![0].message.content as string
  console.log(raw)
  const { intent, action, target } = JSON.parse(raw)

  messages.push({ role: 'assistant', ...response.choices![0].message })
  tokens += response.usage.totalTokens

  console.info('> generated message in:', Date.now() - start, 'ms')
  console.info('> messages length:', messages.length)
  console.info('> token usage:', tokens)

  return {
    intent,
    action,
    target,
    usage: response.usage
  }
}
