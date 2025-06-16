import {
  Action,
  ActionType,
  PromptRequest,
  PromptResponse,
} from '../../utils/types'
import prompt, { parsePrompt } from './prompt'

export type ActionRunner = (action: Partial<Action>) => boolean

const Runners: Record<ActionType, ActionRunner> = {
  'GOTO': (action) => {
    window.location.assign(action.target!)
    return true
  },
  'BACK': () => {
    window.history.back()
    return true
  },
  'IMAGE': () => {
    return false
  },
  'ANSWER': (action) => {
    console.warn('IM ANSWERING', action)
    return false
  },
  'STOP': (action) => {
    console.warn('STOPPED', action)
    return false
  },
}

export const controller = new AbortController()

export async function getAction(body: Partial<PromptRequest>): Promise<PromptResponse> {
  try {
    // Parse the prompt and send it to Mistral
    const content = parsePrompt(body)
    const messages: any[] = [] // We could persist these for conversation history

    // Use local prompt function instead of API call
    return await prompt(content, messages)
  } catch (error) {
    let message = 'Unknown error'

    console.error(error)
    if (error instanceof Error) message = error.name

    return { action: 'STOP', intent: 'API error occured', target: message }
  }
}

export function getActionRunner(action: Action): ActionRunner {
  const type = action.action

  if (!(type in Runners)) return () => {
    console.error('Runner not found for:', type)
    return false
  }

  return Runners[type]
}
