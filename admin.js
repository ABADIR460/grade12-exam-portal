
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

    const editButton = document.createElement("button");
    editButton.textContent = "Edit Student";

    editButton.onclick = () => {
      editStudent(student);
    };const deleteButton = document.createElement("button");
deleteButton.textContent = "Delete Student";

deleteButton.onclick = () => {
  deleteStudent(student);
};

card.appendChild(deleteButton);

    card.append(name, id, email, editButton);
    list.appendChild(card);
  });

  if (students.length === 0) {
    list.textContent = "No students found.";
  }
}

async function editStudent(student) {
  const newName = prompt("Enter new student name:", student.full_name);
  if (newName === null) return;

  const newEmail = prompt("Enter new email:", student.email || "");
  if (newEmail === null) return;

  if (!newName.trim()) {
    alert("Student name is required.");
    return;
  }

  try {
    const response = await fetch(
      API + "/api/admin/students/" + student.id,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + adminToken
        },
        body: JSON.stringify({
          full_name: newName.trim(),
          email: newEmail.trim()
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Update failed");
    }

    alert("Student updated successfully!");
    loadStudents();

  } catch (error) {
    alert(error.message);
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
const multiQuestionExam =
  document.getElementById("multiQuestionExam");
   const manageQuestionExam =
  document.getElementById("manageQuestionExam"); 
examSelect.innerHTML =
  '<option value="">Select Exam</option>';
manageQuestionExam.innerHTML =
  '<option value="">Select Exam</option>';
bulkExamSelect.innerHTML =
  '<option value="">Select Exam</option>';
    examSelect.innerHTML =
      '<option value="">Select Exam</option>';
multiQuestionExam.innerHTML =
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
const multiOption = document.createElement("option");
multiOption.value = exam.id;
multiOption.textContent = exam.title;
multiQuestionExam.appendChild(multiOption);
      const manageOption = document.createElement("option");
manageOption.value = exam.id;
manageOption.textContent = exam.title;
manageQuestionExam.appendChild(manageOption);
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

      const resultStatus = document.createElement("p");

resultStatus.textContent = exam.results_published
  ? "Results: Published"
  : "Results: Unpublished";

const resultButton = document.createElement("button");

resultButton.textContent = exam.results_published
  ? "Unpublish Results"
  : "Publish Results";

resultButton.onclick = () => toggleResultsPublish(
  exam.id,
  !exam.results_published
);

const editButton = document.createElement("button");
editButton.textContent = "Edit Exam";
editButton.onclick = () => editExam(exam);

const deleteButton = document.createElement("button");
deleteButton.textContent = "Delete Exam";
deleteButton.onclick = () => deleteExam(exam.id);

card.append(
  title,
  status,
  button,
  resultStatus,
  resultButton,
  editButton,
  deleteButton
);

list.appendChild(card);
    });

  } catch (error) {
    list.textContent = error.message;
  }
}
async function toggleResultsPublish(examId, publish) {
  try {
    const response = await fetch(
      API + "/api/admin/exams/" + examId + "/results-status",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + adminToken
        },
        body: JSON.stringify({
          results_published: publish
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Update failed");
    }

    alert(data.message);
    loadExams();

  } catch (error) {
    alert(error.message);
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
    document.body.appendChild(link);
link.click();
document.body.removeChild(link);

setTimeout(() => {
  URL.revokeObjectURL(url);
}, 1000);

alert("Students CSV exported successfully!");
  } catch (error) {
    alert(error.message);
  }
}
async function deleteStudent(student) {
  const confirmDelete = confirm(
    "Are you sure you want to delete " +
    student.full_name + "?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
      API + "/api/admin/students/" + student.id,
      {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + adminToken
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Delete failed");
    }

    alert("Student deleted successfully!");
    loadStudents();

  } catch (error) {
    alert(error.message);
  }
}
function toggleQuestionForm() {
  const section = document.getElementById("addQuestionSection");

  if (section.style.display === "none") {
    section.style.display = "block";
  } else {
    section.style.display = "none";
  }
}

let multipleQuestionCount = 0;

function addAnotherQuestion() {
  if (multipleQuestionCount >= 100) {
    alert("Maximum 100 questions allowed.");
    return;
  }

  multipleQuestionCount++;

  const container = document.getElementById("multipleQuestions");

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h4>Question ${multipleQuestionCount}</h4>

    <textarea class="multiQuestionText"
      placeholder="Write question" required></textarea>

    <input class="multiOptionA" placeholder="Option A" required>
    <input class="multiOptionB" placeholder="Option B" required>
    <input class="multiOptionC" placeholder="Option C" required>
    <input class="multiOptionD" placeholder="Option D" required>

    <select class="multiCorrectAnswer" required>
      <option value="">Correct Answer</option>
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
    </select>

    <input class="multiQuestionMarks"
      type="number" value="1" min="1" required>

    <button type="button" class="removeQuestion">
      Remove Question
    </button>
  `;

  card.querySelector(".removeQuestion").onclick = function() {
    card.remove();
    updateQuestionNumbers();
  };

  container.appendChild(card);
}

function updateQuestionNumbers() {
  const cards = document.querySelectorAll("#multipleQuestions .card");
  multipleQuestionCount = cards.length;

  cards.forEach((card, index) => {
    card.querySelector("h4").textContent = "Question " + (index + 1);
  });
}

document.getElementById("multipleQuestionForm")
.addEventListener("submit", async function(e) {
  e.preventDefault();

  const message = document.getElementById("multipleQuestionMessage");
  const examId = document.getElementById("multiQuestionExam").value;
  const cards = document.querySelectorAll("#multipleQuestions .card");

  if (!examId) {
    message.textContent = "Please select an exam.";
    return;
  }

  if (cards.length === 0) {
    message.textContent = "Please add at least one question.";
    return;
  }

  message.textContent = "Saving questions...";

  try {
    const questions = Array.from(cards).map(card => ({
      exam_id: examId,
      question_text: card.querySelector(".multiQuestionText").value.trim(),
      option_a: card.querySelector(".multiOptionA").value.trim(),
      option_b: card.querySelector(".multiOptionB").value.trim(),
      option_c: card.querySelector(".multiOptionC").value.trim(),
      option_d: card.querySelector(".multiOptionD").value.trim(),
      correct_answer: card.querySelector(".multiCorrectAnswer").value,
      marks: Number(card.querySelector(".multiQuestionMarks").value)
    }));

    if (questions.some(q =>
      !q.question_text || !q.option_a || !q.option_b ||
      !q.option_c || !q.option_d ||
      !["A", "B", "C", "D"].includes(q.correct_answer) ||
      !Number.isInteger(q.marks) || q.marks < 1
    )) {
      throw new Error("Please complete all question fields correctly.");
    }

    const response = await fetch(API + "/api/admin/questions/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + adminToken
      },
      body: JSON.stringify({ questions })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not save questions");
    }

    message.textContent = "All questions saved successfully!";
    document.getElementById("multipleQuestions").innerHTML = "";
    multipleQuestionCount = 0;
    this.reset();

  } catch (error) {
    message.textContent = error.message;
  }
});

document.getElementById("manageQuestionExam")
.addEventListener("change", loadManagedQuestions);

async function loadManagedQuestions() {
  const examId = document.getElementById("manageQuestionExam").value;
  const list = document.getElementById("adminQuestionsList");

  if (!examId) {
    list.textContent = "Please select an exam.";
    return;
  }

  list.textContent = "Loading questions...";

  try {
    const response = await fetch(
      API + "/api/admin/exams/" + examId + "/questions",
      {
        headers: {
          "Authorization": "Bearer " + adminToken
        }
      }
    );

    const questions = await response.json();

    if (!response.ok) {
      throw new Error(questions.message || "Could not load questions");
    }

    list.innerHTML = "";

    if (questions.length === 0) {
      list.textContent = "No questions found.";
      return;
    }

    questions.forEach((q, index) => {
      const card = document.createElement("div");
      card.className = "card";

      const title = document.createElement("h4");
      title.textContent = "Question " + (index + 1);

      const question = document.createElement("p");
      question.textContent = q.question_text;

      const answer = document.createElement("p");
      answer.textContent = "Correct Answer: " + q.correct_answer;

      const marks = document.createElement("p");
      marks.textContent = "Marks: " + q.marks;

const editButton = document.createElement("button");
editButton.textContent = "Edit Question";
editButton.onclick = () => editManagedQuestion(q);

const deleteButton = document.createElement("button");
deleteButton.textContent = "Delete Question";
deleteButton.onclick = () => deleteManagedQuestion(q.id);

card.append(
  title,
  question,
  answer,
  marks,
  editButton,
  deleteButton
);

list.appendChild(card);

      
    });

  } catch (error) {
    list.textContent = error.message;
  }
}

async function editManagedQuestion(q) {
  const questionText = prompt("Edit Question:", q.question_text);
  if (questionText === null) return;

  const optionA = prompt("Edit Option A:", q.option_a);
  if (optionA === null) return;

  const optionB = prompt("Edit Option B:", q.option_b);
  if (optionB === null) return;

  const optionC = prompt("Edit Option C:", q.option_c);
  if (optionC === null) return;

  const optionD = prompt("Edit Option D:", q.option_d);
  if (optionD === null) return;

  const correctAnswer = prompt(
    "Correct Answer (A, B, C, D):",
    q.correct_answer
  );

  if (correctAnswer === null) return;

  const marks = prompt("Marks:", q.marks);
  if (marks === null) return;

  try {
    const response = await fetch(
      API + "/api/admin/questions/" + q.id,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + adminToken
        },
        body: JSON.stringify({
          question_text: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_answer: correctAnswer.trim().toUpperCase(),
          marks: Number(marks)
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Update failed");
    }

    alert("Question updated successfully!");
    loadManagedQuestions();

  } catch (error) {
    alert(error.message);
  }
}

async function deleteManagedQuestion(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this question?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      API + "/api/admin/questions/" + id,
      {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + adminToken
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Delete failed");
    }

    alert("Question deleted successfully!");
    loadManagedQuestions();

  } catch (error) {
    alert(error.message);
  }
}
async function editExam(exam) {
  const title = prompt("Enter new exam title:", exam.title);
  if (title === null || title.trim() === "") return;

  const subject = prompt(
    "Enter new subject:",
    exam.course_name || ""
  );
  if (subject === null || subject.trim() === "") return;

  const duration = prompt(
    "Enter duration in minutes:",
    exam.duration_minutes
  );
  if (duration === null || Number(duration) <= 0) return;

  try {
    const response = await fetch(API + "/api/admin/exams/" + exam.id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + adminToken
      },
      body: JSON.stringify({
        title: title.trim(),
        course_name: subject.trim(),
        duration_minutes: Number(duration)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not update exam");
    }

    alert("Exam updated successfully!");
    loadExams();

  } catch (error) {
    alert(error.message);
  }
}
