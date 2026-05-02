// ─── GATE Prep ML · app.js ────────────────────────────────────────────────

const state = {
  selectedSubjects: [],
  currentSubjectIdx: 0,
  currentQIdx: 0,
  answers: {},
  subjectScores: {},
  topicScores: {},
  timeSpent: {},
  testStarted: false,
  testComplete: false,
  selectedOpt: null,
  showFeedback: false,
  qStartTime: null,
  recsGenerated: false,
  recsData: [],
  mlResult: null,
};

let timerInt = null;

function $(id) { return document.getElementById(id); }

function switchTab(tab) {
  ['setup','test','analysis','recs'].forEach(t => { $('page-'+t).style.display = 'none'; });
  $('page-'+tab).style.display = 'block';
  if (tab === 'setup')    renderSetup();
  if (tab === 'test')     renderTest();
  if (tab === 'analysis') renderAnalysis();
  if (tab === 'recs')     renderRecs();
}

function enableTab(tab) { const b = $('tab-'+tab); if (b) b.disabled = false; }

function setActiveTab(tab) {
  ['setup','test','analysis','recs'].forEach(t => {
    const b = $('tab-'+t); if (b) b.classList.toggle('active', t === tab);
  });
}

function chip(label, cls) { return `<span class="chip chip-${cls}">${label}</span>`; }
function diffChip(d) { return chip(d.charAt(0).toUpperCase()+d.slice(1), {easy:'green',medium:'amber',hard:'red'}[d]||'gray'); }

function getOverallStats() {
  let answered = 0, correct = 0;
  Object.values(state.answers).forEach(a => { answered++; if (a.correct) correct++; });
  return { answered, correct };
}

function computeScores() {
  state.selectedSubjects.forEach(sid => {
    const qs = QUESTIONS[sid] || [];
    let correct = 0;
    const topicMap = {};
    qs.forEach((q, i) => {
      const a = state.answers[`${sid}_${i}`];
      if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
      topicMap[q.topic].total++;
      if (a && a.correct) { correct++; topicMap[q.topic].correct++; }
    });
    state.subjectScores[sid] = { correct, total: qs.length, pct: Math.round(correct / qs.length * 100) };
    state.topicScores[sid]   = topicMap;
  });
  state.mlResult = ML.runFullAnalysis(
    state.answers, state.subjectScores, state.topicScores,
    state.timeSpent, state.selectedSubjects
  );
}

// ── Setup ──────────────────────────────────────────────────────────────────
function renderSetup() {
  setActiveTab('setup');
  const n = state.selectedSubjects.length;
  const valid = n >= 4 && n <= 6;
  $('page-setup').innerHTML = `
    <div class="section-title">Select Your Subjects</div>
    <div class="section-sub">Choose 4–6 GATE CS subjects. ML algorithms (logistic regression, k-means, retention decay) will analyse your performance.</div>
    <div class="subject-grid" id="subject-grid"></div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <button class="btn btn-primary" onclick="startTest()" ${!valid?'disabled':''}>Start Mock Test →</button>
      <span style="font-size:13px;color:var(--text2);">${n} selected (need 4–6)</span>
      ${state.testComplete ? `<button class="btn btn-sm" onclick="resetAll()" style="margin-left:auto;">🔄 Reset</button>` : ''}
    </div>
    ${state.testComplete ? `
      <div style="margin-top:1rem;padding:1rem;background:var(--surface2);border-radius:var(--radius-sm);font-size:13px;color:var(--text2);">
        ✅ Test complete. View <a href="#" onclick="switchTab('analysis');return false;" style="color:var(--blue);">ML Analysis</a> or <a href="#" onclick="switchTab('recs');return false;" style="color:var(--blue);">Recommendations</a>.
      </div>` : ''}`;
  const grid = $('subject-grid');
  SUBJECTS.forEach(s => {
    const div = document.createElement('div');
    div.className = 'subject-card' + (state.selectedSubjects.includes(s.id) ? ' selected' : '');
    div.innerHTML = `<div class="s-icon">${s.icon}</div><div class="s-name">${s.name}</div><div class="s-desc">${s.desc}</div>`;
    div.onclick = () => {
      const idx = state.selectedSubjects.indexOf(s.id);
      if (idx >= 0) state.selectedSubjects.splice(idx, 1);
      else if (state.selectedSubjects.length < 6) state.selectedSubjects.push(s.id);
      renderSetup();
    };
    grid.appendChild(div);
  });
}

// ── Test ───────────────────────────────────────────────────────────────────
function startTest() {
  if (state.selectedSubjects.length < 4) return;
  Object.assign(state, {
    currentSubjectIdx:0, currentQIdx:0, answers:{}, subjectScores:{}, topicScores:{}, timeSpent:{},
    testComplete:false, recsGenerated:false, recsData:[], mlResult:null,
    selectedOpt:null, showFeedback:false, qStartTime:null, testStarted:true,
  });
  enableTab('test'); switchTab('test');
}

function renderTest() {
  setActiveTab('test');
  const el = $('page-test');
  if (!state.testStarted) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div>Set up your test on the Setup tab first.</div>`; return;
  }
  if (state.testComplete) {
    const s = getOverallStats();
    el.innerHTML = `
      <div class="complete-banner">
        <div class="complete-title">🎉 Test Complete!</div>
        <div class="complete-sub">You answered ${s.answered} questions across ${state.selectedSubjects.length} subjects.</div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="switchTab('analysis')">View ML Analysis →</button>
        <button class="btn" onclick="switchTab('recs')">Get Recommendations →</button>
      </div>`; return;
  }
  const sid  = state.selectedSubjects[state.currentSubjectIdx];
  const subj = SUBJECTS.find(s => s.id === sid);
  const qs   = QUESTIONS[sid] || [];
  const q    = qs[state.currentQIdx];
  if (!q) { advanceSubject(); return; }
  const totalQ = state.selectedSubjects.reduce((a,s) => a + (QUESTIONS[s]||[]).length, 0);
  const doneQ  = state.selectedSubjects.slice(0, state.currentSubjectIdx).reduce((a,s) => a + (QUESTIONS[s]||[]).length, 0) + state.currentQIdx;
  const pct    = Math.round(doneQ / totalQ * 100);
  if (!state.qStartTime) state.qStartTime = Date.now();
  el.innerHTML = `
    <div class="progress-row"><span>Question ${doneQ+1} of ${totalQ}</span><span>${pct}% complete</span></div>
    <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
    <div class="card">
      <div class="q-header">
        <span class="subject-tag">${subj.icon} ${subj.name}</span>
        <div style="display:flex;gap:8px;align-items:center;"><span class="timer-chip" id="timer-chip">0s</span>${diffChip(q.diff)}</div>
      </div>
      <div class="q-text">${q.q}</div>
      <div class="options">${q.opts.map((o,i) => `
        <button class="opt" id="opt-${i}" onclick="selectOpt(${i})" ${state.showFeedback?'disabled':''}>
          <strong>${String.fromCharCode(65+i)}.</strong> ${o}
        </button>`).join('')}</div>
      ${state.showFeedback ? `<div class="feedback ${state.selectedOpt===q.ans?'correct':'wrong'}">
        <strong>${state.selectedOpt===q.ans?'✓ Correct!':'✗ Incorrect'}</strong> ${q.exp}</div>` : ''}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
      <span style="font-size:12px;color:var(--text2);">Subject ${state.currentSubjectIdx+1}/${state.selectedSubjects.length} · ${q.topic}</span>
      ${state.showFeedback ? `<button class="btn btn-primary" onclick="nextQuestion()">Next →</button>` : `<button class="btn" onclick="skipQ()">Skip →</button>`}
    </div>`;
  if (state.showFeedback) {
    q.opts.forEach((_,i) => {
      const b = $(`opt-${i}`);
      if (i===q.ans) b.classList.add('correct'); else if (i===state.selectedOpt) b.classList.add('wrong');
    });
  }
  startTimer();
}

function startTimer() {
  clearInterval(timerInt);
  timerInt = setInterval(() => {
    const sec = Math.floor((Date.now() - (state.qStartTime||Date.now())) / 1000);
    const el  = $('timer-chip');
    if (!el) { clearInterval(timerInt); return; }
    el.textContent = sec < 60 ? `${sec}s` : `${Math.floor(sec/60)}m ${sec%60}s`;
    el.className   = 'timer-chip' + (sec > 90 ? ' warn' : '');
  }, 1000);
}

function selectOpt(idx) {
  if (state.showFeedback) return;
  clearInterval(timerInt);
  state.selectedOpt = idx; state.showFeedback = true;
  const sid = state.selectedSubjects[state.currentSubjectIdx];
  const q   = QUESTIONS[sid][state.currentQIdx];
  const ms  = Date.now() - (state.qStartTime||Date.now());
  state.answers[`${sid}_${state.currentQIdx}`] = { correct: idx===q.ans, topic: q.topic, diff: q.diff, time: ms };
  if (!state.timeSpent[sid]) state.timeSpent[sid] = 0;
  state.timeSpent[sid] += ms;
  renderTest();
}

function skipQ() {
  const sid = state.selectedSubjects[state.currentSubjectIdx];
  const q   = QUESTIONS[sid][state.currentQIdx];
  state.answers[`${sid}_${state.currentQIdx}`] = { correct:false, topic:q.topic, diff:q.diff, time:0, skipped:true };
  advanceQuestion();
}
function nextQuestion() { clearInterval(timerInt); state.showFeedback=false; state.selectedOpt=null; state.qStartTime=null; advanceQuestion(); }
function advanceQuestion() {
  state.currentQIdx++;
  const sid = state.selectedSubjects[state.currentSubjectIdx];
  if (state.currentQIdx >= (QUESTIONS[sid]||[]).length) advanceSubject(); else renderTest();
}
function advanceSubject() {
  state.currentSubjectIdx++; state.currentQIdx=0; state.qStartTime=null;
  if (state.currentSubjectIdx >= state.selectedSubjects.length) {
    state.testComplete = true; computeScores(); enableTab('analysis'); enableTab('recs'); renderTest();
  } else renderTest();
}

// ── ML Analysis Dashboard ──────────────────────────────────────────────────
function renderAnalysis() {
  setActiveTab('analysis');
  const el = $('page-analysis');
  if (!state.testComplete) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div>Complete the mock test to see ML analysis.</div>`; return;
  }

  const ml  = state.mlResult;
  const rb  = ml.rankBand;
  const lp  = ml.learnerProfile;
  const cls = ml.accuracy>=70?'good':ml.accuracy>=45?'warn':'bad';

  const allTopics = [];
  state.selectedSubjects.forEach(sid => {
    Object.entries(state.topicScores[sid]||{}).forEach(([topic,d]) => {
      const key = `${sid}::${topic}`;
      const wt  = ml.topicWeighted[key]||{};
      allTopics.push({ topic, sid, raw:Math.round(d.correct/d.total*100), weighted:wt.weighted??Math.round(d.correct/d.total*100), ...d });
    });
  });
  allTopics.sort((a,b) => a.weighted - b.weighted);

  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:10px;">
      <div class="section-title" style="margin:0;">ML Performance Analysis</div>
      <button class="btn btn-sm" onclick="switchTab('recs')">Get Recommendations →</button>
    </div>

    <!-- Hero grid -->
    <div class="ml-hero-grid">
      <div class="ml-hero-card">
        <div class="ml-hero-label">Overall Accuracy</div>
        <div class="score-circle ${cls}" style="width:86px;height:86px;margin:0.5rem auto;">
          <span class="score-num" style="font-size:20px;">${ml.accuracy}%</span>
          <span class="score-lbl">${getOverallStats().correct}/${getOverallStats().answered}</span>
        </div>
      </div>
      <div class="ml-hero-card" style="border-color:${rb.color}30;background:${rb.color}08;">
        <div class="ml-hero-label">Predicted GATE Score <span style="font-size:10px;opacity:.7;">(Linear Regression)</span></div>
        <div style="font-size:34px;font-weight:700;color:${rb.color};margin:4px 0;">${ml.gateScore}<span style="font-size:13px;color:var(--text2);">/100</span></div>
        <div class="chip" style="background:${rb.color}18;color:${rb.color};font-size:11px;margin-bottom:4px;">${rb.band}</div>
        <div style="font-size:11px;color:var(--text2);">${rb.qualifier}</div>
      </div>
      <div class="ml-hero-card" style="border-color:#3C348930;background:#3C348908;">
        <div class="ml-hero-label">Pass Probability <span style="font-size:10px;opacity:.7;">(Logistic Regression)</span></div>
        <div style="font-size:34px;font-weight:700;color:#3C3489;margin:4px 0;">${ml.passProbability}%</div>
        <div style="font-size:11px;color:var(--text2);margin-bottom:6px;">P(score ≥ 60%)</div>
        <div style="height:6px;background:var(--surface2);border-radius:3px;overflow:hidden;">
          <div style="width:${ml.passProbability}%;height:100%;background:#3C3489;border-radius:3px;transition:width 0.6s;"></div>
        </div>
      </div>
      <div class="ml-hero-card" style="border-color:${lp.color}30;background:${lp.color}08;">
        <div class="ml-hero-label">Learner Profile <span style="font-size:10px;opacity:.7;">(K-Means)</span></div>
        <div style="font-size:28px;margin:4px 0;">${lp.icon}</div>
        <div style="font-size:13px;font-weight:600;color:${lp.color};">${lp.name}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:3px;line-height:1.4;">${lp.desc}</div>
      </div>
    </div>

    <!-- Feature Vector -->
    <div class="card" style="margin-top:1rem;">
      <div style="font-size:13px;font-weight:600;margin-bottom:0.75rem;">
        📐 ML Feature Vector
        <span style="font-size:11px;color:var(--text2);font-weight:400;"> — inputs fed into logistic regression model</span>
      </div>
      <div class="feature-grid" id="feature-grid"></div>
    </div>

    <hr>
    <div style="font-size:14px;font-weight:600;margin-bottom:4px;">Subject Performance & Study Impact</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:0.75rem;">Impact score = expected mark gain from improving each subject, weighted by GATE syllabus importance.</div>
    <div id="subject-bars"></div>

    <hr>
    <div style="font-size:14px;font-weight:600;margin-bottom:4px;">
      Weighted Topic Mastery
      <span style="font-size:11px;color:var(--text2);font-weight:400;"> — weighted scoring penalises easy misses more than hard misses</span>
    </div>
    <div id="topic-skills" style="margin-bottom:1rem;"></div>

    <hr>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;" id="diff-cluster-grid"></div>

    <hr>
    <div style="font-size:14px;font-weight:600;margin-bottom:4px;">
      Retention Forecast
      <span style="font-size:11px;color:var(--text2);font-weight:400;"> — Ebbinghaus forgetting curve model</span>
    </div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:0.75rem;">Estimated score retention without further practice sessions.</div>
    <div class="retention-row" id="retention-row"></div>

    <hr>
    <button class="btn btn-primary" onclick="switchTab('recs')">Get Personalised Recommendations →</button>`;

  // Feature grid
  const fg = $('feature-grid');
  [
    ['Overall Accuracy', ml.accuracy, '%'],
    ['Easy Q Accuracy',  ml.easyAcc,  '%'],
    ['Medium Q Accuracy',ml.medAcc,   '%'],
    ['Hard Q Accuracy',  ml.hardAcc,  '%'],
    ['Speed Score',      ml.speedScore,'%'],
    ['Consistency',      ml.consistencyScore,'%'],
  ].forEach(([lbl, val, unit]) => {
    const color = val>=70?'var(--green-mid)':val>=40?'var(--amber-mid)':'#D85A30';
    const div = document.createElement('div');
    div.className = 'feature-item';
    div.innerHTML = `
      <div class="feature-label">${lbl}</div>
      <div class="feature-val" style="color:${color};">${val}${unit}</div>
      <div class="feature-bar-track">
        <div class="feature-bar-fill" style="width:${val}%;background:${color};"></div>
      </div>`;
    fg.appendChild(div);
  });

  // Subject bars
  const sbEl = $('subject-bars');
  ml.subjectPriority.forEach(sp => {
    const subj  = SUBJECTS.find(s=>s.id===sp.sid);
    const sc    = state.subjectScores[sp.sid];
    const color = sc.pct>=70?'var(--green-mid)':sc.pct>=45?'var(--amber-mid)':'#D85A30';
    const impBg = sp.impact>8?'#FAECE7':sp.impact>4?'#FAEEDA':'#EAF3DE';
    const impFg = sp.impact>8?'#993C1D':sp.impact>4?'#854F0B':'#3B6D11';
    sbEl.innerHTML += `
      <div class="bar-row">
        <div class="bar-label" title="${subj.name}">${subj.icon} ${subj.name.split(' ').slice(0,2).join(' ')}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${sc.pct}%;background:${color};">
            ${sc.pct>18?`<span>${sc.correct}/${sc.total}</span>`:''}
          </div>
        </div>
        <div class="bar-pct">${sc.pct}%</div>
        <div title="Expected mark gain" style="font-size:11px;background:${impBg};color:${impFg};padding:2px 7px;border-radius:12px;flex-shrink:0;white-space:nowrap;">+${sp.impact}pts</div>
      </div>`;
  });

  // Topic skills
  const tsEl = $('topic-skills');
  allTopics.forEach(t => {
    const subj  = SUBJECTS.find(s=>s.id===t.sid);
    const color = t.weighted>=70?'var(--green-mid)':t.weighted>=40?'var(--amber-mid)':'#D85A30';
    const delta = t.weighted - t.raw;
    const dStr  = delta!==0 ? `<span style="font-size:10px;color:${delta>0?'var(--green-mid)':'#D85A30'};margin-left:3px;">${delta>0?'+':''}${delta}</span>` : '';
    tsEl.innerHTML += `
      <div class="skill-row">
        <div class="skill-name">${t.topic} <span style="color:var(--text3);font-size:10px;">(${subj.name.split(' ')[0]})</span></div>
        <div class="skill-track"><div class="skill-fill" style="width:${t.weighted}%;background:${color};"></div></div>
        <div class="skill-pct">${t.weighted}%${dStr}</div>
      </div>`;
  });

  // Difficulty + cluster
  const diff = {easy:{c:0,t:0},medium:{c:0,t:0},hard:{c:0,t:0}};
  Object.values(state.answers).forEach(a => { const d=diff[a.diff]||diff.easy; d.t++; if(a.correct)d.c++; });
  const dcEl = $('diff-cluster-grid');
  dcEl.innerHTML = `
    <div class="card" style="margin:0;">
      <div style="font-size:13px;font-weight:600;margin-bottom:0.75rem;">Difficulty Breakdown</div>
      ${['easy','medium','hard'].map(d => {
        const {c,t} = diff[d]; const p = t?Math.round(c/t*100):0;
        const cols  = {easy:['#EAF3DE','#97C459','#3B6D11'],medium:['#FAEEDA','#FAC775','#854F0B'],hard:['#FAECE7','#F0997B','#993C1D']}[d];
        return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span style="font-size:12px;width:54px;color:var(--text2);">${d.charAt(0).toUpperCase()+d.slice(1)}</span>
          <div style="flex:1;height:16px;background:var(--surface2);border-radius:3px;overflow:hidden;">
            <div style="width:${p}%;height:100%;background:${cols[1]};border-radius:3px;transition:width 0.5s;"></div>
          </div>
          <span style="font-size:12px;color:${cols[2]};width:50px;text-align:right;font-weight:500;">${p}% (${c}/${t})</span>
        </div>`;
      }).join('')}
    </div>
    <div class="card" style="margin:0;border-color:${lp.color}30;">
      <div style="font-size:13px;font-weight:600;margin-bottom:0.75rem;">K-Means Learner Clusters</div>
      ${ML.CLUSTER_CENTROIDS.map(c => {
        const isMe = c.id === lp.id;
        return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;margin-bottom:4px;
          background:${isMe?c.color+'14':'transparent'};border:1px solid ${isMe?c.color+'40':'transparent'};">
          <span style="font-size:16px;">${c.icon}</span>
          <div style="flex:1;font-size:12px;font-weight:${isMe?600:400};color:${isMe?c.color:'var(--text2)'};">${c.name}</div>
          ${isMe?`<span style="font-size:10px;background:${c.color};color:#fff;padding:2px 7px;border-radius:10px;">You</span>`:''}
        </div>`;
      }).join('')}
    </div>`;

  // Retention
  const retEl = $('retention-row');
  ml.retentionForecasts.forEach(r => {
    const color = r.retention>=70?'var(--green-mid)':r.retention>=50?'var(--amber-mid)':'#D85A30';
    retEl.innerHTML += `
      <div class="retention-cell">
        <div class="retention-val" style="color:${color};">${r.retention}%</div>
        <div class="retention-days">Day ${r.days}</div>
        <div class="retention-bar-track">
          <div style="width:${r.retention}%;height:100%;background:${color};border-radius:2px;transition:width 0.5s;"></div>
        </div>
      </div>`;
  });
}

// ── Recommendations ────────────────────────────────────────────────────────
function renderRecs() {
  setActiveTab('recs');
  const el = $('page-recs');
  if (!state.testComplete) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">💡</div>Complete the mock test first.</div>`; return;
  }
  if (state.recsGenerated) { renderRecsContent(); return; }
  el.innerHTML = `<div class="loading">🤖 Generating AI recommendations…</div>`;
  generateRecommendations();
}

async function generateRecommendations() {
  const ml  = state.mlResult;
  const allTopics = [];
  state.selectedSubjects.forEach(sid => {
    Object.entries(state.topicScores[sid]||{}).forEach(([topic,d]) => {
      allTopics.push({ topic, sid, pct:Math.round(d.correct/d.total*100) });
    });
  });
  allTopics.sort((a,b) => a.pct - b.pct);

  const subjectSummary = state.selectedSubjects.map(sid => {
    const subj = SUBJECTS.find(s=>s.id===sid);
    const sc   = state.subjectScores[sid];
    return `${subj.name}: ${sc.pct}% (${sc.correct}/${sc.total})`;
  }).join('\n');

  const topicSummary = allTopics.map(t => {
    const subj = SUBJECTS.find(s=>s.id===t.sid);
    return `${t.topic} (${subj.name}): ${t.pct}%`;
  }).join('\n');

  const prompt = `You are a GATE CS expert. ML analysis of this student shows:
- Overall: ${ml.accuracy}%, predicted GATE score: ${ml.gateScore}/100
- Pass probability: ${ml.passProbability}%
- Learner profile: ${ml.learnerProfile.name} — ${ml.learnerProfile.desc}
- Consistency: ${ml.consistencyScore}%, Hard accuracy: ${ml.hardAcc}%

SUBJECT SCORES:\n${subjectSummary}
TOPIC ACCURACY:\n${topicSummary}

Generate exactly 6 practice recommendations as a JSON array. Each object:
- topic (string)
- subject (string)
- subjectId (one of: ${state.selectedSubjects.join(', ')})
- priority: "high"|"medium"|"low"
- difficulty: "easy"|"medium"|"hard"
- why: 1-2 sentences referencing their ML scores
- practiceType: specific method (e.g. "Trace algorithm on paper", "Solve 10 GATE PYQs", "Prove theorem from scratch")
- estimatedTime: e.g. "2-3 hours"
- sampleQuestion: one concrete, specific GATE-style question on this topic

Return ONLY the raw JSON array.`;

  try {
    const res  = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1800, messages:[{role:'user',content:prompt}] }),
    });
    const data = await res.json();
    state.recsData = JSON.parse(data.content.map(i=>i.text||'').join('').replace(/```json|```/g,'').trim());
  } catch(e) {
    state.recsData = fallbackRecs(allTopics);
  }
  state.recsGenerated = true;
  renderRecsContent();
}

function fallbackRecs(allTopics) {
  return allTopics.slice(0,6).map((t,i) => {
    const subj = SUBJECTS.find(s=>s.id===t.sid);
    return {
      topic:t.topic, subject:subj.name, subjectId:t.sid,
      priority:i<2?'high':i<4?'medium':'low',
      difficulty:i<2?'easy':i<4?'medium':'hard',
      why:`You scored ${t.pct}% on this topic. ML regression flagged it as a high-impact area for GATE score improvement.`,
      practiceType:'MCQ drill + concept review',
      estimatedTime:'2-3 hours',
      sampleQuestion:`Explain the core property of ${t.topic} in ${subj.name} and solve a GATE PYQ on this concept.`,
    };
  });
}

function renderRecsContent() {
  const ml  = state.mlResult;
  const el  = $('page-recs');
  const byP = {high:[],medium:[],low:[]};
  state.recsData.forEach(r => (byP[r.priority]||byP.low).push(r));

  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;flex-wrap:wrap;gap:8px;">
      <div class="section-title" style="margin:0;">Personalised Practice Plan</div>
      <div style="font-size:12px;color:var(--text2);">GATE: ${ml.gateScore}/100 · Pass P: ${ml.passProbability}%</div>
    </div>
    <div class="section-sub">Practice questions are generated inline — click <strong>Generate Practice Questions</strong> to get a mini quiz with full solutions right here, no redirects.</div>`;

  [['high','🔴 High Priority'],['medium','🟡 Medium Priority'],['low','🟢 Lower Priority']].forEach(([key,label]) => {
    const recs = byP[key]; if (!recs.length) return;
    html += `<div class="priority-label">${label}</div>`;
    recs.forEach((r,ri) => {
      const subj      = SUBJECTS.find(s=>s.id===r.subjectId)||{};
      const diffClass = {hard:'chip-red',medium:'chip-amber',easy:'chip-green'}[r.difficulty]||'chip-gray';
      html += `
        <div class="rec-card">
          <div class="rec-header">
            <div class="rec-topic">${subj.icon||''} ${r.topic}</div>
            ${chip(r.subject.split(' ').slice(0,2).join(' '),'blue')}
          </div>
          <div class="rec-why">${r.why}</div>
          ${r.sampleQuestion ? `
          <div class="sample-q-box">
            <div class="sample-q-label">💡 Sample Question</div>
            <div class="sample-q-text">${r.sampleQuestion}</div>
          </div>` : ''}
          <div class="rec-tags" style="margin-top:10px;">
            ${chip(r.difficulty,diffClass.replace('chip-',''))}
            ${chip(r.practiceType,'purple')}
            ${chip('⏱ '+r.estimatedTime,'gray')}
          </div>
          <div style="margin-top:12px;">
            <button class="btn btn-primary btn-sm"
              onclick="openPracticeModal('${r.topic.replace(/'/g,"\\'")}','${r.subject.replace(/'/g,"\\'")}','${r.difficulty}','${r.subjectId}')">
              🧠 Generate Practice Questions
            </button>
          </div>
        </div>`;
    });
  });

  html += `
    <hr>
    <div class="insight-box">
      <div class="insight-title">📌 ML Study Strategy for ${ml.learnerProfile.name}</div>
      <div class="insight-body">
        ${ml.learnerProfile.desc} Your Ebbinghaus model predicts ${ml.retentionForecasts[2].retention}% retention after 7 days without practice.
        The highest-impact subject improvement could yield approximately <strong>+${Math.round(ml.subjectPriority[0]?.impact||4)} marks</strong>.
        Aim for daily 45-min sessions on high-priority topics.
      </div>
    </div>
    <button class="btn btn-sm" onclick="switchTab('setup')">🔄 Take Another Mock Test</button>`;

  el.innerHTML = html;
  if (!$('practice-modal-root')) {
    const d = document.createElement('div'); d.id = 'practice-modal-root'; document.body.appendChild(d);
  }
}

// ── In-App Practice Modal ──────────────────────────────────────────────────
async function openPracticeModal(topic, subject, difficulty) {
  const root = $('practice-modal-root');
  root.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <div class="modal-title">🧠 Practice: ${topic}</div>
            <div class="modal-sub">${subject} · ${difficulty.charAt(0).toUpperCase()+difficulty.slice(1)}</div>
          </div>
          <button class="modal-close" onclick="closePracticeModal()">✕</button>
        </div>
        <div class="modal-body" id="modal-body">
          <div class="loading" style="padding:2rem;font-size:14px;">Generating 3 GATE-style questions with solutions…<br><span style="font-size:12px;opacity:.6;margin-top:4px;display:block;">This takes a few seconds</span></div>
        </div>
      </div>
    </div>`;
  $('modal-backdrop').addEventListener('click', e => { if (e.target===e.currentTarget) closePracticeModal(); });

  const prompt = `You are a GATE CS examiner. Generate exactly 3 GATE-style practice questions on "${topic}" in ${subject} at ${difficulty} difficulty level.

Return a JSON array of 3 objects, each with:
- question (string): specific, precise GATE-style question (may include a scenario or calculation)
- options (array of exactly 4 strings): answer choices labeled without A/B/C/D prefix
- correctIndex (number 0-3): index of correct answer
- solution (string): step-by-step solution in 3-5 sentences, showing working
- concept (string): core concept tested (brief phrase)

Return ONLY the raw JSON array, no markdown.`;

  try {
    const res  = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1600, messages:[{role:'user',content:prompt}] }),
    });
    const data = await res.json();
    const qs   = JSON.parse(data.content.map(i=>i.text||'').join('').replace(/```json|```/g,'').trim());
    renderPracticeQuestions(qs, topic);
  } catch(e) {
    renderPracticeQuestions(fallbackPracticeQuestions(topic, subject, difficulty), topic);
  }
}

function fallbackPracticeQuestions(topic, subject, difficulty) {
  return [
    {
      question: `Which statement correctly describes a key property of ${topic} in ${subject}?`,
      options: ['Foundational definition and its primary implication', 'An exception to the standard rule', 'A derived property only applicable in special cases', 'A property that holds only for infinite inputs'],
      correctIndex: 0,
      solution: `In ${subject}, ${topic} follows from its definition. The foundational property is what distinguishes this concept. Review the relevant chapter to confirm the theorem statement and its proof for GATE preparation.`,
      concept: `${topic} Fundamentals`,
    },
    {
      question: `For a ${difficulty}-level ${topic} problem: given standard constraints, which approach is most efficient?`,
      options: ['Brute-force enumeration', 'Exploit the mathematical structure', 'Convert to a known NP-hard problem', 'Use randomisation'],
      correctIndex: 1,
      solution: `At ${difficulty} level, the most efficient approach to ${topic} problems is to exploit the underlying mathematical or structural property. Brute force is too slow; the structured approach gives optimal complexity. Practise with GATE PYQs to master this.`,
      concept: `${topic} Algorithm Design`,
    },
    {
      question: `What is the best-case complexity for the standard ${topic} algorithm on a well-structured input?`,
      options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'],
      correctIndex: 1,
      solution: `Best-case complexity is achieved when the input has a special property that allows the algorithm to skip redundant work. For ${topic}, this leads to linear complexity in the best case. Derive this using recurrence relations or direct analysis.`,
      concept: `${topic} Complexity`,
    },
  ];
}

function renderPracticeQuestions(qs, topic) {
  const body = $('modal-body');
  if (!body) return;
  const quizState = qs.map(() => ({ selected: null, revealed: false }));

  function renderAll() {
    body.innerHTML = qs.map((q, qi) => {
      const s = quizState[qi];
      return `
        <div class="pq-card">
          <div class="pq-meta">
            <span class="pq-num">Q${qi+1}</span>
            ${q.concept ? `<span class="pq-concept">${q.concept}</span>` : ''}
          </div>
          <div class="pq-question">${q.question}</div>
          <div class="pq-options">
            ${q.options.map((o,oi) => {
              let cls = 'pq-opt';
              if (s.revealed) {
                if (oi===q.correctIndex) cls += ' pq-correct';
                else if (oi===s.selected) cls += ' pq-wrong';
                else cls += ' pq-dim';
              } else if (s.selected===oi) cls += ' pq-selected';
              return `<button class="${cls}" onclick="pqSelect(${qi},${oi})" ${s.revealed?'disabled':''}>
                <strong>${String.fromCharCode(65+oi)}.</strong> ${o}
              </button>`;
            }).join('')}
          </div>
          ${s.revealed ? `
            <div class="pq-solution ${s.selected===q.correctIndex?'pq-sol-correct':'pq-sol-wrong'}">
              <div style="font-weight:600;margin-bottom:6px;">${s.selected===q.correctIndex?'✓ Correct!':'✗ Incorrect — Correct answer: '+String.fromCharCode(65+q.correctIndex)}</div>
              <div>${q.solution}</div>
            </div>` : `
            <button class="btn btn-primary btn-sm" style="margin-top:10px;"
              onclick="pqReveal(${qi})" ${s.selected===null?'disabled':''}>Check Answer</button>`}
        </div>`;
    }).join('');

    const done = quizState.filter(s=>s.revealed).length;
    if (done === qs.length) {
      const correct = quizState.filter((s,i)=>s.selected===qs[i].correctIndex).length;
      const [bg,msg] = correct===qs.length
        ? ['var(--green-light)','🎉 Perfect score! Strong grasp of this topic.']
        : correct>=2
        ? ['var(--amber-light)','Good effort. Review the solutions above for the missed question.']
        : ['var(--red-light)','Keep practising. Re-read the solutions and try again tomorrow.'];
      body.innerHTML += `
        <div style="text-align:center;padding:1rem 1.5rem;background:${bg};border-radius:var(--radius-sm);margin-top:1rem;">
          <div style="font-size:18px;font-weight:600;margin-bottom:4px;">Score: ${correct} / ${qs.length}</div>
          <div style="font-size:13px;color:var(--text2);">${msg}</div>
        </div>`;
    }
  }

  window.pqSelect = (qi, oi) => { if (!quizState[qi].revealed) { quizState[qi].selected=oi; renderAll(); } };
  window.pqReveal = (qi)     => { quizState[qi].revealed=true; renderAll(); };
  renderAll();
}

function closePracticeModal() {
  const root = $('practice-modal-root');
  if (root) root.innerHTML = '';
}

// ── Reset ──────────────────────────────────────────────────────────────────
function resetAll() {
  Object.assign(state, {
    selectedSubjects:[], answers:{}, subjectScores:{}, topicScores:{}, timeSpent:{},
    testStarted:false, testComplete:false, recsGenerated:false, recsData:[],
    selectedOpt:null, showFeedback:false, qStartTime:null,
    currentSubjectIdx:0, currentQIdx:0, mlResult:null,
  });
  ['test','analysis','recs'].forEach(t => { $('tab-'+t).disabled = true; });
  switchTab('setup');
}

// ── Init ───────────────────────────────────────────────────────────────────
renderSetup();
