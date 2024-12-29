import { Mistral } from '@mistralai/mistralai'
import { AgentsCompletionRequest, UsageInfo } from '@mistralai/mistralai/models/components'

export interface PromptBody {
  type?: 'html' | 'markdown'
  page?: string
  question?: string
}

export interface PromptResponse {
  intent: string
  action: string
  target?: string
  usage: UsageInfo
}

let tokens = 0
const messages: AgentsCompletionRequest['messages'] = []
const apiKey = process.env.MISTRAL_API_KEY
const agentId = process.env.MISTRAL_AGENT_ID!
const client = new Mistral({ apiKey })

export default async function prompt({ type, page, question }: PromptBody): Promise<PromptResponse> {
  const start = Date.now()

  console.info('> generating message')

  const markdown = '```' + type + '\n'
    + page + '\n'
    + '```' + '\n'

  const content = (page ? markdown : '') + (question ? '\nQuestion: ' + question.trim() : '')

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
  const { intent, action, target } = JSON.parse(raw)

  console.log(raw)
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
