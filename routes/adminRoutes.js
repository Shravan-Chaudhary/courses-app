const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Admin = require('../models/adminModel')
const { signUpAdmin, logInAdmin, createCourse, updateCourse, getCourses } = require('../controllers/adminController')

// Authentication
const jwtAuthentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: 'No token' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = await jwt.verify(token, process.env.JWTSECRET)
    const admin = await Admin.findOne({ email: decoded.email })
    if (!admin) {
      return res.status(403).json({ message: 'Invalid Email or Password' })
    }
    req.admin = admin
    next()
  } catch (err) {
    console.error( 'admin auth: ' + err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}


router.post('/signup', signUpAdmin)
router.post('/login', logInAdmin)
router.post('/courses', jwtAuthentication, createCourse)
router.put('/courses/:id', jwtAuthentication, updateCourse)
router.get('/courses', jwtAuthentication, getCourses)

module.exports = router