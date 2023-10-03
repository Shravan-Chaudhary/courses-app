const express = require('express')
const app = express()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
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
app.post('/api/admin/signup', async (req, res) => {
  const {email, password} = req.body
  const admin = await Admin.findOne({email})
  if(admin){
    res.status(403).json({ 'message': 'Admin already exists by this email' })
  }
  const obj = {email,password}
  const newAdmin = new Admin(obj)
  await newAdmin.save()
  const token = jwt.sign({email, role:'admin'}, process.env.JWTSECRET, {expiresIn: '1h'})

  res.json({message: 'Admin created successfully', token})
})



app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})