const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

// Middlewares
app.use(cors())
app.use(bodyParser.json())


// Routes
app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})