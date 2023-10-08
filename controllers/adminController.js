const Admin = require('../models/adminModel')
const Course = require('../models/courseModel')
const jwt = require('jsonwebtoken')


exports.signUpAdmin =  async (req, res) => {
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

    // Generate JWT token
    const token = jwt.sign({ email, role: 'admin' }, process.env.JWTSECRET, {
      expiresIn: '1h',
    })

    res.json({ message: 'Admin created successfully', token })
  } catch (err) {
    console.error('Sign Up Error: ' + err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.logInAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    // TODO - make a password checker function here
    // Check if admin exists and password is correct
    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(404).json({ message: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = jwt.sign({ email, role: 'admin' }, process.env.JWTSECRET, {
      expiresIn: '1h',
    })

    res.json({ message: 'Logged in successfully', token })
  } catch (err) {
    console.error('Login Error: ' + err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

exports.createCourse =  async (req, res) => {
  try {
    const newCourse = new Course(req.body)
    await newCourse.save()
    res.status(201).json({ message: 'Course Created Successfully', newCourse })
  } catch (err) {
    console.error('Create Course Error: ' + err)
    res.status(500).json({ message: 'Failed to create course' })
  }
}

exports.updateCourse =  async (req, res) => {
  try {
    const courseId = req.params.id
    const updatedCourse = req.body
    const course = await Course.findByIdAndUpdate(courseId, updatedCourse, {
      new: true,
    })
    if (course) {
      res.json({ message: 'Course Updated Successfully', course })
    } else {
      res.status(404).json({ message: 'Course not found' })
    }
  } catch (err) {
    console.error('Update Course Error: ' + err)
    res.status(500).json({ message: 'Failed to update course' })
  }
}

exports.getCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find({})
    if (!courses || courses.length === 0) {
      res.send(404).json({ message: 'No courses to show' })
    }
    res.json(courses)
  } catch (err) {
    console.error('Get Course Error: ' + err)
    res.status(500).json({ message: 'Failed to get courses' })
  }
}


