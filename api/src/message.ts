import { Messages } from '@mistralai/mistralai/models/components'

const Sessions = new Map<string, Messages[]>()

export function getMessages(session: string): Messages[] {
  if (Sessions.has(session)) {
    return Sessions.get(session)!
  }

  const messages: Messages[] = []

  Sessions.set(session, messages)

  return messages
}
