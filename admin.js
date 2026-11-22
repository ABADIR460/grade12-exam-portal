
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
  document.getElementById("studentsList").textContent =
    "Student API will be connected next.";
}

async function loadExams() {
  document.getElementById("examsList").textContent =
    "Exam API will be connected next.";
}

async function loadResults() {
  document.getElementById("resultsList").textContent =
    "Results API will be connected next.";
}

if (adminToken) {
  showDashboard();
}
