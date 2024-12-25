import { Mistral } from '@mistralai/mistralai'
import { UsageInfo } from '@mistralai/mistralai/models/components'

export interface PromptBody {
  type?: 'html' | 'markdown'
  page?: string
  question?: string
}

export interface PromptResponse {
  intent: string
  answer: string
  target?: string
  usage: UsageInfo
}

const apiKey = process.env.MISTRAL_API_KEY
const agentId = process.env.MISTRAL_AGENT_ID!
const client = new Mistral({ apiKey })

export default async function prompt({ type, page, question }: PromptBody): Promise<PromptResponse> {
  const start = Date.now()

  console.info('generating message')

  const markdown = '```' + type + '\n'
    + page + '\n'
    + '```' + '\n'

  const content = (page ? markdown : '') + (question ? 'Question: ' + question.trim() : '')

  console.log(content)

  const response = await client.agents.complete({
    agentId,
    messages: [
      { role: 'user', content }
    ],
    responseFormat: {
      type: 'json_object'
    }
  })

  console.info('generated message in', Date.now() - start)
  console.info('token usage', response.usage)

  const { intent, answer, target } = JSON.parse(response.choices![0].message.content as string)

  return {
    intent,
    answer,
    target,
    usage: response.usage
  }
}
