const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Mongoose } = require('mongoose')
require('dotenv').config()

// Middlewares
app.use(cors())
app.use(bodyParser.json())

// Db  Connect
const connectDb = async()=> {
  try {
   const res =  await mongoose.connect(process.env.MONGOURL);
   if(res){
     console.log('Db connected')
   }
  } catch (error) {
    console.error(error);
  }
}
connectDb()

// Models
const adminSchema = new mongoose.Schema({
  email: String,
  password: String
})
const Admin = mongoose.model('Admin', adminSchema)


// Routes
app.post('/api/admin/signup', (req, res) => {
  const body = req.body
  console.log(body)
  res.send(body)
})



app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})