// ===============================
// 결과 페이지 스크립트
// - 설문 점수 기반 대표 성향 표시
// - FastAPI 추천 결과(클러스터/유사도/트랙) 표시
// - 4개 영역 UI 채우기: (1) 요약+레이더 (2) 직무목록 (3) 커리큘럼 (4) 고용정보(placeholder)
// ===============================

const scores = JSON.parse(localStorage.getItem("devTestScores"));
const API_BASE = "http://localhost:8000";

/* ===============================
   0. 설문 기반 성향 정의
================================ */
const types = {
  logic: {
    label: "Logic",
    subtitle: "백엔드·시스템",
    color: "var(--logic)",
    desc: "내부 구조, 서버/DB/네트워크 설계, 성능·로직 최적화에 흥미가 큰 편이야."
  },
  creative: {
    label: "Creative",
    subtitle: "프론트엔드·UX",
    color: "var(--creative)",
    desc: "UI/UX와 사용자가 보는 화면을 만드는 데 흥미가 큰 편이야."
  },
  analysis: {
    label: "Analysis",
    subtitle: "AI·데이터",
    color: "var(--analysis)",
    desc: "데이터·통계·AI 모델을 통해 의미 있는 결과를 도출하는 타입이야."
  },
  stability: {
    label: "Stability",
    subtitle: "운영·품질·보안",
    color: "var(--stability)",
    desc: "서비스 안정성과 운영, 품질/보안에 관심이 큰 타입이야."
  }
};

/* ===============================
   1. 클러스터 정보(직무/커리큘럼)
   - 직무: 너가 준 목록을 그대로 반영
   - 커리큘럼: 너가 준 마이크로디그리 맵 과목명 기반으로 '클러스터별 추천'을 구성
================================ */
const clusterInfo = {
  0: {
    title: "시스템/저수준/아키텍처 + 연구·전문직",
    desc: "‘컴퓨터가 실제로 어떻게 돌아가는지’를 깊게 파는 방향 (OS/네트워크/아키텍처/시스템프로그래밍/알고리즘).",
    roles: [
      "소프트웨어 엔지니어(소프트웨어 개발자)",
      "시스템 프로그래머",
      "임베디드 시스템 엔지니어",
      "컴퓨터 비전 엔지니어",
      "추천 시스템 엔지니어",
      "사이트 신뢰성 엔지니어(SRE)",
      "네트워크 엔지니어",
      "시스템 엔지니어",
      "정보보안 엔지니어",
      "디지털 포렌식 전문가",
      "UI 디자이너",
      "컴퓨터 과학 연구원",
      "로봇공학 엔지니어",
      "HCI 연구원",
      "자율주행 엔지니어",
      "솔루션 아키텍트",
      "오픈소스 개발자"
    ],
    curriculum: {
      y2: ["컴퓨터아키텍처", "운영체제", "자료구조및실습", "객체지향프로그래밍", "컴퓨터네트워크"],
      y3: ["시스템프로그래밍", "네트워크프로그래밍", "알고리즘및실습", "데이터베이스", "영상처리프로그래밍"],
      y4: ["소프트웨어공학", "알고리즘응용", "인공지능", "캡스톤설계", "기업협력형캡스톤설계"]
    }
  },
  1: {
    title: "테스트/검증/DevOps/보안 실무",
    desc: "‘만드는 것보다 잘 돌아가게 만들고 문제를 잡아내는 것’이 중심 (품질/자동화/성능/보안).",
    roles: [
      "데브옵스(DevOps) 엔지니어",
      "침투 테스트(펜테스트) 전문가",
      "소프트웨어 테스터",
      "테스트 자동화 엔지니어",
      "성능 테스트 엔지니어"
    ],
    curriculum: {
      y2: ["운영체제", "컴퓨터네트워크", "자료구조및실습", "객체지향프로그래밍"],
      y3: ["시스템프로그래밍", "네트워크프로그래밍", "웹정보프레임워크", "데이터베이스", "소프트웨어분석및설계"],
      y4: ["소프트웨어공학", "IT프로젝트관리와커뮤니케이션", "스프링프레임워크", "캡스톤설계", "기업협력형캡스톤설계"]
    }
  },
  2: {
    title: "데이터/AI 중심",
    desc: "‘데이터로 학습하고 예측/추천/자동화를 만드는 것’ (ML/DL/빅데이터/DB/크롤링/배포).",
    roles: [
      "데이터 사이언티스트",
      "데이터 엔지니어",
      "머신러닝 엔지니어",
      "딥러닝 연구원",
      "자연어 처리(NLP) 엔지니어",
      "AI(인공지능) 엔지니어",
      "스타트업 창업자"
    ],
    curriculum: {
      y2: ["컴퓨터수학", "자료구조및실습", "객체지향프로그래밍", "컴퓨터네트워크"],
      y3: ["데이터베이스", "빅데이터분석", "알고리즘및실습", "영상처리프로그래밍"],
      y4: ["인공지능", "데이터크롤링", "프롬프트엔지니어링", "캡스톤설계", "기업협력형캡스톤설계"]
    }
  },
  3: {
    title: "웹/앱 서비스 개발 중심",
    desc: "‘서비스를 직접 만들어서 배포하는 것’ 중심 (웹/DB/프레임워크/스프링/모바일/클라우드).",
    roles: [
      "프론트엔드 개발자",
      "백엔드 개발자",
      "풀스택 개발자",
      "웹 개발자",
      "모바일 앱 개발자",
      "안드로이드 개발자",
      "iOS 개발자",
      "클라우드 엔지니어"
    ],
    curriculum: {
      y2: ["객체지향프로그래밍", "자료구조및실습", "컴퓨터네트워크", "운영체제"],
      y3: ["웹정보프레임워크", "데이터베이스", "소프트웨어분석및설계", "네트워크프로그래밍"],
      y4: ["스프링프레임워크", "모바일프로그래밍", "소프트웨어공학", "IT프로젝트관리와커뮤니케이션", "캡스톤설계"]
    }
  },
  4: {
    title: "제품/사용자 경험 + 문서/컨설팅 + QA",
    desc: "‘개발만이 아니라 제품/프로세스/협업’을 다루는 방향 (PM/UX/QA/컨설팅/문서).",
    roles: [
      "QA(품질보증) 엔지니어",
      "UX 디자이너",
      "UX 엔지니어",
      "프로덕트 매니저(PM)",
      "테크니컬 프로덕트 매니저(TPM)",
      "비디오 처리 엔지니어",
      "IT 컨설턴트",
      "기술 문서 작성자(테크니컬 라이터)"
    ],
    curriculum: {
      y2: ["소프트웨어적사고", "자료구조및실습", "객체지향프로그래밍", "컴퓨터네트워크"],
      y3: ["소프트웨어분석및설계", "웹정보프레임워크", "데이터베이스", "빅데이터분석"],
      y4: ["IT프로젝트관리와커뮤니케이션", "소프트웨어공학", "프롬프트엔지니어링", "지식재산권과창업", "캡스톤설계"]
    }
  },
  5: {
    title: "콘텐츠/실시간 성능/그래픽·게임 + 보안 일부",
    desc: "‘실시간/성능/그래픽/디바이스’ 같은 기술 난이도 높은 구현 중심.",
    roles: [
      "펌웨어 엔지니어",
      "게임 개발자",
      "게임 엔진 개발자",
      "사이버보안 분석가",
      "AR/VR 개발자",
      "그래픽스 프로그래머(그래픽 프로그래머)"
    ],
    curriculum: {
      y2: ["컴퓨터아키텍처", "운영체제", "자료구조및실습", "객체지향프로그래밍"],
      y3: ["게임그래픽스", "시스템프로그래밍", "알고리즘및실습", "영상처리프로그래밍"],
      y4: ["소프트웨어공학", "인공지능", "프롬프트엔지니어링", "캡스톤설계", "기업협력형캡스톤설계"]
    }
  }
};

function makeJobQueryFromCluster(clusterId) {
  const info = clusterInfo[clusterId];
  if (!info || !info.roles) return "";
  
  // 직무명을 하나의 문장으로 합침
  return info.roles.join(" ");
}


/* ===============================
   2. DOM
================================ */
const typeName = document.getElementById("typeName");
const typeDesc = document.getElementById("typeDesc");
const typeBadge = document.getElementById("typeBadge");
const typeBadgeText = document.getElementById("typeBadgeText");

const clusterChip = document.getElementById("clusterChip");
const similarityChip = document.getElementById("similarityChip");
const trackResult = document.getElementById("trackResult");

const radarSvg = document.getElementById("radarSvg");
const scoreMini = document.getElementById("scoreMini");

const clusterDesc = document.getElementById("clusterDesc");
const roleChips = document.getElementById("roleChips");
const curriculumGrid = document.getElementById("curriculumGrid");
const jobList = document.getElementById("jobList");

/* ===============================
   3. 유틸
================================ */
function pickTopType(sums) {
  const entries = Object.entries(sums);
  const max = Math.max(...entries.map((e) => e[1]));
  const tops = entries.filter((e) => e[1] === max).map((e) => e[0]);
  return { max, tops };
}

function safeText(el, text) {
  if (!el) return;
  el.textContent = text;
}

function clear(el) {
  if (el) el.innerHTML = "";
}

/* ===============================
   4. 레이더(마름모) 차트 렌더
   - 4축: top=Logic, right=Creative, bottom=Stability, left=Analysis
================================ */
function renderRadar(sums) {
  if (!radarSvg) return;

  const maxScore = 15;
  const w = 320;
  const h = 320;
  const cx = w / 2;
  const cy = h / 2;
  const r = 115;

  // 정규화
  const vLogic = (sums.logic ?? 0) / maxScore;
  const vCreative = (sums.creative ?? 0) / maxScore;
  const vStability = (sums.stability ?? 0) / maxScore;
  const vAnalysis = (sums.analysis ?? 0) / maxScore;

  // 축 점(다이아몬드)
  const axes = {
    logic: { x: cx, y: cy - r, v: vLogic, label: "Logic" },
    creative: { x: cx + r, y: cy, v: vCreative, label: "Creative" },
    stability: { x: cx, y: cy + r, v: vStability, label: "Stability" },
    analysis: { x: cx - r, y: cy, v: vAnalysis, label: "Analysis" }
  };

  // 데이터 폴리곤 점
  const dataPts = [
    { x: cx, y: cy - r * axes.logic.v },
    { x: cx + r * axes.creative.v, y: cy },
    { x: cx, y: cy + r * axes.stability.v },
    { x: cx - r * axes.analysis.v, y: cy }
  ];

  // SVG 초기화
  radarSvg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  radarSvg.innerHTML = "";

  const ns = "http://www.w3.org/2000/svg";

  // defs (그라데이션/그림자)
  const defs = document.createElementNS(ns, "defs");

  const grad = document.createElementNS(ns, "linearGradient");
  grad.setAttribute("id", "radarGrad");
  grad.setAttribute("x1", "0");
  grad.setAttribute("y1", "0");
  grad.setAttribute("x2", "1");
  grad.setAttribute("y2", "1");

  const s1 = document.createElementNS(ns, "stop");
  s1.setAttribute("offset", "0%");
  s1.setAttribute("stop-color", "#2563eb");
  s1.setAttribute("stop-opacity", "0.30");

  const s2 = document.createElementNS(ns, "stop");
  s2.setAttribute("offset", "100%");
  s2.setAttribute("stop-color", "#a78bfa");
  s2.setAttribute("stop-opacity", "0.20");

  grad.appendChild(s1);
  grad.appendChild(s2);

  const filter = document.createElementNS(ns, "filter");
  filter.setAttribute("id", "softShadow");
  filter.setAttribute("x", "-20%");
  filter.setAttribute("y", "-20%");
  filter.setAttribute("width", "140%");
  filter.setAttribute("height", "140%");

  const feDrop = document.createElementNS(ns, "feDropShadow");
  feDrop.setAttribute("dx", "0");
  feDrop.setAttribute("dy", "10");
  feDrop.setAttribute("stdDeviation", "10");
  feDrop.setAttribute("flood-color", "#0f172a");
  feDrop.setAttribute("flood-opacity", "0.18");
  filter.appendChild(feDrop);

  defs.appendChild(grad);
  defs.appendChild(filter);
  radarSvg.appendChild(defs);

  // 배경 그리드(5단)
  const levels = [0.2, 0.4, 0.6, 0.8, 1];
  levels.forEach((lv) => {
    const p = [
      `${cx},${cy - r * lv}`,
      `${cx + r * lv},${cy}`,
      `${cx},${cy + r * lv}`,
      `${cx - r * lv},${cy}`
    ].join(" ");

    const poly = document.createElementNS(ns, "polygon");
    poly.setAttribute("points", p);
    poly.setAttribute("fill", "none");
    poly.setAttribute("stroke", "rgba(15,23,42,0.12)");
    poly.setAttribute("stroke-width", "1");
    radarSvg.appendChild(poly);
  });

  // 축 라인
  Object.values(axes).forEach((a) => {
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", String(cx));
    line.setAttribute("y1", String(cy));
    line.setAttribute("x2", String(a.x));
    line.setAttribute("y2", String(a.y));
    line.setAttribute("stroke", "rgba(15,23,42,0.14)");
    line.setAttribute("stroke-width", "1");
    radarSvg.appendChild(line);
  });

  // 데이터 폴리곤
  const dataPoly = document.createElementNS(ns, "polygon");
  dataPoly.setAttribute(
    "points",
    dataPts.map((p) => `${p.x},${p.y}`).join(" ")
  );
  dataPoly.setAttribute("fill", "url(#radarGrad)");
  dataPoly.setAttribute("stroke", "#2563eb");
  dataPoly.setAttribute("stroke-width", "2");
  dataPoly.setAttribute("filter", "url(#softShadow)");
  radarSvg.appendChild(dataPoly);

  // 꼭짓점 점
  dataPts.forEach((p) => {
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", String(p.x));
    c.setAttribute("cy", String(p.y));
    c.setAttribute("r", "4");
    c.setAttribute("fill", "#2563eb");
    c.setAttribute("stroke", "white");
    c.setAttribute("stroke-width", "2");
    radarSvg.appendChild(c);
  });

  // 라벨
  const labelStyle = {
    fill: "#0f172a",
    "font-size": "12",
    "font-weight": "800"
  };

  const labelPositions = [
    { key: "logic", x: cx, y: cy - r - 16, anchor: "middle" },
    { key: "creative", x: cx + r + 16, y: cy + 4, anchor: "start" },
    { key: "stability", x: cx, y: cy + r + 22, anchor: "middle" },
    { key: "analysis", x: cx - r - 16, y: cy + 4, anchor: "end" }
  ];

  labelPositions.forEach((p) => {
    const t = document.createElementNS(ns, "text");
    t.textContent = axes[p.key].label;
    t.setAttribute("x", String(p.x));
    t.setAttribute("y", String(p.y));
    t.setAttribute("text-anchor", p.anchor);
    Object.entries(labelStyle).forEach(([k, v]) => t.setAttribute(k, v));
    radarSvg.appendChild(t);
  });
}

/* ===============================
   5. 점수 미니 카드
================================ */
function renderScoreMini(sums) {
  if (!scoreMini) return;

  const maxScore = 15;
  const ordered = ["logic", "creative", "analysis", "stability"];

  scoreMini.innerHTML = `
    <div class="scoreMiniTitle">세부 점수</div>
    <div class="scoreMiniGrid">
      ${ordered
        .map((key) => {
          const t = types[key];
          const val = sums[key] ?? 0;
          return `
            <div class="scoreMiniItem">
              <div class="scoreMiniLeft">
                <span class="swatch" style="background:${t.color}"></span>
                <div>
                  <div class="scoreMiniName">${t.label}</div>
                  <div class="small">${t.subtitle}</div>
                </div>
              </div>
              <div class="scoreMiniRight">${val} / ${maxScore}</div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

/* ===============================
   6. 직무 목록 렌더
================================ */
function renderRoles(clusterId) {
  const c = clusterInfo[clusterId];
  if (!c) {
    safeText(clusterDesc, "클러스터 정보를 불러오지 못했어.");
    clear(roleChips);
    return;
  }

  safeText(clusterDesc, `Cluster ${clusterId} · ${c.title} — ${c.desc}`);
  clear(roleChips);

  c.roles.forEach((role) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = role;
    roleChips.appendChild(chip);
  });
}

/* ===============================
   7. 커리큘럼 렌더
================================ */
function renderCurriculum(clusterId) {
  const c = clusterInfo[clusterId];
  if (!c || !c.curriculum) {
    curriculumGrid.innerHTML = `<div class="small">커리큘럼 정보를 불러오지 못했어.</div>`;
    return;
  }

  const mkYearCol = (yearLabel, list) => {
    const col = document.createElement("div");
    col.className = "yearCol";
    col.innerHTML = `
      <div class="yearHead">${yearLabel}</div>
      <div class="courseList">
        ${list.map((x) => `<div class="courseBox">${x}</div>`).join("")}
      </div>
    `;
    return col;
  };

  curriculumGrid.innerHTML = "";
  curriculumGrid.appendChild(mkYearCol("2학년", c.curriculum.y2 || []));
  curriculumGrid.appendChild(mkYearCol("3학년", c.curriculum.y3 || []));
  curriculumGrid.appendChild(mkYearCol("4학년", c.curriculum.y4 || []));
}

/* ===============================
   8. FastAPI AI 추천 결과 요청
================================ */
async function fetchAiRecommendation() {
  const res = await fetch(`${API_BASE}/recommend`, { // 🔧
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scores)
  });

  if (!res.ok) throw new Error("AI 서버 응답 실패");
  return res.json();
}

async function fetchJobs(queryText) {
  const q = encodeURIComponent(queryText || "");
  const res = await fetch(`http://127.0.0.1:8000/jobs?query=${q}`);
  if (!res.ok) throw new Error();
  return res.json();
}


function renderJobs(jobs) {
  if (!jobList) return;
  jobList.innerHTML = "";
  if (!jobs || jobs.length === 0) {
    jobList.innerHTML = `<div class="small">추천할 채용 정보가 없습니다.</div>`;
    return;
  }
  jobs.slice(0, 5).forEach((job) => {
    const item = document.createElement("div");
    item.className = "jobItem";
    item.innerHTML = `
      <div class="jobTitle">${job.job_title}</div>
      <div class="jobMeta small">${job.company} · ${job.region}</div>
      <a href="${job.url}" target="_blank" class="jobLink">채용 공고 보기 →</a>
    `;
    jobList.appendChild(item);
  });
}


function applyAiResult(data) {
  const clusterId = Number(data.cluster_id);
  const raw = Number(data.similarity ?? data.similarity_raw);

  let similarity = raw;
  if (Number.isFinite(raw) && (raw < 0 || raw > 1)) {
    similarity = Math.max(0, Math.min(1, (raw + 1) / 2));
  }

  const percent = Number.isFinite(similarity) ? (similarity * 100).toFixed(1) : "-";

  safeText(trackResult, `AI 추천 개발 트랙: ${data.track_name ?? "-"}`);
  safeText(clusterChip, `선택된 직무 클러스터: Cluster ${clusterId}`);

  let levelText = "-";
  if (Number.isFinite(similarity)) {
    if (similarity >= 0.6) levelText = `매우 잘 맞아요 👍 (${percent}%)`;
    else if (similarity >= 0.4) levelText = `꽤 잘 어울려요 🙂 (${percent}%)`;
    else levelText = `도전해볼 수 있어요 💡 (${percent}%)`;
  }
  safeText(similarityChip, `유사도: ${levelText}`);

  if (Number.isFinite(clusterId)) {
    renderRoles(clusterId);
    renderCurriculum(clusterId);
    if (jobList) jobList.innerHTML = `<div class="small">채용 정보를 불러오는 중...</div>`;
const queryText = makeJobQueryFromCluster(clusterId);

fetchJobs(queryText)
  .then(renderJobs)
  .catch(() => {
    if (jobList)
      jobList.innerHTML = `<div class="small">채용 정보를 불러오지 못했어요.</div>`;
  });

  }
}

/* ===============================
   9. main
================================ */
function main() {
  if (!scores) {
    alert("결과 데이터가 없습니다.");
    location.href = "./questions.html";
    return;
  }

  const { tops } = pickTopType(scores);
  const winnerKey = tops[0];
  const winner = types[winnerKey];

  typeName.textContent = `${winner.label} 성향`;
  typeDesc.textContent = winner.desc;

  typeBadge.querySelector("i").style.background = winner.color;
  typeBadgeText.textContent = `${winner.label} · ${winner.subtitle}`;

  renderRadar(scores);
  renderScoreMini(scores);

  safeText(trackResult, "AI 추천 결과를 불러오는 중...");
  safeText(clusterChip, "선택된 직무 클러스터: -");
  safeText(similarityChip, "유사도: -");
  safeText(clusterDesc, "AI 추천 결과가 오면, 해당 클러스터의 직무 목록을 보여줄게.");

  fetchAiRecommendation()
    .then((data) => {
      console.log("🔥 FastAPI 결과:", data);
      applyAiResult(data);
    })
    .catch(() => {
      safeText(trackResult, "AI 추천 결과를 불러오지 못했어.");
    });
}

main();