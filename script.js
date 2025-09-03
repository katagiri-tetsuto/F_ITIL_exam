let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answered = [];

async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    questions = await response.json();
    answered = new Array(questions.length).fill(false);
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
  updateProgress();
  updateQuestionList();
  document.getElementById("question-container").style.display = "block";
  document.getElementById("answer-container").style.display = "none";
}

function generateQuestionList() {
  const list = document.getElementById("question-list");
  list.innerHTML = "";
  questions.forEach((_, index) => {
    const li = document.createElement("li");
    li.textContent = `問題 ${index + 1}`;
    li.onclick = () => jumpToQuestion(index);
    list.appendChild(li);
  });
  updateQuestionList();
}

function updateQuestionList() {
  const listItems = document.querySelectorAll("#question-list li");
  listItems.forEach((li, index) => {
    li.classList.remove("current", "answered");
    if (index === currentQuestionIndex) {
      li.classList.add("current");
    }
    if (answered[index]) {
      li.classList.add("answered");
    }
  });
}

function jumpToQuestion(index) {
  currentQuestionIndex = index;
  loadQuestion();
}

function selectOption(selectedIndex) {
  const question = questions[currentQuestionIndex];
  const correct = question.correct;
  const options = document.querySelectorAll(".option");

  // 選択したオプションをハイライト
  options[selectedIndex].classList.add("selected");

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
  updateQuestionList();

  document.getElementById("question-container").style.display = "none";
  document.getElementById("answer-container").style.display = "block";
}

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
  updateQuestionList();
  document.getElementById("result-container").style.display = "none";
  loadQuestion();
};

loadQuestions();
