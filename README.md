# 🎯 GATE Prep ML

> An AI-powered GATE CS mock test and performance analyser with personalised practice recommendations — runs entirely in your browser, no build step needed.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Mock Tests** | 5 questions per subject across 8 GATE CS topics (40 questions total) |
| **Live Timer** | Per-question stopwatch with a warning highlight at 90 seconds |
| **Instant Feedback** | Correct/incorrect highlight with detailed explanation after every answer |
| **ML Analysis** | Logistic regression, linear regression, k-means clustering, weighted scoring & retention decay — all in the browser |
| **GATE Score Prediction** | Predicts your score out of 100 and maps it to a rank band (Top 100 → Top 50000+) |
| **AI Recommendations** | Claude-powered personalised practice plan via the Anthropic API |
| **In-App Practice** | Each recommendation card generates 3 fully explained GATE-style questions in a modal — no page reload |
| **User Accounts** | Register / login with local session storage; last 20 test results saved per user |

---

## 📚 Subjects Covered

| ID | Subject | Topics |
|---|---|---|
| `dsa` | 🌲 Data Structures & Algorithms | Sorting, Heaps, Priority Queue, Trees |
| `os` | 💻 Operating Systems | Scheduling, Deadlock, Memory Management |
| `dbms` | 🗄️ Database Management | SQL, Normalization, Transactions, Indexing |
| `cn` | 🌐 Computer Networks | OSI, TCP/IP, Routing, Error & Flow Control |
| `toc` | ∑ Theory of Computation | Automata, Pumping Lemma, Decidability, TMs |
| `maths` | ∫ Engineering Mathematics | Linear Algebra, Probability, Calculus |
| `co` | ⚙️ Computer Organization | Pipelining, Addressing, Cache, Arithmetic |
| `algo` | 🔁 Algorithms Design | Greedy, DP, Graph Algorithms, NP-Completeness |

---

## 🚀 Getting Started (VS Code)

### 1. Clone or download the project

```bash
git clone https://github.com/YOUR_USERNAME/gate-prep-ml.git
cd gate-prep-ml
```

### 2. Open in VS Code

```bash
code .
```

### 3. Run with Live Server *(recommended)*

1. Install the **Live Server** extension in VS Code  
   *(Extensions → search "Live Server" by Ritwick Dey → Install)*
2. Right-click `index.html` in the Explorer panel
3. Select **"Open with Live Server"**
4. Your browser opens at `http://localhost:5500` with auto-reload on save

### 4. Or just open the file directly

Right-click `index.html` → **Open with** → your browser.  
No server needed — the app is fully static.

---

## 🤖 AI Recommendations Setup

The app uses the [Anthropic API](https://www.anthropic.com) to generate personalised recommendations and practice questions.

**Step 1 — Get an API key**  
Sign up at [console.anthropic.com](https://console.anthropic.com) and create an API key.

**Step 2 — Set the key in your browser**  
After opening the app, open the browser console (`F12` → Console tab) and run:

```js
window.ANTHROPIC_API_KEY = 'sk-ant-your-key-here';
```

> ⚠️ This sets the key only for the current browser session. Refresh the page and you will need to set it again.  
> ⚠️ Never commit your API key to a public repository.

**No key?** No problem. The app falls back gracefully to rule-based recommendations so the full flow still works.

---

## 🗂️ Project Structure

```
gate-prep-ml/
├── index.html          # Entry point — all UI markup and styles
├── src/
│   ├── app.js          # Application state, UI rendering, test logic
│   ├── ml.js           # Client-side ML engine (10 algorithms)
│   ├── data.js         # Subject metadata and 40-question bank
│   └── auth.js         # localStorage-based authentication
└── README.md
```

No dependencies. No build step. No framework. Pure HTML + CSS + JS.

---

## 🧠 How the ML Works

After you complete a test, `ml.js` runs a full analysis pipeline entirely in the browser:

```
Your Answers + Timing
        ↓
Feature Extraction
  ├── Overall / Easy / Medium / Hard accuracy
  ├── Speed score  (vs. 90 s GATE target)
  └── Consistency score  (std-dev of subject scores)
        ↓
ML Algorithms
  ├── Logistic Regression  → Pass probability P(score ≥ 60%)
  ├── Linear Regression    → Predicted GATE score /100
  ├── K-Means Clustering   → Learner archetype (4 profiles)
  ├── Weighted Scoring     → Penalises easy-question misses more
  ├── Subject Prioritiser  → Ranks subjects by expected mark gain
  ├── Rank Band Estimator  → Maps score to IIT/NIT rank band
  └── Ebbinghaus Decay     → Retention forecast over 1–30 days
        ↓
Analysis Dashboard  →  AI Recommendations  →  Practice Modal
```

---

## 🔄 App Flow

```
Select Subjects (4–6)
       ↓
Mock Test  (5 Qs per subject · live timer · instant feedback)
       ↓
Score Computation  (per subject + per topic)
       ↓
ML Analysis Dashboard
  ├── Overall accuracy & predicted GATE score
  ├── Pass probability (logistic regression)
  ├── Learner profile  (k-means)
  ├── Subject performance bars + study impact
  ├── Weighted topic mastery map
  ├── Difficulty breakdown
  ├── K-means cluster visualisation
  └── Retention forecast (Ebbinghaus curve)
       ↓
AI Recommendations  (Anthropic API · 6 personalised cards)
       ↓
In-App Practice Quiz  (3 GATE-style Qs · full solutions · score)
```

---

## 💡 Tips

- **Select 4–6 subjects** that you want to focus on — the app weights recommendations accordingly.
- **Don't skip questions** — skipped questions count as wrong and affect your ML feature vector.
- **Watch the timer** — going over 90 s per question will lower your speed score.
- **Re-take the test** after a study session to track improvement; your history is saved locally.
- **Set the API key once** per browser session before clicking "Get Recommendations".

---

## 🛠️ Customisation

### Adding questions
Edit `src/data.js`. Each question follows this schema:

```js
{
  q:    "Question text",
  opts: ["Option A", "Option B", "Option C", "Option D"],
  ans:  0,          // index of correct option (0–3)
  topic: "Topic Name",
  diff:  "easy" | "medium" | "hard",
  exp:  "Explanation shown after answering"
}
```

### Changing the AI model
In `src/app.js`, search for `claude-sonnet-4-20250514` and replace with any supported model slug.

---

## ⚠️ Known Limitations

- **API key is browser-only** — set via console each session; not persisted for security reasons.
- **localStorage only** — clearing browser data erases accounts and history.
- **Demo-grade password hashing** — suitable for local/personal use only; use a proper auth backend for production.
- **Simulated ML weights** — regression coefficients are calibrated on synthetic data, not real GATE outcome datasets.

---

## 🗺️ Roadmap

- [ ] GATE previous-year questions (PYQs) with year tags
- [ ] Spaced repetition scheduler (SM-2 algorithm)
- [ ] Negative marking (−⅓) to match actual GATE scoring
- [ ] Full 65-question 3-hour exam mode
- [ ] Progress trends across multiple test sessions
- [ ] Supabase / Firebase backend for cloud persistence

---

## 📄 License

MIT © 2025
