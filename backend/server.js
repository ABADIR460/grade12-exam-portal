
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Home
app.get("/", (req, res) => {
  res.json({
    message: "Grade 12 Exam Portal Backend is running"
  });
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    database: process.env.SUPABASE_URL ? "configured" : "missing"
  });
});

// Student Registration
app.post("/api/register", async (req, res) => {
  try {
    const {
      student_id,
      full_name,
      email,
      phone,
      password
    } = req.body;

    if (!student_id || !full_name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data, error } = await db
      .from("students")
      .insert([{
        student_id,
        full_name,
        email,
        phone,
        password_hash
      }])
      .select("id, student_id, full_name, email")
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Registration successful",
      student: data
    });

  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(400).json({
      message: "Registration failed. Check Student ID or Email."
    });
  }
});

// Student Login
app.post("/api/login", async (req, res) => {
  try {
    const { student_id, password } = req.body;

    if (!student_id || !password) {
      return res.status(400).json({
        message: "Student ID and password are required"
      });
    }

    const { data: student, error } = await db
      .from("students")
      .select("*")
      .eq("student_id", student_id)
      .single();

    if (error || !student) {
      return res.status(401).json({
        message: "Invalid Student ID or Password"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      student.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid Student ID or Password"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign(
      { id: student.id, student_id: student.student_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      student: {
        id: student.id,
        student_id: student.student_id,
        full_name: student.full_name,
        email: student.email
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Login failed"
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log("Grade 12 Exam Portal running on port " + PORT);
});
