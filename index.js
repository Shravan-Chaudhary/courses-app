const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Mongoose } = require("mongoose");
require("dotenv").config();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Db  Connect
const connectDb = async () => {
  try {
    const res = await mongoose.connect(process.env.MONGOURL);
    if (res) {
      console.log("Db connected");
    }
  } catch (error) {
    console.error(error);
  }
};
connectDb();

// Models
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const Admin = mongoose.model("Admin", adminSchema);

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean,
});
const Course = mongoose.model("Course", courseSchema);

// Authentication
const jwtAuthentication = async (req, res, next) => {
  const token = req.headers.token;
  const decoded = await jwt.verify(token, process.env.JWTSECRET);
  const admin = await Admin.findOne({ email: decoded.email });
  if (admin) {
    req.user = admin;
    next();
  } else {
    res.status(403).json({ message: "invalid email or password" });
  }
};

// Admin Routes
//Singup
app.post("/api/admin/signup", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (admin) {
    res.status(403).json({ message: "Admin already exists by this email" });
  }
  const obj = { email, password };
  const newAdmin = new Admin(obj);
  await newAdmin.save();
  const token = jwt.sign({ email, role: "admin" }, process.env.JWTSECRET, {
    expiresIn: "1h",
  });

  res.json({ message: "Admin created successfully", token });
});
//Login
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.headers;
  const admin = await Admin.findOne({ email });
  if (!admin) {
    res.status(404).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ email, role: "admin" }, process.env.JWTSECRET, {
    expiresIn: "1h",
  });
  res.json({ message: "Logged in successfully", token });
});

//CreateCourse
app.post("/api/admin/courses", jwtAuthentication, async (req, res) => {
  console.log(req.user);
  const newCourse = new Course(req.body);
  await newCourse.save();
  res.json({ message: "Course Created Successfully", courseId: newCourse._id });
});

//Update Course
app.put("/api/admin/courses/:id", async (req, res) => {
  const courseId = req.query.params;
  const course = await Course.findOneAndUpdate(courseId, req.body, {
    new: true,
  });
  if (course) {
    res.json({ message: "Course Updated Successfully", course });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

//Get all courses
app.get("/api/admin/courses", async (req, res) => {
  const courses = await Course.find({});
  if (!courses) {
    res.send(404).json({ message: "No courses to show" });
  }
  res.json({ courses });
});

// User Routes
// Sign up
app.post("/api/users/signup", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    res.status(403).json({ message: "user already exists" });
  }
  const newUser = await new User({ email, password });
  await newUser.save();
  const token = jwt.sign({ email, role: "user" }, process.env.JWTSECRET);
  res.json({ message: "User created Successfully", token });
});

// Login
app.post('/api/users/login', async (req, res) => {
  const {email, password} = req.body
  const user = await User.findOne({email})
  if(!user){
    res.status(403).json({message: 'User not found'})
  }
  const token = jwt.sign({email, role: 'user'}, process.env.JWTSECRET)
  res.json({message: "Logged In successfully", token})
})

// Get courses
app.get('/api/users/courses', async (req, res) => {
  const courses = await Course.find({published:true})
  res.json(courses)
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
