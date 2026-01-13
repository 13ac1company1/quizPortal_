// src/QuizApp.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { loadWeek, getWeeks, toOptions, grade } from './quizLoader.js';
import Dashboard from './Dashboard.js';
import FitText from './FitText.js';
import './QuizApp.css';

const containerCls = "qa-container";
const cardCls = "qa-card sp-card";
const primaryBtn = "btn btn-primary";
const neutralBtn = "btn btn-neutral";
const subtleBtn = "btn btn-ghost";

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={'chip ' + (active ? 'chip-on' : 'chip-off')}
    >
      {children}
    </button>
  );
}

function ProgressBar({ value, max }) {
  var pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="qa-progress">
      <div className="qa-progress-inner" style={{ width: pct + '%' }} />
    </div>
  );
}

function QuestionCard({ index, total, question, selectedKey, onSelect, locked, mode }) {
  var opts = useMemo(function () { return toOptions(question, true); }, [question]);
  var isPractice = mode === 'practice';
  var showFeedback = isPractice && selectedKey;

  return (
    <div className={cardCls + ' animate-card'}>
      <div className="qa-card-head">
        <h3 className="qa-h3">Question {index + 1} of {total}</h3>
        <span className="muted">ID: {question.id}</span>
      </div>

      {/* Fit the question text inside a fixed area so it scales up safely */}
      <div style={{ height: 'min(22vh, 200px)' }}>
        <FitText max={28} min={16} step={1} className="animate-fade">
          <div className="qa-q">{question.q}</div>
        </FitText>
      </div>

      <div className="qa-opts" style={{ marginTop: 10 }}>
        {opts.map(function (o) {
          var isSel = selectedKey === o.key;
          var isRight = showFeedback && (o.key === question.answer);
          var isWrong = showFeedback && (isSel && o.key !== question.answer);
          var cls = 'qa-opt';
          if (isSel) cls += ' is-selected';
          if (isRight) cls += ' is-right';
          if (isWrong) cls += ' is-wrong';
          if (locked) cls += ' is-locked';
          return (
            <label key={o.key} className={cls}>
              <input
                type="radio"
                name={question.id}
                value={o.key}
                disabled={locked}
                checked={isSel}
                onChange={function () { onSelect(o.key); }}
              />
              <span className="qa-opt-key">{o.key.toUpperCase()}</span>
              <span className="qa-opt-label">{o.label}</span>
            </label>
          );
        })}
      </div>

      {isPractice && selectedKey ? (
        <div className="qa-feedback">
          {selectedKey === question.answer ? (
            <span className="ok">Correct!</span>
          ) : (
            <span className="no">
              Not quite. Correct answer is {String(question.answer).toUpperCase()} — {String(question.choices[question.answer])}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Results({ questions, userAnswers, onRestart, durationMs }) {
  var g = grade(questions, userAnswers);
  var pct = Math.round((g.correct / g.total) * 100);
  var m = Math.floor((durationMs || 0) / 60000);
  var s = Math.floor(((durationMs || 0) % 60000) / 1000);

  function printKey() {
    try {
      var html = '<!doctype html><html><head><title>Answer Key</title>' +
        '<meta charset="utf-8"><style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px} h1{font-size:20px;margin:0 0 12px} ol{margin-left:20px} li{margin:8px 0} .ans{font-weight:700;color:#0f766e}</style></head><body>';
      html += '<h1>Answer Key</h1><ol>';
      for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        var correct = String(q.answer || '').toUpperCase();
        var label = q.choices && q.choices[q.answer] ? q.choices[q.answer] : '';
        html += '<li>' + (q.q || '') + '<div class="ans">Answer: ' + correct + (label ? ' — ' + String(label) : '') + '</div></li>';
      }
      html += '</ol></body></html>';
      var w = window.open('', '_blank'); if (!w) { alert('Popup blocked.'); return; }
      w.document.open(); w.document.write(html); w.document.close();
      setTimeout(function () { try { w.focus(); w.print(); } catch (e) { } }, 300);
    } catch (e) { alert('Failed to open print view: ' + (e && e.message ? e.message : String(e))); }
  }

  return (
    <div className="qa-stack">
      <div className={cardCls + ' animate-card'}>
        <div style={{ height: 46, marginBottom: 8 }}>
          <FitText max={30} min={18}><h2 className="qa-h2" style={{ margin: 0 }}>Results</h2></FitText>
        </div>
        <p className="qa-p">You answered <b>{g.correct}</b> out of {g.total} correctly ({pct}%).</p>
        <p className="muted">Time on quiz: {m}m {s}s</p>
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <ProgressBar value={g.correct} max={g.total} />
        </div>
        <div className="qa-actions">
          <button className={neutralBtn} onClick={onRestart}>Retake</button>
          <button className="btn btn-primary" onClick={printKey}>Print Answer Key</button>
        </div>
      </div>

      <div className={cardCls + ' animate-card'}>
        <h3 className="qa-h3">Review</h3>
        <ol className="qa-review">
          {g.details.map(function (d) {
            var q = null;
            for (var i = 0; i < questions.length; i++) { if (questions[i].id === d.id) { q = questions[i]; break; } }
            var user = d.chosen === null ? "(no answer)" : d.chosen.toUpperCase();
            return (
              <li key={d.id} className="qa-review-item">
                <div className="qa-review-head">
                  <span className="muted">{q ? q.id : d.id}</span>
                  <span className={'state ' + (d.isCorrect ? 'ok' : 'no')}>{d.isCorrect ? 'Correct' : 'Incorrect'}</span>
                </div>
                <div className="qa-p">{q ? q.q : "Question not found"}</div>
                <div className="qa-p"><b>Your answer:</b> {user}</div>
                <div className="qa-p"><b>Correct answer:</b> {d.correct.toUpperCase()}</div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export default function QuizApp() {
  var [tab, setTab] = useState('quiz'); // 'quiz' | 'dashboard'
  var [subject, setSubject] = useState('history');
  var [availableWeeks, setAvailableWeeks] = useState([]);
  var [week, setWeek] = useState(1);

  var [weekData, setWeekData] = useState(null);
  var [started, setStarted] = useState(false);
  var [finished, setFinished] = useState(false);
  var [index, setIndex] = useState(0);
  var [answers, setAnswers] = useState({});
  var [resumeAvailable, setResumeAvailable] = useState(false);
  var [mode, setMode] = useState('test'); // 'test' | 'practice'

  var [startedAt, setStartedAt] = useState(null);
  var [elapsedMs, setElapsedMs] = useState(0);

  function keyForProgress(s, w) { return 'quiz:' + s + ':' + String(w); }
  function keyForResult(s, w) { return 'quizResult:' + s + ':' + String(w); }

  var saveProgress = useCallback(function () {
    if (!weekData) return;
    var payload = { started: started, finished: finished, index: index, answers: answers, ts: Date.now(), title: weekData.title, startedAt: startedAt, elapsedMs: elapsedMs, mode: mode };
    try { localStorage.setItem(keyForProgress(subject, week), JSON.stringify(payload)); } catch (e) { }
  }, [answers, elapsedMs, finished, index, mode, started, startedAt, subject, week, weekData]);

  function clearProgress() { try { localStorage.removeItem(keyForProgress(subject, week)); } catch (e) { } }

  var saveResultIfFinished = useCallback(function () {
    if (mode === 'practice') return;
    if (!weekData || !finished) return;
    var g = grade(weekData.questions, answers);
    var durationMs = elapsedMs || (startedAt ? (Date.now() - startedAt) : 0);
    var payload = { score: g.correct, total: g.total, pct: Math.round((g.correct / g.total) * 100), at: Date.now(), title: weekData.title, durationMs: durationMs };
    try { localStorage.setItem(keyForResult(subject, week), JSON.stringify(payload)); } catch (e) { }
    try {
      var hKey = 'quizHistory:' + subject + ':' + String(week);
      var arr = JSON.parse(localStorage.getItem(hKey) || '[]');
      arr.push(payload);
      localStorage.setItem(hKey, JSON.stringify(arr));
    } catch (e) { }
  }, [answers, elapsedMs, finished, mode, startedAt, subject, week, weekData]);

  useEffect(function () { saveProgress(); }, [started, finished, index, answers, startedAt, elapsedMs, mode, saveProgress]);
  useEffect(function () { saveResultIfFinished(); }, [finished, saveResultIfFinished]);

  useEffect(function () {
    var mounted = true;
    getWeeks(subject, './').then(function (ws) {
      if (!mounted) return;
      setAvailableWeeks(ws);
      if (ws.length > 0) setWeek(ws[0]);
    }).catch(function (e) { console.error(e); setAvailableWeeks([]); });
    return function () { mounted = false; };
  }, [subject]);

  useEffect(function () {
    var mounted = true;
    loadWeek(subject, week, './').then(function (w) {
      if (!mounted) return;
      setWeekData(w); setStarted(false); setFinished(false); setIndex(0); setAnswers({}); setStartedAt(null); setElapsedMs(0);
      try {
        var raw = localStorage.getItem(keyForProgress(subject, week));
        if (raw) {
          var saved = JSON.parse(raw);
          if (saved && saved.started && !saved.finished && saved.answers) { setResumeAvailable(true); } else { setResumeAvailable(false); }
        } else { setResumeAvailable(false); }
      } catch (e) { setResumeAvailable(false); }
    }).catch(function (e) { console.error(e); setWeekData(null); });
    return function () { mounted = false; };
  }, [subject, week]);

  useEffect(function () {
    if (!(started && !finished && startedAt)) return;
    var id = setInterval(function () {
      try { setElapsedMs(Date.now() - startedAt); } catch (e) { }
    }, 1000);
    return function () { clearInterval(id); };
  }, [started, finished, startedAt]);

  function resumeFromStorage() {
    try {
      var raw = localStorage.getItem(keyForProgress(subject, week)); if (!raw) return;
      var saved = JSON.parse(raw); if (!saved) return;
      setStarted(Boolean(saved.started)); setFinished(Boolean(saved.finished));
      setIndex(Number(saved.index) || 0); setAnswers(saved.answers || {});
      setStartedAt(saved.startedAt || Date.now()); setElapsedMs(saved.elapsedMs || 0); setMode(saved.mode || 'test');
      setResumeAvailable(false);
    } catch (e) { }
  }

  var total = (weekData && weekData.questions) ? weekData.questions.length : 0;
  var current = (weekData && total > 0 && index >= 0 && index < total) ? weekData.questions[index] : null;
  var currentAnswer = (current && answers[current.id]) ? answers[current.id] : null;

  function startQuiz() { setStarted(true); setStartedAt(Date.now()); setElapsedMs(0); }
  function selectOption(key) {
    if (!current) return;
    setAnswers(function (prev) { return Object.assign({}, prev, { [current.id]: key }); });

    // Fire confetti immediately in practice mode if correct
    try {
      if (mode === "practice" && key === current.answer && window.ConfettiBoom) {
        window.ConfettiBoom.burst({ count: 120 });
      }
    } catch (e) { }
  }
  function prevQ() { if (index > 0) setIndex(index - 1); }
  function nextQ() { if (index < total - 1) setIndex(index + 1); }
  function submit() {
    setFinished(true);
    clearProgress();
    try { if (window.ConfettiBoom) window.ConfettiBoom.celebrate({ duration: 1500, count: 28 }); } catch (e) { }
  }
  function restart() { setStarted(false); setFinished(false); setIndex(0); setAnswers({}); setStartedAt(null); setElapsedMs(0); clearProgress(); }
  function resetWeekProgress() {
    if (!window.confirm('Reset saved progress for this week? This cannot be undone.')) return;
    try { localStorage.removeItem(keyForProgress(subject, week)); } catch (e) { }
    setStarted(false); setFinished(false); setIndex(0); setAnswers({}); setStartedAt(null); setElapsedMs(0);
  }

  var lastResult = null;
  try { lastResult = JSON.parse(localStorage.getItem(keyForResult(subject, week)) || 'null'); } catch (e) { }

  return (
    <div className={containerCls}>
      <div className="qa-inner">
        <header className="qa-hero animate-hero" style={{ marginBottom: 18 }}>
          <div className="qa-hero-left" style={{ width: '100%' }}>
            {/* Fit hero title */}
            <div style={{ height: 64 }}>
              <FitText max={48} min={26}><h1 className="qa-title" style={{ margin: 0 }}>Quiz App – History & Science</h1></FitText>
            </div>
            <p className="qa-subtitle">Spelling-quiz styling, autosave/resume, dashboard, export/import, timer, reset, practice mode.</p>
            <div className="qa-tabs" style={{ marginTop: 10 }}>
              <button className={'tab ' + (tab === 'quiz' ? 'tab-active pulse' : '')} onClick={function () { setTab('quiz'); }}>Quiz</button>
              <button className={'tab ' + (tab === 'dashboard' ? 'tab-active pulse' : '')} onClick={function () { setTab('dashboard'); }}>Dashboard</button>
            </div>
          </div>
          <div className="qa-hero-right">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
          </div>
        </header>

        {tab === 'quiz' ? (
          <section className={cardCls + ' animate-card mb-6'}>
            <div className="qa-bar">
              <div>
                <div className="label">Subject</div>
                <div className="chip-wrap">
                  <Chip active={subject === 'history'} onClick={function () { setSubject('history'); }}>History</Chip>
                  <Chip active={subject === 'science'} onClick={function () { setSubject('science'); }}>Science</Chip>
                </div>
              </div>

              <div>
                <div className="label">Week</div>
                <div className="chip-wrap">
                  {availableWeeks.map(function (w) {
                    return (
                      <Chip key={String(w)} active={Number(week) === Number(w)} onClick={function () { setWeek(w); }}>
                        Week {w}
                      </Chip>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="label">Mode</div>
                <div className="chip-wrap">
                  <Chip active={mode === 'test'} onClick={function () { setMode('test'); }}>Test</Chip>
                  <Chip active={mode === 'practice'} onClick={function () { setMode('practice'); }}>Practice</Chip>
                </div>
              </div>

              {lastResult ? (
                <div className="qa-last">Last score: <b>{lastResult.pct}%</b></div>
              ) : null}
            </div>
          </section>
        ) : null}

        {tab === 'quiz' && weekData && !started && !finished ? (
          <section className={cardCls + ' animate-card mb-6'}>
            <div style={{ height: 56 }}>
              {/* Fit the week title line */}
              <FitText max={34} min={18}><h2 className="qa-h2" style={{ margin: 0 }}>{weekData.title}</h2></FitText>
            </div>
            <p className="muted">This quiz has {total} questions. Your progress is saved automatically.</p>
            <div className="qa-actions">
              <button className={primaryBtn} onClick={startQuiz}>Start Quiz</button>
              {resumeAvailable ? <button className={neutralBtn} onClick={resumeFromStorage}>Resume Saved</button> : null}
            </div>
          </section>
        ) : null}

        {tab === 'quiz' && weekData && started && !finished && current ? (
          <div className="qa-stack">
            <ProgressBar value={index} max={total - 1} />
            <div className="muted">Time on quiz: {Math.floor((elapsedMs / 1000) / 60)}m {Math.floor((elapsedMs / 1000) % 60)}s</div>

            <QuestionCard
              index={index}
              total={total}
              question={current}
              selectedKey={currentAnswer}
              onSelect={selectOption}
              locked={false}
              mode={mode}
            />

            <div className="qa-flex">
              <button onClick={prevQ} disabled={index === 0} className={index === 0 ? subtleBtn : neutralBtn}>Prev</button>
              <div className="qa-actions gap">
                <button onClick={function () { saveProgress(); }} className={subtleBtn}>Save</button>
                <button onClick={resetWeekProgress} className="btn btn-danger">Reset Week</button>
                {index < total - 1 ? (
                  <button onClick={nextQ} className={primaryBtn}>Next</button>
                ) : (
                  <button onClick={submit} className="btn btn-success">
                    {mode === 'practice' ? 'Finish Practice' : 'Submit'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'quiz' && weekData && finished ? (
          <div className={cardCls + ' animate-card'}>
            {mode === 'practice' ? (
              <div className="qa-banner amber">
                Practice mode results are <b>not saved</b> to your history.
              </div>
            ) : null}
            <Results
              questions={weekData.questions}
              userAnswers={answers}
              onRestart={restart}
              durationMs={elapsedMs || (startedAt ? (Date.now() - startedAt) : 0)}
            />
          </div>
        ) : null}

        {tab === 'dashboard' ? (
          <div className={cardCls + ' animate-card'}>
            <Dashboard
              subject={subject}
              onContinue={function (weekNum) { setTab('quiz'); setWeek(weekNum); setStarted(true); }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
