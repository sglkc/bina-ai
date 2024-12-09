import express from 'express'
import 'dotenv/config'

const PORT = process.env.PORT ?? 5000
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({ hello: 'world' })
})

app.listen(PORT, () => {
  console.log('Listening on port', PORT)
})
