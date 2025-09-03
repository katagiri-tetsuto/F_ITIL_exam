let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answered = [];
let correctAnswers = [];
let selectedIndex = -1;

async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    questions = await response.json();
    answered = new Array(questions.length).fill(false);
    correctAnswers = new Array(questions.length).fill(null);
    generateQuestionList();
    loadQuestion();
  } catch (error) {
    console.error("問題の読み込みに失敗しました:", error);
  }
}

function loadQuestion() {
  const question = questions[currentQuestionIndex];
  document.getElementById("question").textContent = question.question;
  const options = document.querySelectorAll(".option");
  options.forEach((option, index) => {
    const optionText = option.querySelector(".option-text");
    optionText.textContent = question.options[index];
    option.classList.remove("selected", "correct", "incorrect");
    option.onclick = () => selectOption(index);
  });
  selectedIndex = -1;
  document.getElementById("confirm-btn").style.display = "none";
  updateProgress();
  updateQuestionList();
  document.getElementById("question-container").style.display = "block";
  document.getElementById("answer-container").style.display = "none";
}

function generateQuestionList() {
  const list = document.getElementById("question-list");
  list.innerHTML = "";
  questions.forEach((question, index) => {
    const li = document.createElement("li");
    const title = document.createElement("div");
    title.className = "question-title";
    title.textContent = `問題 ${index + 1}`;
    const status = document.createElement("div");
    status.className = "question-status";
    status.textContent = "";
    const text = document.createElement("div");
    text.className = "question-text";
    text.textContent =
      question.question.length > 30
        ? question.question.substring(0, 30) + "..."
        : question.question;
    li.appendChild(title);
    li.appendChild(status);
    li.appendChild(text);
    li.onclick = () => jumpToQuestion(index);
    list.appendChild(li);
  });
  updateQuestionList();
}

function updateQuestionList() {
  const listItems = document.querySelectorAll("#question-list li");
  listItems.forEach((li, index) => {
    li.classList.remove("current", "answered", "correct", "incorrect");
    const status = li.querySelector(".question-status");
    status.textContent = "";
    status.style.color = "";
    if (index === currentQuestionIndex) {
      li.classList.add("current");
    }
    if (answered[index]) {
      li.classList.add("answered");
      if (correctAnswers[index]) {
        li.classList.add("correct");
        status.textContent = "正解";
        status.style.color = "#4caf50";
      } else {
        li.classList.add("incorrect");
        status.textContent = "不正解";
        status.style.color = "#f44336";
      }
    }
  });
}

function jumpToQuestion(index) {
  currentQuestionIndex = index;
  loadQuestion();
}

function selectOption(index) {
  const options = document.querySelectorAll(".option");
  options.forEach((option, i) => {
    option.classList.remove("selected");
  });
  options[index].classList.add("selected");
  selectedIndex = index;
  document.getElementById("confirm-btn").style.display = "block";
}

document.getElementById("confirm-btn").onclick = () => {
  if (selectedIndex === -1) return;
  const question = questions[currentQuestionIndex];
  const correct = question.correct;
  const options = document.querySelectorAll(".option");

  // 正解/不正解を表示
  const isCorrect = selectedIndex === correct;
  if (isCorrect) {
    score++;
    options[selectedIndex].classList.add("correct");
    document.getElementById("correct-answer").textContent = "正解！";
  } else {
    options[selectedIndex].classList.add("incorrect");
    options[correct].classList.add("correct");
    document.getElementById("correct-answer").textContent = "不正解";
  }

  // 説明を表示
  document.getElementById("explanation").textContent = question.explanation;

  // 回答済みにマーク
  answered[currentQuestionIndex] = true;
  correctAnswers[currentQuestionIndex] = isCorrect;
  updateQuestionList();

  document.getElementById("confirm-btn").style.display = "none";
  document.getElementById("answer-container").style.display = "block";
};

function updateProgress() {
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  document.getElementById("progress-fill").style.width = progress + "%";
  document.getElementById("progress-text").textContent = `${
    currentQuestionIndex + 1
  } / ${questions.length}`;
}

document.getElementById("next-btn").onclick = () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    showResults();
  }
};

function showResults() {
  document.getElementById("answer-container").style.display = "none";
  document.getElementById("result-container").style.display = "block";
  document.getElementById(
    "score"
  ).textContent = `あなたのスコア: ${score} / ${questions.length}`;
}

document.getElementById("restart-btn").onclick = () => {
  currentQuestionIndex = 0;
  score = 0;
  answered = new Array(questions.length).fill(false);
  correctAnswers = new Array(questions.length).fill(null);
  updateQuestionList();
  document.getElementById("result-container").style.display = "none";
  loadQuestion();
};

loadQuestions();
