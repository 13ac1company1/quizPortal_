// src/App.js
import React, { useEffect, useState } from "react";
import SpellingApp from "./SpellingApp.js";
import QuizApp from "./QuizApp.js";
import PrintCenter from "./PrintCenter.js";
import ConstitutionCenter from "./ConstitutionCenter.js";
import "./QuizApp.css";
import "./SpellingQuiz.css";
import Dashboard from "./Dashboard.js";
import PerformanceChart from "./PerformanceChart.js";
import LearningPortalUI from "./LearningPortalUI.js";

export default function App() {
  var [view, setView] = useState("portal"); // 'portal' | 'quiz' | 'spelling' | 'print' | 'constitution'
  useEffect(function () { window.scrollTo(0, 0); }, [view]);

  function resetSpellingQuizState() {
    try {
      localStorage.removeItem("selectedWeek");
      localStorage.removeItem("answers");
      localStorage.removeItem("submitted");
      localStorage.removeItem("darkMode");
    } catch (e) { }
  }

  function handleBackToPortal() {
    if (view === "spelling") {
      resetSpellingQuizState();
    }
    setView("portal");
  }

  function Tile(props) {
    return (
      <button className={"tile accent-indigo"} onClick={props.onClick} style={{ position: "relative" }}>
        <div className="tile-glow" />
        <div className="tile-body">
          <h3 className="tile-title">{props.title}</h3>
          <p className="tile-desc">{props.desc}</p>
        </div>
      </button>
    );
  }

  return (
    <div className="qa-container animated-bg">
      <div className="qa-inner">
        {view !== "portal" ? (
          <div className="qa-card sp-card" style={{ marginBottom: 16 }}>
            <button className="btn btn-ghost" onClick={handleBackToPortal}>
              ← Back to Portal
            </button>
          </div>
        ) : null}
        {view === "portal" ? (
          <div className="portal-wrap menu-area">
            <header className="portal-head">
              <h1 className="qa-title neon-pulse">✨ Learning Portal</h1>
              <p className="qa-subtitle">Tap a module to begin — topics, quizzes, spelling, printables, and the Constitution with full text-to-speech.</p>
            </header>

            <div className="portal-grid">
              <Tile
                title="History & Science Topics"
                desc="Provides relative links to quiz topics "
                onClick={function () { setView("topics"); }}
              />
              <Tile
                title="History & Science Quizzes"
                desc="Multiple-choice with practice mode, autosave, dashboard, and reviews."
                onClick={function () { setView("quiz"); }}
              />
              <Tile
                title="Spelling Galaxy"
                desc="Giant on-screen keyboard, speech, practice tools, and performance history."
                onClick={function () { setView("spelling"); }}
              />
              <Tile
                title="Print Center"
                desc="Print question sheets & answer keys for History, Science, or Spelling."
                onClick={function () { setView("print"); }}
              />
              <Tile
                title="Constitution & Bill of Rights"
                desc="Learn with TTS on every section, take quizzes, and print handouts."
                onClick={function () { setView("constitution"); }}
              />
              <Tile
                title="History/Science Quiz Performance"
                desc="Charts & progress across History, Science Quizzes!"
                onClick={function () { setView("performance"); }}
                accent="accent-indigo"
              />
              <Tile
                title="Spelling Quiz Performance"
                desc="Charts & progress for Spelling Quizzes!"
                onClick={function () { setView("spelling_performance"); }}
                accent="accent-indigo"
              />

            </div>
          </div>
        ) : null}

        {view === "topics" ? <LearningPortalUI /> : null}
        {view === "quiz" ? <QuizApp /> : null}
        {view === "spelling" ? <SpellingApp /> : null}
        {view === "print" ? <PrintCenter /> : null}
        {view === "constitution" ? <ConstitutionCenter /> : null}
        {view === "performance" ? <Dashboard /> : null}
        {view === "spelling_performance" ? <PerformanceChart /> : null}
      </div>
    </div>
  );
}
