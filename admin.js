
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
    const response = await fetch(API + "/api/admin/exams", {
      headers: {
        "Authorization": "Bearer " + adminToken
      }
    });

    const exams = await response.json();

    if (!response.ok) {
      throw new Error(exams.message || "Could not load exams");
    }

    list.innerHTML = "";

    const examSelect = document.getElementById("questionExam");
    examSelect.innerHTML =
      '<option value="">Select Exam</option>';

    const count = document.createElement("h3");
    count.textContent = "Total Exams: " + exams.length;
    list.appendChild(count);

    exams.forEach(exam => {
      const option = document.createElement("option");
      option.value = exam.id;
      option.textContent = exam.title;
      examSelect.appendChild(option);

      const card = document.createElement("div");
      card.className = "card";

      const title = document.createElement("h3");
      title.textContent = exam.title;

      const status = document.createElement("p");
      status.textContent = exam.is_published
        ? "Status: Published"
        : "Status: Unpublished";

      const button = document.createElement("button");
      button.textContent = exam.is_published
        ? "Unpublish Exam"
        : "Publish Exam";

      button.onclick = () => toggleExamPublish(
        exam.id,
        !exam.is_published
      );

      card.append(title, status, button);
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
document.getElementById("questionForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const message = document.getElementById("questionMessage");
  message.textContent = "Saving question...";

  try {
    const response = await fetch(API + "/api/admin/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + adminToken
      },
      body: JSON.stringify({
        exam_id: document.getElementById("questionExam").value,
        question_text: document.getElementById("questionText").value,
        option_a: document.getElementById("optionA").value,
        option_b: document.getElementById("optionB").value,
        option_c: document.getElementById("optionC").value,
        option_d: document.getElementById("optionD").value,
        correct_answer: document.getElementById("correctAnswer").value,
        marks: Number(document.getElementById("questionMarks").value)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not save question");
    }

    message.textContent = "Question saved successfully!";
    document.getElementById("questionForm").reset();

  } catch (error) {
    message.textContent = error.message;
  }
});

async function loadResults() {
  const list = document.getElementById("resultsList");
  list.textContent = "Loading results...";

  try {
    const response = await fetch(API + "/api/admin/results", {
      headers: {
        "Authorization": "Bearer " + adminToken
      }
    });

    const results = await response.json();

    if (!response.ok) {
      throw new Error(results.message || "Could not load results");
    }

    list.innerHTML = "";

    const count = document.createElement("h3");
    count.textContent = "Total Results: " + results.length;
    list.appendChild(count);

    results.forEach(result => {
      const card = document.createElement("div");
      card.className = "card";

      const student = document.createElement("p");
      student.textContent = "Student ID: " + result.student_id;

      const exam = document.createElement("p");
      exam.textContent = "Exam: " + (result.exams?.title || result.exam_id);

      const score = document.createElement("p");
      score.textContent =
        "Score: " + result.score + " / " + result.total_marks;

      const date = document.createElement("p");
      date.textContent = "Submitted: " +
        new Date(result.submitted_at).toLocaleString();

      card.append(student, exam, score, date);
      list.appendChild(card);
    });

  } catch (error) {
    list.textContent = error.message;
  }
}
if (adminToken) {
  showDashboard();
}
async function toggleExamPublish(examId, publishStatus) {
  try {
    const response = await fetch(
      API + "/api/admin/exams/" + encodeURIComponent(examId) + "/publish",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + adminToken
        },
        body: JSON.stringify({
          is_published: publishStatus
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not update exam");
    }

    alert(data.message || "Exam status updated successfully!");
    loadExams();

  } catch (error) {
    alert(error.message);
  }
}
