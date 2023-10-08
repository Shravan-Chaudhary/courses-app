const User = require('../models/userModel')
const Course = require('../models/courseModel')
const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()

const userJwtAuthentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: 'No token' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = await jwt.verify(token, process.env.JWTSECRET)
    const user = await User.findOne({ email: decoded.email })
    if (!user) {
      return res.status(403).json({ message: 'Invalid Email or Password' })
    }
    req.user = user
    next()
  } catch (err) {
    console.error('user auth:' + err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Sign up
router.post('/signup', async (req, res) => {
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
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    res.status(403).json({ message: 'User not found' })
  }
  const token = jwt.sign({ email, role: 'user' }, process.env.JWTSECRET)
  res.json({ message: 'Logged In successfully', token })
})

// Get courses
router.get('/courses', async (req, res) => {
  const courses = await Course.find({ published: true })
  res.json(courses)
})

// purchase a Course
router.post('/courses/:courseId', userJwtAuthentication, async (req, res) => {
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

router.get('/courses/purchasedCourses', userJwtAuthentication, async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).populate('purchasedCourses')
  if (user) {
    const purchasedCourses = await user.purchasedCourses
    res.json({ purchasedCourses: purchasedCourses || [] })
  } else {
    res.status(404).json({ message: 'User Not found' })
  }
})

module.exports = router