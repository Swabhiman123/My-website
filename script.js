const $ = id => document.getElementById(id);

let questions = JSON.parse(localStorage.getItem("quizforge_questions") || "[]");
let quizIndex = 0;
let selectedAnswer = null;
let score = 0;
let editingIndex = null;

function saveData() {
  localStorage.setItem("quizforge_questions", JSON.stringify(questions));
}

function createOption(value = "", correct = false) {
  const row = document.createElement("div");
  row.className = "option-row";
  row.innerHTML = `
    <input type="radio" name="correct" ${correct ? "checked" : ""} aria-label="Correct answer">
    <input type="text" value="${escapeHtml(value)}" placeholder="Option ${$("options").children.length + 1}">
    <button class="remove-option" title="Remove option">×</button>
  `;
  row.querySelector(".remove-option").onclick = () => {
    if ($("options").children.length > 2) row.remove();
  };
  $("options").appendChild(row);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function resetForm() {
  $("question").value = "";
  $("options").innerHTML = "";
  createOption(); createOption(); createOption(); createOption(true);
  editingIndex = null;
  $("saveQuestion").textContent = "Add question";
}

function renderList() {
  $("questionCount").textContent = `${questions.length} question${questions.length === 1 ? "" : "s"}`;
  $("startQuiz").disabled = questions.length === 0;
  const list = $("questionList");
  if (!questions.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">?</div><h3>No questions yet</h3><p>Add your first question using the form.</p></div>`;
    return;
  }
  list.innerHTML = questions.map((q, i) => `
    <div class="question-item">
      <strong>${i+1}. ${escapeHtml(q.text)}</strong>
      <small>${q.options.length} choices • Correct: ${escapeHtml(q.options[q.correct])}</small>
      <div class="item-actions">
        <button onclick="editQuestion(${i})">Edit</button>
        <button class="delete" onclick="deleteQuestion(${i})">Delete</button>
      </div>
    </div>
  `).join("");
}

window.editQuestion = function(i) {
  const q = questions[i];
  editingIndex = i;
  $("question").value = q.text;
  $("options").innerHTML = "";
  q.options.forEach((o, j) => createOption(o, j === q.correct));
  $("saveQuestion").textContent = "Save changes";
  window.scrollTo({top:0, behavior:"smooth"});
};

window.deleteQuestion = function(i) {
  if (!confirm("Delete this question?")) return;
  questions.splice(i,1); saveData(); renderList();
  if (editingIndex === i) resetForm();
};

$("addOption").onclick = () => createOption();

$("saveQuestion").onclick = () => {
  const text = $("question").value.trim();
  const rows = [...$("options").querySelectorAll(".option-row")];
  const opts = rows.map(r => r.querySelector('input[type=text]').value.trim());
  const correct = rows.findIndex(r => r.querySelector('input[type=radio]').checked);
  if (!text) return alert("Please enter a question.");
  if (opts.length < 2 || opts.some(o => !o)) return alert("Please fill in every option.");
  if (correct < 0) return alert("Please select the correct answer.");
  const item = {text, options:opts, correct};
  if (editingIndex === null) questions.push(item);
  else questions[editingIndex] = item;
  saveData(); renderList(); resetForm();
};

$("resetForm").onclick = resetForm;

$("clearAll").onclick = () => {
  if (!questions.length || confirm("Clear all questions?")) {
    questions = []; saveData(); renderList(); resetForm();
  }
};

function show(view) {
  ["builderView","quizView","resultView"].forEach(v => $(v).classList.add("hidden"));
  $(view).classList.remove("hidden");
}

function renderQuiz() {
  const q = questions[quizIndex];
  $("questionNumber").textContent = `${quizIndex+1} / ${questions.length}`;
  $("progress").textContent = `${quizIndex+1} of ${questions.length}`;
  $("progressFill").style.width = `${((quizIndex+1)/questions.length)*100}%`;
  $("quizQuestion").textContent = q.text;
  $("quizOptions").innerHTML = q.options.map((o,i) => `
    <button class="quiz-option" data-index="${i}">
      <span class="letter">${String.fromCharCode(65+i)}</span>${escapeHtml(o)}
    </button>
  `).join("");
  selectedAnswer = null;
  $("nextQuestion").disabled = true;
  $("nextQuestion").textContent = quizIndex === questions.length-1 ? "Finish quiz" : "Next";
  document.querySelectorAll(".quiz-option").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".quiz-option").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedAnswer = Number(btn.dataset.index);
      $("nextQuestion").disabled = false;
    };
  });
}

$("startQuiz").onclick = () => {
  quizIndex = 0; score = 0; show("quizView"); renderQuiz();
};

$("nextQuestion").onclick = () => {
  if (selectedAnswer === questions[quizIndex].correct) score++;
  quizIndex++;
  if (quizIndex < questions.length) renderQuiz();
  else showResult();
};

function showResult() {
  show("resultView");
  const pct = Math.round((score/questions.length)*100);
  $("score").textContent = pct;
  $("resultTitle").textContent = pct === 100 ? "Perfect score!" : pct >= 70 ? "Great job!" : pct >= 50 ? "Good effort!" : "Keep practicing!";
  $("resultText").textContent = `You got ${score} out of ${questions.length} question${questions.length === 1 ? "" : "s"} correct.`;
}

$("retryQuiz").onclick = () => { quizIndex=0; score=0; show("quizView"); renderQuiz(); };
$("resultBuilder").onclick = () => show("builderView");
$("backToBuilder").onclick = () => show("builderView");

resetForm();
renderList();
