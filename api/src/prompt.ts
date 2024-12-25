import { Mistral } from '@mistralai/mistralai'
import { UsageInfo } from '@mistralai/mistralai/models/components'

export interface PromptBody {
  type: 'html' | 'markdown'
  page: string
  question: string
}

export interface PromptResponse {
  answer: string
  target: string
  usage: UsageInfo
}

const apiKey = process.env.MISTRAL_API_KEY
const client = new Mistral({ apiKey })

export default async function prompt({
  type,
  page,
  question,
}: PromptBody): Promise<PromptResponse> {
  const start = Date.now()

  console.info('generating message')

  const content =
`You are an AI who browse the web, you
\`\`\`${type}
${page}
\`\`\`

Output your answer in a JSON format of with the following schema:

\`\`\`
{
  "answer": "Your answer towards the question",
  "target": "Target url, set null if none"
}
\`\`\`

${question}
`
  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      { role: 'user', content }
    ],
    responseFormat: {
      type: 'json_object'
    }
  })

  console.info('generated message in', Date.now() - start)
  console.info('token usage', response.usage)

  const { answer, target } = JSON.parse(response.choices![0].message.content as string)

  return {
    answer,
    target,
    usage: response.usage
  }
}
