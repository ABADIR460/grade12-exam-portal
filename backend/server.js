
require("dotenv").config();
const crypto = require("crypto");
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

// Get questions for a published exam
app.get("/api/exams/:id/questions", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: exam, error: examError } = await db
      .from("exams")
      .select("id, title, duration_minutes")
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (examError || !exam) {
      return res.status(404).json({
        message: "Exam not found or not published"
      });
    }

    const { data: questions, error } = await db
      .from("questions")
      .select("id, question_text, option_a, option_b, option_c, option_d, marks")
      .eq("exam_id", id);

    if (error) throw error;

    res.json({
      exam,
      questions
    });

  } catch (error) {
    console.error("Questions error:", error.message);
    res.status(500).json({
      message: "Could not load exam questions"
    });
  }
});

// Public: List published exams
app.get("/api/exams", async (req, res) => {
  try {
    const { data, error } = await db
      .from("exams")
      .select("id, title, course_name, duration_minutes")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data || []);

  } catch (error) {
    console.error("Load exams error:", error.message);

    res.status(500).json({
      message: "Could not load exams"
    });
  }
});

// Start Server
// Submit Exam Results
app.post("/api/exams/:id/submit", async (req, res) => {
  try {
    const auth = req.headers.authorization;

    if (!auth) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const examId = req.params.id;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid answers" });
    }

    const { data: questions, error: questionError } = await db
      .from("questions")
      .select("id, correct_answer, marks")
      .eq("exam_id", examId);

    if (questionError) throw questionError;

    let score = 0;
    let totalMarks = 0;

    questions.forEach(question => {
      totalMarks += question.marks || 1;

      const studentAnswer = answers.find(
        a => a.question_id === question.id
      );

      if (
        studentAnswer &&
        studentAnswer.answer === question.correct_answer
      ) {
        score += question.marks || 1;
      }
    });

    const { error: saveError } = await db
      .from("results")
      .insert({
        student_id: decoded.id,
        exam_id: examId,
        score,
        total_marks: totalMarks,
        answers
      });

    if (saveError) throw saveError;

    res.json({
      message: "Exam submitted successfully",
      score,
      total_marks: totalMarks
    });

  } catch (error) {
    console.error("Submit exam error:", error);
    res.status(500).json({ message: "Could not submit exam" });
  }
});// Admin Login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!process.env.ADMIN_USERNAME ||
        !process.env.ADMIN_PASSWORD_HASH) {
      return res.status(500).json({
        message: "Admin environment variables are missing"
      });
    }

    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const storedHash = process.env.ADMIN_PASSWORD_HASH || "";
const parts = storedHash.split(":");

let validPassword = false;

if (parts.length === 2) {
  const [salt, savedHash] = parts;

  const calculatedHash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  const savedBuffer = Buffer.from(savedHash, "hex");
  const calculatedBuffer = Buffer.from(calculatedHash, "hex");

  if (
    savedBuffer.length === calculatedBuffer.length &&
    savedBuffer.length === 64
  ) {
    validPassword = crypto.timingSafeEqual(
      savedBuffer,
      calculatedBuffer
    );
  }
}

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin login successful",
      token
    });

  } catch (error) {
    console.error("Admin login error:", error.message);

    res.status(500).json({
      message: "Admin login failed"
    });
  }
});app.get("/api/admin/setup-check", (req, res) => {
  res.json({
    bcryptReady: true,
    usernameConfigured: !!process.env.ADMIN_USERNAME,
    passwordHashConfigured: !!process.env.ADMIN_PASSWORD_HASH
  });
});// Admin: View All Students
app.get("/api/admin/students", async (req, res) => {
  try {
    const auth = req.headers.authorization;

    if (!auth) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    const { data, error } = await db
      .from("students")
      .select("id,student_id,full_name,email")
      .order("id", { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (error) {
    console.error("Students error:", error.message);

    res.status(500).json({
      message: "Could not load students"
    });
  }
});
app.listen(PORT, () => {
  console.log("Grade 12 Exam Portal running on port " + PORT);
});
