export interface Action {
  intent: string
  action: string
  target: string
}

export default function executeAction({ intent, action, target }: Action): boolean {
  switch (action) {
    case 'GOTO':
      location.assign(target)
      break
    case 'IMAGE':
    case 'ANSWER':
    case 'STOP':
      break
    default:
      return false
  }

  return true
}
