// src/SpellingApp.js
import React, { useEffect, useState } from "react";
import wordLists from "./discovery_k12_spelling_5th_grade.json";
import PerformanceChart from "./PerformanceChart";
import FitText from "./FitText.js";
import "./SpellingQuiz.css";
import "./QuizApp.css";

// ✅ Define shared class constants (cardCls was missing before)
const cardCls = "qa-card sp-card";

export default function SpellingApp() {
  var [selectedWeek, setSelectedWeek] = useState(function () {
    var savedWeek = localStorage.getItem("selectedWeek");
    return savedWeek ? parseInt(savedWeek) : null;
  });
  var [answers, setAnswers] = useState(function () {
    var savedAnswers = localStorage.getItem("answers");
    return savedAnswers ? JSON.parse(savedAnswers) : Array(15).fill("");
  });
  var [submitted, setSubmitted] = useState(function () {
    return localStorage.getItem("submitted") === "true";
  });
  var [score, setScore] = useState(0);
  var [rate, setRate] = useState(1);
  var [pitch, setPitch] = useState(1);
  var [practiceMode, setPracticeMode] = useState(false);
  var [darkMode, setDarkMode] = useState(function () { return localStorage.getItem("darkMode") === "true"; });
  var [wordDetails, setWordDetails] = useState({});
  var [showFullList, setShowFullList] = useState(false);
  var [activeTab, setActiveTab] = useState("quiz");

  useEffect(function () {
    localStorage.setItem("selectedWeek", selectedWeek);
    localStorage.setItem("answers", JSON.stringify(answers));
    localStorage.setItem("submitted", submitted);
    localStorage.setItem("darkMode", darkMode);
  }, [selectedWeek, answers, submitted, darkMode]);

  useEffect(function () {
    var body = document.body;
    if (darkMode) body.classList.add("spelling-dark");
    else body.classList.remove("spelling-dark");
    return function () { body.classList.remove("spelling-dark"); };
  }, [darkMode]);

  function handleWeekChange(e) {
    var weekNum = parseInt(e.target.value);
    setSelectedWeek(weekNum);
    setAnswers(Array(15).fill(""));
    setSubmitted(false);
    setScore(0);
    setWordDetails({});
  }

  function handleInputChange(index, value) {
    var updated = answers.slice();
    updated[index] = value;
    setAnswers(updated);
  }

  function handleSubmit() {
    setSubmitted(true);
    var wk = null;
    for (var i = 0; i < wordLists.weeks.length; i++) {
      if (wordLists.weeks[i].week === selectedWeek) { wk = wordLists.weeks[i]; break; }
    }
    if (!wk) return;

    var newScore = 0;
    for (var j = 0; j < answers.length; j++) {
      if ((answers[j] || "").trim().toLowerCase() === (wk.words[j] || "").toLowerCase()) newScore++;
      // Inside handleSubmit after scoring
      setScore(newScore);
      try {
        if (window.ConfettiBoom) {
          if (newScore >= 12) { window.ConfettiBoom.celebrate({ duration: 1600, count: 30 }); }
          else if (newScore >= 8) { window.ConfettiBoom.burst({ count: 100 }); }
          else if (newScore > 0) { window.ConfettiBoom.burst({ count: 60 }); }
        }
      } catch (e) { }

    }
    setScore(newScore);
    playSound(newScore >= 10 ? "correct" : "wrong");

    var history = [];
    try {
      var parsed = JSON.parse(localStorage.getItem("performanceHistory"));
      if (Array.isArray(parsed)) history = parsed;
    } catch (e) { }
    var updatedHistory = history.slice();
    var attemptNumber = history.filter(function (entry) { return entry.week === selectedWeek; }).length + 1;
    var totalWords = Array.isArray(wk.words) ? wk.words.length : answers.length;
    updatedHistory.push({
      week: selectedWeek,
      score: newScore,
      total: totalWords,
      attempt: attemptNumber,
      date: new Date().toISOString()
    });
    localStorage.setItem("performanceHistory", JSON.stringify(updatedHistory));
  }

  function handleRetake() {
    var total = weekData && Array.isArray(weekData.words) ? weekData.words.length : 15;
    setAnswers(Array(total).fill(""));
    setSubmitted(false);
    setScore(0);
  }

  function playSound(type) {
    var msg = new SpeechSynthesisUtterance(type === "correct" ? "Correct" : "Incorrect");
    msg.rate = 1; msg.pitch = 1; speechSynthesis.speak(msg);
  }

  function speak(word) {
    var msg = new SpeechSynthesisUtterance(word);
    msg.rate = rate; msg.pitch = pitch; speechSynthesis.speak(msg);
  }

  function fetchDefinition(word) {
    if (wordDetails[word]) {
      alert(word + "\n\n" + wordDetails[word].definition + "\n\nExample: " + wordDetails[word].example);
      return;
    }
    fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (Array.isArray(data) && data.length && data[0].meanings && data[0].meanings.length && data[0].meanings[0].definitions && data[0].meanings[0].definitions.length) {
          var def = data[0].meanings[0].definitions[0].definition;
          var example = data[0].meanings[0].definitions[0].example || "No example.";
          var updated = Object.assign({}, wordDetails); updated[word] = { definition: def, example: example };
          setWordDetails(updated);
          alert(word + "\n\n" + def + "\n\nExample: " + example);
        } else {
          alert("Definition not found.");
        }
      }).catch(function () { alert("Error fetching definition."); });
  }

  function autoPronounce() {
    var wk = null;
    for (var i = 0; i < wordLists.weeks.length; i++) { if (wordLists.weeks[i].week === selectedWeek) { wk = wordLists.weeks[i]; break; } }
    if (!wk) return;
    var i2 = 0;
    var id = setInterval(function () {
      if (i2 < wk.words.length) { speak(wk.words[i2]); i2++; }
      else { clearInterval(id); }
    }, 2500);
  }

  function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }

  var weekData = null;
  for (var w = 0; w < wordLists.weeks.length; w++) {
    if (wordLists.weeks[w].week === selectedWeek) { weekData = wordLists.weeks[w]; break; }
  }
  var totalWords = weekData && Array.isArray(weekData.words) ? weekData.words.length : 0;
  var canRetake = submitted && !practiceMode && totalWords > 0 && score < totalWords;

  return (
    <div className="qa-inner">
      <div className="qa-hero animate-hero" style={{ marginBottom: 18 }}>
        <div className="qa-hero-left" style={{ width: '100%' }}>
          <div style={{ height: 64 }}>
            <FitText max={48} min={26}><h1 className="qa-title" style={{ margin: 0 }}>✨ Spelling Galaxy</h1></FitText>
          </div>
          <p className="qa-subtitle">Big on-screen keyboard, speech tools, practice mode, and performance tracking.</p>
          <div className="qa-tabs" style={{ marginTop: 10 }}>
            <button className={'tab ' + (activeTab === 'quiz' ? 'tab-active pulse' : '')} onClick={function () { setActiveTab('quiz'); }}>Quiz</button>
            <button className={'tab ' + (activeTab === 'performance' ? 'tab-active pulse' : '')} onClick={function () { setActiveTab('performance'); }}>Performance</button>
          </div>
        </div>
        <div className="qa-hero-right">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
      </div>

      {activeTab === "quiz" ? (
        <>
          <div className={cardCls + ' animate-card'} style={{ marginBottom: 16 }}>
            <div className="qa-bar">
              <div>
                <div className="label">Mode</div>
                <div className="chip-wrap">
                  <button className={'chip ' + (darkMode ? 'chip-on' : 'chip-off')}
                    onClick={function () { setDarkMode(!darkMode); }}>
                    {darkMode ? "Dark Mode" : "Light Mode"}
                  </button>
                  <button className={'chip ' + (practiceMode ? 'chip-on' : 'chip-off')}
                    onClick={function () { setPracticeMode(!practiceMode); }}>
                    Practice Mode
                  </button>
                </div>
              </div>

              <div>
                <div className="label">Speech</div>
                <div className="chip-wrap">
                  <span className="muted">Rate: {rate}</span>
                  <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={function (e) { setRate(parseFloat(e.target.value)); }} />
                  <span className="muted">Pitch: {pitch}</span>
                  <input type="range" min="0" max="2" step="0.1" value={pitch} onChange={function (e) { setPitch(parseFloat(e.target.value)); }} />
                </div>
              </div>
            </div>
          </div>

          <div className={cardCls + ' animate-card'} style={{ marginBottom: 16 }}>
            <div className="qa-bar">
              <div>
                <div className="label">Week</div>
                <select value={selectedWeek || ""} onChange={handleWeekChange} className="sp-select">
                  <option value="">Select a Week</option>
                  {wordLists.weeks.map(function (w) {
                    return <option key={w.week} value={w.week}>Week {w.week}</option>;
                  })}
                </select>
              </div>

              {practiceMode ? (
                <div className="qa-actions" style={{ alignSelf: "end" }}>
                  <button className="btn btn-neutral" onClick={autoPronounce}>🔊 Auto-Pronounce All</button>
                  <button className="btn btn-ghost" onClick={function () { setShowFullList(!showFullList); }}>📖 Show Word List</button>
                </div>
              ) : null}
            </div>
          </div>

          {weekData ? (
            <form
              onSubmit={function (e) { e.preventDefault(); handleSubmit(); }}
              className={cardCls + ' animate-card quiz-form'}
              style={{ paddingTop: 18 }}
            >
              <div style={{ height: 48, marginBottom: 8 }}>
                <FitText max={32} min={18}><h2 className="qa-h2" style={{ margin: 0 }}>Week {weekData.week} Quiz</h2></FitText>
              </div>

              {weekData.words.map(function (word, i) {
                var user = answers[i] || "";
                var isCorrect = user.trim().toLowerCase() === word.toLowerCase();
                return (
                  <div className="word-box" key={i}>
                    <div className="borderd-container">
                      <label style={{ paddingLeft: 9 }}>{(i + 1) + '. '}</label>
                      <input
                        className={"sp-input " + (submitted && !practiceMode ? (isCorrect ? "is-ok" : "is-no") : "")}
                        type="text"
                        inputMode="latin"
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="off"
                        spellCheck={false}
                        value={user}
                        onChange={function (e) {
                          handleInputChange(i, e.target.value);
                          if (practiceMode) {
                            var correctNow = e.trim().toLowerCase() === word.toLowerCase();
                            if (correctNow) { try { window.ConfettiBoom && window.ConfettiBoom.burst({ count: 40 }); } catch (e) { } }
                          }

                        }
                        }
                        disabled={submitted && !practiceMode}
                      />
                      <button type="button" onClick={function () { speak(word); }} className="btn btn-ghost">🔊</button>
                      {practiceMode ? (
                        <button type="button" onClick={function () { fetchDefinition(word); }} className="btn btn-ghost">📖</button>
                      ) : null}
                    </div>
                    {practiceMode ? <p className="helper">Answer: {word}</p> : null}
                    {submitted && !practiceMode ? (
                      <p className={isCorrect ? "correct" : "wrong"}>
                        {isCorrect ? "✅ Correct" : "❌ " + word}
                      </p>
                    ) : null}
                  </div>
                );
              })}

              {!practiceMode && !submitted ? (
                <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
                  Submit Quiz
                </button>
              ) : null}
              {!practiceMode && submitted ? (
                <div className="qa-card" style={{ marginTop: 12 }}>
                  <p className="qa-p"><b>Score:</b> {score} / {totalWords}</p>
                </div>
              ) : null}
              {canRetake ? (
                <button type="button" className="btn btn-neutral" onClick={handleRetake} style={{ marginTop: 12 }}>
                  Retake Quiz
                </button>
              ) : null}
            </form>
          ) : null}

          {showFullList && weekData ? (
            <div className={cardCls + ' animate-card word-list'}>
              <h3 className="qa-h3">Full Word List – Week {weekData.week}</h3>
              {weekData.words.map(function (word, i) {
                var details = wordDetails[word];
                return (
                  <div key={i} className="list-item">
                    <strong>{i + 1}. {word}</strong>
                    <p>Definition: {details ? details.definition : "Not loaded yet"}</p>
                    <p>Example: {details ? details.example : "Not loaded yet"}</p>
                  </div>
                );
              })}
            </div>
          ) : null}
        </>
      ) : null}

      {activeTab === "performance" ? <PerformanceChart /> : null}

      <button onClick={scrollToTop} className="to-top-btn" style={{ position: "sticky", bottom: 0, right: 0, padding: 18, opacity: 0.8 }}>
        ▲
      </button>
    </div>
  );
}
