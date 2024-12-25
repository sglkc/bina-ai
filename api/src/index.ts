import 'dotenv/config'
import express, { Request } from 'express'
import minifyHtml from './minifier'

const PORT = process.env.PORT ?? 5000
const app = express()

app.use(express.text())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/minifier', async (req: Request<{}, string, string, { iter?: number }>, res) => {
  const iter = Number(req.query.iter ?? 2)

  if (!req.is('text/*')) {
    res.send('content type must be plain text')
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
