import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.json({
    message: 'Le serveur est lancé',
    url: `http://localhost:${PORT}`
  })
})

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`)
})