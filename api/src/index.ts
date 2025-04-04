import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import express from 'express'
import minifyHtml from './minifier.js'
import prompt, { parsePrompt } from './prompt.js'
import { MinifierEndpointRequest, PromptEndpointRequest } from './types.js'
import { getMessages } from './message.js'

const PORT = process.env.PORT ?? 5000
const app = express()

app.use(express.text())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/prompt', async (req: PromptEndpointRequest, res) => {
  if (!req.is('application/json')) {
    res.status(400).json({ message: 'content type must be json' })
    return
  }

  const body = req.body

  if (!body.url && !body.prompt) {
    res.status(400).json({ message: 'json must have url or prompt' })
    return
  }

  const session = body.session ?? randomUUID()
  const messages = getMessages(session)
  const content = parsePrompt(body)
  const response = await prompt(content, messages)

  res.json(response)
  return
})

app.post('/minifier', async (req: MinifierEndpointRequest, res) => {
  const iter = Number(req.query.iter ?? 2)

  if (!req.is('text/*')) {
    res.status(400).send('content type must be plain text')
    return
  }

  let html = req.body

  for (let i = 0; i < iter; i++) {
    html = await minifyHtml(html)
  }

  res.send(html)
  return
})

app.listen(PORT, () => {
  console.log('Listening on port', PORT)
})
