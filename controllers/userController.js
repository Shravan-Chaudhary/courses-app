const User = require('../models/userModel')
const Course = require('../models/courseModel')
const jwt = require('jsonwebtoken')

exports.signUpUser = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (user) {
    res.status(403).json({ message: 'user already exists' })
  }
  const newUser = await new User({ email, password })
  await newUser.save()
  const token = jwt.sign({ email, role: 'user' }, process.env.JWTSECRET)
  res.json({ message: 'User created Successfully', token })
}

exports.logInUser = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    res.status(403).json({ message: 'User not found' })
  }
  const token = jwt.sign({ email, role: 'user' }, process.env.JWTSECRET)
  res.json({ message: 'Logged In successfully', token })
}

exports.getCoursesUser = async (req, res) => {
  const courses = await Course.find({ published: true })
  res.json(courses)
}

exports.purchaseCourse = async (req, res) => {
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
}

exports.purchasedCourses = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).populate('purchasedCourses')
  if (user) {
    const purchasedCourses = await user.purchasedCourses
    res.json({ purchasedCourses: purchasedCourses || [] })
  } else {
    res.status(404).json({ message: 'User Not found' })
  }
}