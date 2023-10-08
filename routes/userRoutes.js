const jwt = require('jsonwebtoken')
const express = require('express')
const { signUpUser, getCoursesUser, logInUser, purchaseCourse, purchasedCourses } = require('../controllers/userController')
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


router.post('/signup', signUpUser)
router.post('/login', logInUser)
router.get('/courses', getCoursesUser)
router.post('/courses/:courseId', userJwtAuthentication, purchaseCourse)
router.get('/courses/purchasedCourses', userJwtAuthentication, purchasedCourses)


module.exports = router