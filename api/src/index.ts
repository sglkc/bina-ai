import 'dotenv/config'
import express, { Request } from 'express'
import minifyHtml from './minifier'
import prompt, { PromptBody, PromptResponse } from './prompt'

const PORT = process.env.PORT ?? 5000
const app = express()

app.use(express.text())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/prompt', async (
  req: Request<{}, PromptResponse | { message: string }, PromptBody>,
  res
) => {
  const { body } = req

  if (!('type' in body && 'page' in body && 'question' in body)) {
    res.status(400).json({
      message: 'json must have (type, page) or (question) or both'
    })
    return
  }

  const response = await prompt(req.body)

  res.json(response)
})

app.post('/minifier', async (
  req: Request<{}, string, string, { iter?: number }>,
  res
) => {
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
})

app.listen(PORT, () => {
  console.log('Listening on port', PORT)
})
