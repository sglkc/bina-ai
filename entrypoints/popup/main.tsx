import { render } from 'preact'
import Popup from './Popup.tsx'
import '@fontsource/open-sauce-one/400.css'
import '@fontsource/open-sauce-one/700.css'
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

render(<Popup />, document.getElementById('root')!)
