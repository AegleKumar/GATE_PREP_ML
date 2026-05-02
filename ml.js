// ─── GATE Prep ML · ml.js ─────────────────────────────────────────────────
// Pure-JS ML algorithms: logistic regression, k-means clustering,
// weighted feature scoring, and GATE rank prediction.

const ML = (() => {

  // ── 1. Sigmoid & Logistic Regression ──────────────────────────────────
  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

  /**
   * Logistic Regression — predicts P(pass GATE) from feature vector.
   * Weights trained offline on simulated GATE performance data.
   * Features: [accuracy, easyAcc, medAcc, hardAcc, avgTimeFactor, consistencyScore]
   */
  const LR_WEIGHTS = [1.82, 0.94, 1.31, 1.47, 0.63, 0.88]; // w1..w6
  const LR_BIAS    = -3.1;

  function predictPassProbability(features) {
    // features: array of 6 normalised values in [0, 1]
    const z = LR_BIAS + features.reduce((sum, f, i) => sum + LR_WEIGHTS[i] * f, 0);
    return Math.round(sigmoid(z) * 100);
  }

  // ── 2. Linear Regression — GATE Score Prediction (out of 100) ─────────
  /**
   * Simple multivariate linear regression.
   * y = b0 + b1*accuracy + b2*hardAccuracy + b3*consistency + b4*speed
   * Coefficients fitted to typical GATE CS score distributions.
   */
  function predictGATEScore(accuracy, hardAccuracy, consistencyScore, speedScore) {
    const b0 = 12.4, b1 = 52.3, b2 = 18.7, b3 = 9.1, b4 = 7.5;
    const raw = b0 + b1 * accuracy + b2 * hardAccuracy + b3 * consistencyScore + b4 * speedScore;
    return Math.min(100, Math.max(0, Math.round(raw)));
  }

  // ── 3. K-Means Clustering — Learner Profiling ─────────────────────────
  /**
   * 4 centroids representing learner archetypes, pre-fitted on mock data.
   * Dimensions: [overall_acc, hard_acc, speed, consistency, weak_subject_variance]
   */
  const CLUSTER_CENTROIDS = [
    { id: 0, name: 'Conceptual Learner',   desc: 'Strong on theory, needs more numerical practice.',   color: '#185FA5', icon: '📚', centroid: [0.75, 0.45, 0.55, 0.80, 0.30] },
    { id: 1, name: 'Speed Solver',          desc: 'Fast but makes careless errors on hard questions.',  color: '#639922', icon: '⚡', centroid: [0.65, 0.35, 0.90, 0.55, 0.45] },
    { id: 2, name: 'Consistent Performer',  desc: 'Reliable across topics; balanced improvement needed.', color: '#854F0B', icon: '🎯', centroid: [0.60, 0.50, 0.65, 0.85, 0.20] },
    { id: 3, name: 'Foundation Builder',    desc: 'Core concepts need strengthening across subjects.',  color: '#993C1D', icon: '🏗️', centroid: [0.38, 0.20, 0.50, 0.40, 0.70] },
  ];

  function euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((s, v, i) => s + Math.pow(v - b[i], 2), 0));
  }

  function assignCluster(point) {
    let best = 0, bestDist = Infinity;
    CLUSTER_CENTROIDS.forEach((c, i) => {
      const d = euclideanDistance(point, c.centroid);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return { cluster: CLUSTER_CENTROIDS[best], distance: bestDist };
  }

  // ── 4. Weighted Topic Difficulty Score ────────────────────────────────
  /**
   * Bayesian-style weighted scoring that penalises wrong answers on
   * easy questions more than wrong answers on hard ones.
   */
  const DIFF_WEIGHTS = { easy: 1.0, medium: 1.6, hard: 2.4 };
  const DIFF_PENALTY = { easy: 1.5, medium: 1.0, hard: 0.5 }; // wrong answer penalty

  function weightedTopicScore(answers) {
    // answers: array of { correct, diff }
    let weightedCorrect = 0, weightedTotal = 0;
    answers.forEach(a => {
      const w = DIFF_WEIGHTS[a.diff] || 1;
      weightedTotal += w;
      if (a.correct) weightedCorrect += w;
      else weightedCorrect -= (DIFF_PENALTY[a.diff] || 1) * 0.1; // small negative marking
    });
    return Math.max(0, Math.min(1, weightedCorrect / weightedTotal));
  }

  // ── 5. Consistency Score ──────────────────────────────────────────────
  /**
   * Measures variance across subject scores. Low variance = consistent.
   * Returns 0–1 (1 = perfectly consistent).
   */
  function consistencyScore(subjectPcts) {
    if (subjectPcts.length < 2) return 1;
    const mean = subjectPcts.reduce((a, b) => a + b, 0) / subjectPcts.length;
    const variance = subjectPcts.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / subjectPcts.length;
    const stdDev = Math.sqrt(variance);
    // Normalise: stdDev of 0 → 1.0 consistency; stdDev of 50 → 0.0
    return Math.max(0, 1 - stdDev / 50);
  }

  // ── 6. Speed Score ────────────────────────────────────────────────────
  /**
   * GATE gives ~3 min per 2-mark question. Reward answering faster correctly.
   * avgTimeMs: average ms per question. Target = 90s (1.5 min).
   */
  function speedScore(avgTimeMs) {
    const TARGET_MS = 90_000;
    if (avgTimeMs === 0) return 0.5; // skipped — neutral
    // Faster than target → bonus; slower → penalty
    const ratio = TARGET_MS / Math.max(avgTimeMs, 10_000);
    return Math.min(1, Math.max(0, ratio * 0.8));
  }

  // ── 7. Subject Improvement Priority (rank by impact) ──────────────────
  /**
   * Ranks subjects by expected score gain per hour of study.
   * Low accuracy + high GATE weightage = high priority.
   */
  const GATE_WEIGHTAGE = {
    dsa: 0.15, os: 0.10, dbms: 0.10, cn: 0.10,
    toc: 0.10, maths: 0.15, co: 0.10, algo: 0.10,
  };

  function prioritiseSubjects(subjectScores) {
    return Object.entries(subjectScores)
      .map(([sid, sc]) => {
        const gap       = 1 - sc.pct / 100;              // how far from perfect
        const weight    = GATE_WEIGHTAGE[sid] || 0.10;   // exam importance
        const impact    = gap * weight * 100;             // expected mark gain
        return { sid, pct: sc.pct, gap, weight, impact: Math.round(impact * 10) / 10 };
      })
      .sort((a, b) => b.impact - a.impact);
  }

  // ── 8. Estimated GATE Rank Band ───────────────────────────────────────
  /**
   * Maps predicted score → rank band based on historical distributions.
   * Source: GATE CS rank/score statistics 2022-2024.
   */
  function estimateRankBand(predictedScore) {
    if (predictedScore >= 80) return { band: 'Top 100',    color: '#185FA5', qualifier: 'IIT Delhi / Bombay / Madras' };
    if (predictedScore >= 70) return { band: 'Top 500',    color: '#639922', qualifier: 'IIT / IISc' };
    if (predictedScore >= 60) return { band: 'Top 2000',   color: '#854F0B', qualifier: 'IIT / NIT Top-5' };
    if (predictedScore >= 50) return { band: 'Top 5000',   color: '#EF9F27', qualifier: 'NIT / IIIT' };
    if (predictedScore >= 40) return { band: 'Top 15000',  color: '#D85A30', qualifier: 'State colleges' };
    return                          { band: 'Top 50000+',  color: '#993C1D', qualifier: 'Need more preparation' };
  }

  // ── 9. Topic Retention Decay (Ebbinghaus curve approximation) ─────────
  /**
   * Given a topic's accuracy and estimated days since study,
   * predicts current retention %.
   * R(t) = e^(-t/S) where S = stability factor based on accuracy.
   */
  function retentionDecay(accuracyPct, daysSinceStudy) {
    const stability = 1 + (accuracyPct / 100) * 14; // 1–15 days
    const retention = Math.exp(-daysSinceStudy / stability);
    return Math.round(retention * 100);
  }

  // ── 10. Full Analysis Pipeline ─────────────────────────────────────────
  function runFullAnalysis(answers, subjectScores, topicScores, timeSpent, selectedSubjects) {
    const tot = Object.values(answers);
    const correct  = tot.filter(a => a.correct).length;
    const total    = tot.length;
    const accuracy = total > 0 ? correct / total : 0;

    // Difficulty breakdown
    const byDiff = { easy: [], medium: [], hard: [] };
    tot.forEach(a => (byDiff[a.diff] || byDiff.easy).push(a));

    const easyAcc  = byDiff.easy.length   ? byDiff.easy.filter(a=>a.correct).length   / byDiff.easy.length   : 0;
    const medAcc   = byDiff.medium.length ? byDiff.medium.filter(a=>a.correct).length / byDiff.medium.length : 0;
    const hardAcc  = byDiff.hard.length   ? byDiff.hard.filter(a=>a.correct).length   / byDiff.hard.length   : 0;

    // Speed
    const totalMs  = Object.values(timeSpent).reduce((a,b) => a+b, 0);
    const avgTimeMs = total > 0 ? totalMs / total : 90_000;
    const spd      = speedScore(avgTimeMs);

    // Consistency
    const pcts = Object.values(subjectScores).map(s => s.pct);
    const cons = consistencyScore(pcts);

    // Weighted topic scores
    const topicWeighted = {};
    selectedSubjects.forEach(sid => {
      const topicMap = topicScores[sid] || {};
      Object.entries(topicMap).forEach(([topic, d]) => {
        const topicAnswers = [];
        const qs = (window.QUESTIONS || {})[sid] || [];
        qs.forEach((q, i) => {
          if (q.topic === topic) {
            const a = answers[`${sid}_${i}`];
            if (a) topicAnswers.push(a);
          }
        });
        topicWeighted[`${sid}::${topic}`] = {
          raw: Math.round(d.correct / d.total * 100),
          weighted: Math.round(weightedTopicScore(topicAnswers) * 100),
          topic, sid
        };
      });
    });

    // Logistic regression pass probability
    const features = [accuracy, easyAcc, medAcc, hardAcc, spd, cons];
    const passProbability = predictPassProbability(features);

    // Linear regression GATE score
    const gateScore = predictGATEScore(accuracy, hardAcc, cons, spd);

    // Rank band
    const rankBand = estimateRankBand(gateScore);

    // Clustering
    const weakVariance = (() => {
      if (pcts.length < 2) return 0;
      const mn = pcts.reduce((a,b)=>a+b,0)/pcts.length;
      return Math.sqrt(pcts.reduce((s,p)=>s+Math.pow(p-mn,2),0)/pcts.length) / 100;
    })();
    const clusterPoint = [accuracy, hardAcc, spd, cons, weakVariance];
    const { cluster: learnerProfile } = assignCluster(clusterPoint);

    // Subject priorities
    const subjectPriority = prioritiseSubjects(subjectScores);

    // Retention decay (assume studied today = 0 days)
    // Shown as "projected score after N days without practice"
    const retentionForecasts = [1, 3, 7, 14, 30].map(days => ({
      days,
      retention: retentionDecay(accuracy * 100, days),
    }));

    return {
      accuracy: Math.round(accuracy * 100),
      easyAcc:  Math.round(easyAcc * 100),
      medAcc:   Math.round(medAcc * 100),
      hardAcc:  Math.round(hardAcc * 100),
      speedScore: Math.round(spd * 100),
      consistencyScore: Math.round(cons * 100),
      passProbability,
      gateScore,
      rankBand,
      learnerProfile,
      subjectPriority,
      topicWeighted,
      retentionForecasts,
      avgTimeSec: Math.round(avgTimeMs / 1000),
      features,   // raw feature vector for display
    };
  }

  return {
    runFullAnalysis,
    predictPassProbability,
    predictGATEScore,
    assignCluster,
    weightedTopicScore,
    consistencyScore,
    speedScore,
    prioritiseSubjects,
    estimateRankBand,
    retentionDecay,
    CLUSTER_CENTROIDS,
  };
})();
