import ky from 'ky'
import {
  Action,
  ActionType,
  PromptEndpointResponse,
  PromptRequest,
  PromptResponse,
} from '@api/types'

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

const api = ky.create({
  prefixUrl: 'http://localhost:5000',
  method: 'post',
  timeout: 30_000,
  signal: controller.signal,
})

export async function getAction(body: Partial<PromptRequest>): Promise<PromptResponse> {
  try {
    const res = await api<PromptEndpointResponse>('prompt', { json: body }).json()

    if ('message' in res) throw new Error(res.message)

    return res
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
