import { randomUUID } from 'node:crypto'
import { Mistral } from '@mistralai/mistralai'
import { Messages, UsageInfo } from '@mistralai/mistralai/models/components'

const STORAGE: Record<string, Messages[]> = {}

export interface PromptBody {
  url?: string
  page?: string
  prompt?: string
  session?: string
}

export interface PromptResponse {
  session?: string
  intent: string
  action: string
  target?: string
  usage: UsageInfo
}

let tokens = 0
const apiKey = process.env.MISTRAL_API_KEY
const agentId = process.env.MISTRAL_AGENT_ID!
const client = new Mistral({ apiKey })

export default async function prompt(
  { url, page, prompt, session = randomUUID() }: PromptBody
): Promise<PromptResponse> {
  const start = Date.now()
  const messages = STORAGE[session] ?? []

  console.info('> generating message')

  const content = (page ?
    '```markdown\n'
      + page + '\n'
      + '```' + '\n'
    : '')
    + (url ? `URL: ${url}\n` : '')
    + (prompt ? `\nPrompt: ${prompt}` : '')

  console.log(content)

  messages.push({ role: 'user', content })

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
  STORAGE[session] = messages

  console.info('> generated message in:', Date.now() - start, 'ms')
  console.info('> messages length:', messages.length)
  console.info('> token usage:', tokens)

  return {
    session,
    intent,
    action,
    target,
    usage: response.usage
  }
}
