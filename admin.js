
const API = "https://grade12-exam-backend.onrender.com";

let adminToken = sessionStorage.getItem("adminToken") || "";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function(e) {
  e.preventDefault();

  message.textContent = "Logging in...";

  try {
    const response = await fetch(API + "/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    adminToken = data.token;
    sessionStorage.setItem("adminToken", adminToken);

    showDashboard();

  } catch (error) {
    message.textContent = error.message;
  }
});

function showDashboard() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
}

function logout() {
  sessionStorage.removeItem("adminToken");
  location.reload();
}


async function loadStudents() {
  const list = document.getElementById("studentsList");
  list.textContent = "Loading students...";

  try {
    const response = await fetch(API + "/api/admin/students", {
      headers: {
        "Authorization": "Bearer " + adminToken
      }
    });

    const students = await response.json();

    if (!response.ok) {
      throw new Error(students.message || "Could not load students");
    }

    list.innerHTML = "";

    const count = document.createElement("h3");
    count.textContent = "Total Students: " + students.length;
    list.appendChild(count);

    students.forEach(student => {
      const card = document.createElement("div");
      card.className = "card";

      const name = document.createElement("p");
      name.textContent = "Name: " + student.full_name;

      const id = document.createElement("p");
      id.textContent = "Student ID: " + student.student_id;

      const email = document.createElement("p");
      email.textContent = "Email: " + (student.email || "N/A");

      card.append(name, id, email);
      list.appendChild(card);
    });

  } catch (error) {
    list.textContent = error.message;
  }
}


async function loadExams() {
  const list = document.getElementById("examsList");
  list.textContent = "Loading exams...";

  try {
    const response = await fetch(API + "/api/exams");

    const exams = await response.json();

    if (!response.ok) {
      throw new Error(exams.message || "Could not load exams");
    }

    list.innerHTML = "";

    const count = document.createElement("h3");
    count.textContent = "Total Exams: " + exams.length;
    list.appendChild(count);

    exams.forEach(exam => {
      const card = document.createElement("div");
      card.className = "card";

      const title = document.createElement("h3");
      title.textContent = exam.title;

      const course = document.createElement("p");
      course.textContent = "Course: " + (exam.course_name || "N/A");

      const duration = document.createElement("p");
      duration.textContent =
        "Duration: " + exam.duration_minutes + " minutes";

      card.append(title, course, duration);
      list.appendChild(card);
    });

  } catch (error) {
    list.textContent = error.message;
  }
}
function showCreateExam() {
  const form = document.getElementById("createExamForm");

  form.style.display =
    form.style.display === "none" ? "block" : "none";
}
document.getElementById("examForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const message = document.getElementById("examMessage");
  message.textContent = "Saving exam...";

  try {
    const response = await fetch(API + "/api/admin/exams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + adminToken
      },
      body: JSON.stringify({
        title: document.getElementById("examTitle").value,
        course_name: document.getElementById("courseName").value,
        duration_minutes: Number(document.getElementById("examDuration").value)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not save exam");
    }

    message.textContent = "Exam created successfully!";
    document.getElementById("examForm").reset();
    loadExams();

  } catch (error) {
    message.textContent = error.message;
  }
});
async function loadResults() {
  document.getElementById("resultsList").textContent =
    "Results API will be connected next.";
}

if (adminToken) {
  showDashboard();
}
