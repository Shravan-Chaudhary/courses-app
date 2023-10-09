const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const adminRoutes = require('./routes/adminRoutes')
const userRoutes = require('./routes/userRoutes')

require('dotenv').config()
// Middlewares
app.use(cors())
app.use(bodyParser.json())
app.use(express.urlencoded({extended: false}))

// Db  Connect
const connectDb = async () => {
  try {
    const res = await mongoose.connect(process.env.MONGOURL)
    if (res) {
      console.log('Db connected')
    }
  } catch (error) {
    console.error(error)
  }
}
connectDb()

// Admin Routes
app.use('/api/admin/', adminRoutes)

// User Routes
app.use('/api/users/', userRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})
