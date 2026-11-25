
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

let allStudentRecords = [];

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

    allStudentRecords = students;

    document.getElementById("totalStudents").textContent =
      students.length;

    displayStudents(allStudents = students);

  } catch (error) {
    list.textContent = error.message;
  }
}

function displayStudents(students) {
  const list = document.getElementById("studentsList");
  list.innerHTML = "";

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

  if (students.length === 0) {
    list.textContent = "No students found.";
  }
}

function searchStudents() {
  const search = document
    .getElementById("studentSearch")
    .value.toLowerCase().trim();

  const filtered = allStudentRecords.filter(student =>
    String(student.student_id || "").toLowerCase().includes(search) ||
    String(student.full_name || "").toLowerCase().includes(search) ||
    String(student.email || "").toLowerCase().includes(search)
  );

  displayStudents(filtered);
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
const bulkExamSelect = document.getElementById("bulkExamSelect");

examSelect.innerHTML =
  '<option value="">Select Exam</option>';

bulkExamSelect.innerHTML =
  '<option value="">Select Exam</option>';
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
      const bulkOption = document.createElement("option");
bulkOption.value = exam.id;
bulkOption.textContent = exam.title;
bulkExamSelect.appendChild(bulkOption);

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
student.textContent =
  "Student: " + (result.students?.full_name || result.student_id);
const studentId = document.createElement("p");
studentId.textContent =
  "Student ID: " + result.students?.student_id;
const email = document.createElement("p");
email.textContent =
  "Email: " + (result.students?.email || "Not available");

      const exam = document.createElement("p");
      exam.textContent = "Exam: " + (result.exams?.title || result.exam_id);

      const score = document.createElement("p");
      score.textContent =
        "Score: " + result.score + " / " + result.total_marks;

      const date = document.createElement("p");
      date.textContent = "Submitted: " +
        new Date(result.submitted_at).toLocaleString();
card.append(studentId, student, email, exam, score, date);
      list.appendChild(card);
    });

  } catch (error) {
    list.textContent = error.message;
  }
}
if (adminToken) {
  showDashboard();
}

function parseCSVLine(line) {
  const values = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        value += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      values.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value.trim());
  return values;
}

async function uploadBulkQuestions() {
  const examId =
    document.getElementById("bulkExamSelect").value;

  const file =
    document.getElementById("questionsCSV").files[0];

  const message =
    document.getElementById("bulkMessage");

  if (!examId || !file) {
    message.textContent = "Select exam and CSV file.";
    return;
  }

  try {
    const text = await file.text();

    const lines = text.trim().split(/\r?\n/);

    if (lines.length < 2 || lines.length > 101) {
      throw new Error("CSV must contain 1 to 100 questions.");
    }

    const questions = lines.slice(1).map(line => {
      const values = parseCSVLine(line);

      if (values.length !== 7) {
        throw new Error("CSV column format is incorrect.");
      }

      return {
        exam_id: examId,
        question_text: values[0],
        option_a: values[1],
        option_b: values[2],
        option_c: values[3],
        option_d: values[4],
        correct_answer: values[5].toUpperCase(),
        marks: Number(values[6])
      };
    });

    if (questions.some(q =>
      !q.question_text ||
      !q.option_a ||
      !q.option_b ||
      !q.option_c ||
      !q.option_d ||
      !["A", "B", "C", "D"].includes(q.correct_answer) ||
      !Number.isInteger(q.marks) ||
      q.marks < 1
    )) {
      throw new Error("Check your question data and correct answers.");
    }

    const response = await fetch(
      API + "/api/admin/questions/bulk",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + adminToken
        },
        body: JSON.stringify({ questions })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Upload failed");
    }

    message.textContent =
      result.count + " questions uploaded successfully!";

    document.getElementById("questionsCSV").value = "";

  } catch (error) {
    message.textContent = error.message;
  }
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
async function exportResultsCSV() {
  try {
    const response = await fetch(API + "/api/admin/results", {
      headers: {
        "Authorization": "Bearer " + adminToken
      }
    });

    const results = await response.json();

    if (!response.ok) {
      throw new Error("Could not load results");
    }

    const headers = [
      "Student ID",
      "Student Name",
      "Email",
      "Exam",
      "Score",
      "Total Marks",
      "Submitted Date"
    ];

    const rows = results.map(result => [
      result.students?.student_id || "",
      result.students?.full_name || "",
      result.students?.email || "",
      result.exams?.title || "",
      result.score,
      result.total_marks,
      result.submitted_at
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(value =>
        '"' + String(value ?? "").replace(/"/g, '""') + '"'
      ).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Exam_Results.csv";
    link.click();

    URL.revokeObjectURL(url);

  } catch (error) {
    alert(error.message);
  }
}
async function exportStudentsCSV() {
  try {
    const response = await fetch(API + "/api/admin/students", {
      headers: {
        "Authorization": "Bearer " + adminToken
      }
    });

    const students = await response.json();

    if (!response.ok) {
      throw new Error(students.message || "Export failed");
    }

    const headers = [
      "Student ID",
      "Full Name",
      "Email"
    ];

    const rows = students.map(student => [
      student.student_id,
      student.full_name,
      student.email || ""
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(value =>
        '"' + String(value ?? "").replace(/"/g, '""') + '"'
      ).join(","))
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Students.csv";
    link.click();

    URL.revokeObjectURL(url);

  } catch (error) {
    alert(error.message);
  }
}
