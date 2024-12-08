import { render } from 'preact'
import App from './App.tsx'
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

render(<App />, document.getElementById('root')!)
