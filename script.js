let questions = [];
let questionSets = [];
let currentSetIndex = -1;
let currentQuestionIndex = 0;
let score = 0;
let answered = [];
let correctAnswers = [];
let selectedIndex = -1;

async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    questions = await response.json();
    createQuestionSets();
    answered = new Array(questions.length).fill(false);
    correctAnswers = new Array(questions.length).fill(null);
    showTopScreen();
  } catch (error) {
    console.error("問題の読み込みに失敗しました:", error);
  }
}

function createQuestionSets() {
  const setSize = 40;
  questionSets = [];
  for (let i = 0; i < questions.length; i += setSize) {
    questionSets.push(questions.slice(i, i + setSize));
  }
  console.log("questions:", questions);
  console.log("questionSets:", questionSets);
}

function shuffleQuestions() {
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  createQuestionSets();
  // 解答情報をリセット
  currentSetIndex = -1;
  currentQuestionIndex = 0;
  score = 0;
  answered = [];
  correctAnswers = [];
  selectedIndex = -1;
  // localStorageもクリア
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("completed_set_")) {
      localStorage.removeItem(key);
    }
  }
  generateSetList();
}

function showTopScreen() {
  document.getElementById("sidebar").style.display = "none";
  document.getElementById("top-container").style.display = "block";
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("analysis-container").style.display = "none";
  generateSetList();
}

function updateProgressSummary() {
  const totalQuestions = questions.length;
  const answeredCount = answered.filter((a) => a).length;
  document.getElementById(
    "progress-summary"
  ).textContent = `解答済み: ${answeredCount} / ${totalQuestions} 問`;
}

function generateSetList() {
  const list = document.getElementById("set-list");
  list.innerHTML = "";
  console.log("questionSets:", questionSets);
  questionSets.forEach((set, index) => {
    const button = document.createElement("button");
    button.className = "set-button";
    const isCompleted =
      localStorage.getItem(`completed_set_${index}`) === "true";
    const startIndex = index * 40;
    const endIndex = startIndex + set.length;
    const setAnswered = answered.slice(startIndex, endIndex);
    const answeredCount = setAnswered.filter((a) => a).length;
    button.textContent = `セット ${index + 1} (${
      set.length
    }問) - 解答済み: ${answeredCount}/${set.length}${isCompleted ? " ✅" : ""}`;
    button.onclick = () => selectSet(index);
    list.appendChild(button);
  });
}

function selectSet(index) {
  if (currentSetIndex !== index) {
    // 違うセットを選択したらリセット
    currentSetIndex = index;
    currentQuestionIndex = 0;
    score = 0;
    const set = questionSets[currentSetIndex];
    answered = new Array(set.length).fill(false);
    correctAnswers = new Array(set.length).fill(null);
  }
  generateQuestionList();
  showQuizScreen();
}

function showQuizScreen() {
  document.getElementById("sidebar").style.display = "block";
  document.getElementById("top-container").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";
  document.getElementById("analysis-container").style.display = "none";
  loadQuestion();
}

function loadQuestion() {
  const set = questionSets[currentSetIndex];
  const question = set[currentQuestionIndex];
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
  document.getElementById("finish-test-btn").style.display = "block";
  updateProgress();
  updateQuestionList();
  document.getElementById("question-container").style.display = "block";
  document.getElementById("answer-container").style.display = "none";

  // 最後の問題の場合、next-btnのテキストを変更
  const nextBtn = document.getElementById("next-btn");
  if (currentQuestionIndex === set.length - 1) {
    nextBtn.textContent = "テストを完了";
  } else {
    nextBtn.textContent = "次の問題 ▶";
  }
}

function generateQuestionList() {
  const list = document.getElementById("question-list");
  list.innerHTML = "";
  const set = questionSets[currentSetIndex];
  set.forEach((question, index) => {
    const li = document.createElement("li");
    const title = document.createElement("div");
    title.className = "question-title";
    const number = document.createElement("span");
    number.className = "question-number";
    number.textContent = `問題 ${index + 1}`;
    const status = document.createElement("span");
    status.className = "question-status";
    status.textContent = "";
    title.appendChild(number);
    title.appendChild(status);
    const text = document.createElement("div");
    text.className = "question-text";
    text.textContent =
      question.question.length > 30
        ? question.question.substring(0, 30) + "..."
        : question.question;
    li.appendChild(title);
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
  const set = questionSets[currentSetIndex];
  const question = set[currentQuestionIndex];
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
  document.getElementById("finish-test-btn").style.display = "block";
  document.getElementById("answer-container").style.display = "block";
};

function updateProgress() {
  const set = questionSets[currentSetIndex];
  const progress = ((currentQuestionIndex + 1) / set.length) * 100;
  document.getElementById("progress-fill").style.width = progress + "%";
  document.getElementById("progress-text").textContent = `${
    currentQuestionIndex + 1
  } / ${set.length}`;
}

document.getElementById("next-btn").onclick = () => {
  currentQuestionIndex++;
  const set = questionSets[currentSetIndex];
  if (currentQuestionIndex < set.length) {
    loadQuestion();
  } else {
    showAnalysisScreen();
  }
};

function showAnalysisScreen() {
  const set = questionSets[currentSetIndex];
  const percentage = Math.round((score / set.length) * 100);
  document.getElementById(
    "analysis-score"
  ).textContent = `正解率: ${percentage}%`;
  document.getElementById("pass-fail").textContent =
    percentage >= 65 ? "結果: 合格" : "結果: 不合格";

  // 完了したら保存
  if (answered.every((a) => a)) {
    localStorage.setItem(`completed_set_${currentSetIndex}`, "true");
  }

  document.getElementById("sidebar").style.display = "block";
  document.getElementById("top-container").style.display = "none";
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("analysis-container").style.display = "block";
}

document.getElementById("back-to-top-btn").onclick = () => {
  showTopScreen();
};

document.getElementById("back-to-quiz-btn").onclick = () => {
  showQuizScreen();
};

document.getElementById("back-to-top-from-quiz-btn").onclick = () => {
  showTopScreen();
};

document.getElementById("shuffle-btn").onclick = () => {
  if (confirm("問題をシャッフルしますか？現在の解答情報はリセットされます。")) {
    shuffleQuestions();
    alert("問題がシャッフルされました！");
  }
};

document.getElementById("finish-test-btn").onclick = () => {
  showAnalysisScreen();
};

loadQuestions();
