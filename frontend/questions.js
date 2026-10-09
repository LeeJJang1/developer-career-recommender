const types = {
  logic:    { label:"Logic",    subtitle:"백엔드·시스템" },
  creative: { label:"Creative", subtitle:"프론트엔드·UX" },
  analysis: { label:"Analysis", subtitle:"AI·데이터" },
  stability:{ label:"Stability",subtitle:"운영·품질·보안" },
};

const questions = [
  { no: 1,  type: "logic",    text: "나는 프로그램이 내부적으로 어떻게 동작하는지 구조를 이해하는 것이 중요하다고 생각한다." },
   { no: 2,  type: "creative", text: "사용자가 직접 보게 되는 화면이나 인터페이스를 만드는 것이 즐겁다." },
   { no: 3,  type: "analysis", text: "데이터를 분석해 의미 있는 패턴이나 결과를 찾는 것이 흥미롭다." },
   { no: 4, type: "stability", text: "시스템이 안정적으로 작동하도록 관리하는 역할이 중요하다고 생각한다." },


  { no: 5,  type: "logic",    text: "서버, 데이터베이스, 네트워크 구조를 설계하는 일에 흥미가 있다." },
  { no: 6,  type: "creative", text: "디자인, 사용자 경험(UX), 화면 구성에 관심이 많다." },
  { no: 7,  type: "analysis", text: "인공지능이나 머신러닝 모델이 어떻게 학습하는지 알고 싶다." },
  { no: 8, type: "stability", text: "오류를 찾아내고 수정하거나, 보안 문제를 점검하는 일에 흥미가 있다." },


  { no: 9,  type: "logic",    text: "겉으로 보이지 않는 로직이나 성능 문제를 해결하는 것이 재미있다." },
  { no: 10,  type: "creative", text: "코드를 통해 시각적 결과물이 바로 나타나는 작업이 좋다." },
  { no: 11,  type: "analysis", text: "수치, 통계, 알고리즘을 통해 문제를 해결하는 것이 잘 맞는다." },
  { no: 12, type: "stability", text: "서비스가 중단되지 않도록 미리 대비하는 작업이 잘 맞는 편이다." },
];

const scale = [
  { label:"매우 그렇다", score: 4 },
  { label:"그렇다",     score: 3 },
  { label:"보통이다",   score: 2 },
  { label:"아니다",     score: 1 },
  { label:"전혀 아니다", score: 0 },
];

const quizList = document.getElementById("quizList");
const resultBtn = document.getElementById("resultBtn");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const hintText = document.getElementById("hintText");

const answers = new Map(); // qNo -> score

function buildQuiz(){
  quizList.innerHTML = "";
  questions.forEach(q => {
    const t = types[q.type];
    const card = document.createElement("div");
    card.className = "qCard";
    card.innerHTML = `
      <div class="qTop">
        <div class="qNo">Q${q.no}</div>
        <div class="qTag">${t.label} · ${t.subtitle}</div>
      </div>
      <p class="qText">${q.text}</p>
      <div class="options" role="radiogroup" aria-label="Q${q.no} 선택지"></div>
    `;

    const opts = card.querySelector(".options");
    scale.forEach((s, idx) => {
      const id = `q${q.no}_${idx}`;
      const label = document.createElement("label");
      label.className = "opt";
      label.innerHTML = `
        <input type="radio" name="q${q.no}" id="${id}" value="${s.score}">
        <div class="circle"><div class="dotIn"></div></div>
        <span>${s.label}</span>
      `;
      label.querySelector("input").addEventListener("change", (e) => {
        answers.set(q.no, Number(e.target.value));
        saveAnswers();
        updateProgress();
      });
      opts.appendChild(label);
    });

    quizList.appendChild(card);
  });
}

function updateProgress(){
  const done = answers.size;
  progressText.textContent = `${done} / 12`;
  progressBar.style.width = `${(done/12)*100}%`;

  const allDone = (done === 12);
  resultBtn.disabled = !allDone;
  hintText.textContent = allDone ? "준비 완료! 결과 보기를 눌러 확인해봐." : "12개 모두 선택하면 결과 보기가 활성화돼.";
}

function calcScores(){
  const sums = { logic:0, creative:0, analysis:0, stability:0 };
  questions.forEach(q => {
    const score = answers.get(q.no) ?? 0;
    sums[q.type] += score;
  });
  return sums; 
}

function saveAnswers(){
  const obj = Object.fromEntries(answers.entries());
  localStorage.setItem("devTestAnswers", JSON.stringify(obj));
}

function loadAnswers(){
  const raw = localStorage.getItem("devTestAnswers");
  if(!raw) return;
  try{
    const obj = JSON.parse(raw);
    Object.entries(obj).forEach(([k,v]) => answers.set(Number(k), Number(v)));
  }catch(e){}
}

function applyAnswersToUI(){
  answers.forEach((score, qNo) => {
    const selector = `input[name="q${qNo}"][value="${score}"]`;
    const input = document.querySelector(selector);
    if(input) input.checked = true;
  });
}

resultBtn.addEventListener("click", () => {
  const scores = calcScores();
  localStorage.setItem("devTestScores", JSON.stringify(scores));
  window.location.href = "./result.html";
});

// init
buildQuiz();
loadAnswers();
applyAnswersToUI();
updateProgress();
