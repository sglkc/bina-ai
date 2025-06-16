import { useRef, useState } from 'preact/hooks'

interface APIKeyProps {
  onApiKeySet: () => void
}

export default function APIKey({ onApiKeySet }: APIKeyProps) {
  const [apiKey, setApiKey] = useState<string>('')
  const [message, setMessage] = useState<string>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      setMessage(__('api_key.error_empty'))
      return
    }

    setIsLoading(true)

    try {
      // Store in chrome.storage.local
      await chrome.storage.local.set({ mistral_api_key: apiKey.trim() })
      setMessage(__('api_key.success_save'))

      // Wait a moment to show success message, then navigate to mic permission
      setTimeout(() => {
        onApiKeySet()
      }, 1500)
    } catch (error) {
      setMessage(__('api_key.error_save'))
      setIsLoading(false)
    }
  }

  return (
    <div class="px-8 py-16 w-screen h-100svh flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} class="flex flex-col items-center gap-8 max-w-md w-full">
        <h1 class="text-4xl text-center fw-bold leading-16 mb-8">
          {__('api_key.title')}
        </h1>

        <input
          ref={inputRef}
          type="password"
          value={apiKey}
          onInput={(e) => setApiKey((e.target as HTMLInputElement).value)}
          placeholder={__('api_key.placeholder')}
          class="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          disabled={Boolean(message) || isLoading}
        />

        <button
          type="submit"
          class="w-full px-8 py-4 text-xl fw-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={Boolean(message) || isLoading}
        >
          {isLoading ? __('api_key.button_saving') : __('api_key.button_save')}
        </button>

        {message && (
          <div class={`text-center text-lg fw-bold ${message.includes(__('api_key.success_save')) ? 'text-green-600' : 'text-red-600'}`}>
            {message}
            {message.includes(__('api_key.success_save')) && (
              <div class="text-sm text-gray-600 mt-2">
                {__('api_key.redirecting')}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
