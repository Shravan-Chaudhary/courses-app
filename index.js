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

// Models
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
})
const User = mongoose.model('User', userSchema)

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
})
const Admin = mongoose.model('Admin', adminSchema)

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean,
})
const Course = mongoose.model('Course', courseSchema)

// Authentication
const jwtAuthentication = async (req, res, next) => {
  try {
    const token = req.headers.token
    if (!token) {
      return res.status(401).json({ message: 'Invalid Token' })
    }
    const decoded = await jwt.verify(token, process.env.JWTSECRET)
    const admin = await Admin.findOne({ email: decoded.email })
    if (!admin) {
      return res.status(403).json({ message: 'Invalid Email or Password' })
    }
    req.user = admin
    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

const userJwtAuthentication = async (req, res, next) => {
  const token = req.headers.token
  const decoded = await jwt.verify(token, process.env.JWTSECRET)
  const user = await User.findOne({ email: decoded.email })
  if (user) {
    req.user = user
    next()
  } else {
    res.status(403).json({ message: 'invalid email or password' })
  }
}

// Admin Routes
//Singup
app.post('/api/admin/signup', async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email })
    if (adminExists) {
      res.status(403).json({ message: 'Admin already exists by this email' })
    }

    // Create a new admin instance
    const newAdmin = new Admin({ email, password })

    // Save the new admin
    await newAdmin.save()

    // Generate JWT token and save it in local storage
    const token = jwt.sign({ email, role: 'admin' }, process.env.JWTSECRET, {
      expiresIn: '1h',
    })
    localStorage.setItem('token', token)

    res.json({ message: 'Admin created successfully', token })
  } catch (err) {
    console.error('Sign Up Error: ' + err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})
//Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // TODO - make a password checker function here
    // Check if admin exists and password is correct
    const admin = await Admin.findOne({ email })
    if (!admin) {
      res.status(404).json({ message: 'Invalid email or password' })
    }

    // Generate JWT token and save it in local storage
    const token = jwt.sign({ email, role: 'admin' }, process.env.JWTSECRET, {
      expiresIn: '1h',
    })
    localStorage.setItem('token', token)

    res.json({ message: 'Logged in successfully', token })
  } catch (err) {
    console.error('Login Error: ' + err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

//CreateCourse(Auth Route)
app.post('/api/admin/courses', jwtAuthentication, async (req, res) => {
  console.log(req.user)
  const newCourse = new Course(req.body)
  await newCourse.save()
  res.json({ message: 'Course Created Successfully', courseId: newCourse._id })
})

//Update Course(Auth Route)
app.put('/api/admin/courses/:id', async (req, res) => {
  const courseId = req.query.params
  const course = await Course.findOneAndUpdate(courseId, req.body, {
    new: true,
  })
  if (course) {
    res.json({ message: 'Course Updated Successfully', course })
  } else {
    res.status(404).json({ message: 'Course not found' })
  }
})

//Get all courses(Auth Route)
app.get('/api/admin/courses', async (req, res) => {
  const courses = await Course.find({})
  if (!courses) {
    res.send(404).json({ message: 'No courses to show' })
  }
  res.json({ courses })
})

// User Routes
// Sign up
app.post('/api/users/signup', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (user) {
    res.status(403).json({ message: 'user already exists' })
  }
  const newUser = await new User({ email, password })
  await newUser.save()
  const token = jwt.sign({ email, role: 'user' }, process.env.JWTSECRET)
  res.json({ message: 'User created Successfully', token })
})

// Login
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    res.status(403).json({ message: 'User not found' })
  }
  const token = jwt.sign({ email, role: 'user' }, process.env.JWTSECRET)
  res.json({ message: 'Logged In successfully', token })
})

// Get courses
app.get('/api/users/courses', async (req, res) => {
  const courses = await Course.find({ published: true })
  res.json(courses)
})

// purchase a Course
app.post('/api/users/courses/:courseId', userJwtAuthentication, async (req, res) => {
  const courseId = req.params.courseId
  const course = await Course.findOne({ _id: courseId })
  if (course) {
    const user = await User.findOne({ email: req.user.email })
    if (user) {
      user.purchasedCourses.push(course)
      await user.save()
      res.json({ message: 'Course purchased successfully' })
    } else {
      res.status(403).json({ message: 'User not found' })
    }
  } else {
    res.status(404).json({ message: 'Course not found' })
  }
})

app.get('/api/users/courses/purchasedCourses', userJwtAuthentication, async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).populate('purchasedCourses')
  if (user) {
    const purchasedCourses = await user.purchasedCourses
    res.json({ purchasedCourses: purchasedCourses || [] })
  } else {
    res.status(404).json({ message: 'User Not found' })
  }
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})
