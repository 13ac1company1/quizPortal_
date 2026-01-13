// src/ConstitutionCenter.js
import React, { useEffect, useMemo, useState } from "react";
import ConstitutionData from "./constitutionData.js";

export default function ConstitutionCenter() {
 var [tab, setTab] = useState("learn"); // learn | quiz | print | deep
 var [voice, setVoice] = useState(null);
 var [voices, setVoices] = useState([]);
 var [rate, setRate] = useState(1);
 var [pitch, setPitch] = useState(1);

 var [sectionType, setSectionType] = useState("articles"); // articles | amendments
 var [activeId, setActiveId] = useState(ConstitutionData.articles[0].id);

 // Quiz state
 var [mode, setMode] = useState("practice"); // practice | test
 var [questions, setQuestions] = useState([]);
 var [answers, setAnswers] = useState({});
 var [finished, setFinished] = useState(false);

 // Load voices
 useEffect(function () {
  function loadVoices() {
   var v = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
   setVoices(v || []);
   if (v && v.length && !voice) setVoice(v[0]);
  }
  loadVoices();
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices;
 }, [voice]);

 function speakText(text) {
  try {
   if (!text) return;
   if (!window.speechSynthesis) return;
   window.speechSynthesis.cancel();
   var msg = new SpeechSynthesisUtterance(text);
   msg.rate = rate;
   msg.pitch = pitch;
   if (voice) msg.voice = voice;
   window.speechSynthesis.speak(msg);
  } catch (e) { }
 }
 function stopSpeech() { try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { } }

 // Current list for Learn tab
 var sections = sectionType === "articles" ? ConstitutionData.articles : ConstitutionData.amendments;
 useEffect(function () {
  if (sections && sections.length) setActiveId(sections[0].id);
 }, [sectionType]); // eslint-disable-line

 var active = useMemo(function () {
  var i;
  for (i = 0; i < sections.length; i++) {
   if (sections[i].id === activeId) return sections[i];
  }
  return null;
 }, [sections, activeId]);

 // Build quiz from amendments
 useEffect(function () {
  var pool = ConstitutionData.amendments.slice();
  var items = [];
  var i, j;
  for (i = 0; i < pool.length; i++) {
   var correct = pool[i];
   var stem = "Which amendment best matches this idea: “" + correct.text[0] + "”?";
   var d = [];
   var used = {}; used[correct.id] = true;
   while (d.length < 3) {
    var r = pool[Math.floor(Math.random() * pool.length)];
    if (!used[r.id]) { used[r.id] = true; d.push(r); }
   }
   var opts = [correct].concat(d);
   for (j = opts.length - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)); var t = opts[j]; opts[j] = opts[k]; opts[k] = t; }
   var map = { a: opts[0], b: opts[1], c: opts[2], d: opts[3] };
   var ans = map.a.id === correct.id ? "a" : (map.b.id === correct.id ? "b" : (map.c.id === correct.id ? "c" : "d"));
   items.push({ id: "Q" + (i + 1), q: stem, choices: { a: map.a.title, b: map.b.title, c: map.c.title, d: map.d.title }, answer: ans });
  }
  setQuestions(items);
  setAnswers({});
  setFinished(false);
 }, []);

 function selectAns(qid, key) {
  var next = Object.assign({}, answers); next[qid] = key; setAnswers(next);
  try {
   var item = null; var i;
   for (i = 0; i < questions.length; i++) if (questions[i].id === qid) { item = questions[i]; break; }
   if (item && mode === "practice" && key === item.answer && window.ConfettiBoom) {
    window.ConfettiBoom.burst({ count: 100 });
   }
  } catch (e) { }
 }

 function grade(items, usr) {
  var det = []; var correct = 0; var i;
  for (i = 0; i < items.length; i++) {
   var it = items[i]; var ch = usr[it.id] || null; var ok = ch === it.answer;
   if (ok) correct++;
   det.push({ id: it.id, chosen: ch, correct: it.answer, isCorrect: ok });
  }
  return { correct: correct, total: items.length, details: det };
 }

 function printSection(s) {
  if (!s) return;
  var html = '<!doctype html><html><head><title>' + s.title + '</title><meta charset="utf-8"><style>' +
   'body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:28px;font-size:x-large;color:#0f172a;' +
   '-webkit-print-color-adjust:exact; print-color-adjust:exact} h1{font-size:xx-large;margin:0 0 12px} p,li{margin:10px 0}' +
   '</style></head><body>';
  html += '<h1>' + s.title + '</h1>';
  if (s.text && s.text.length) {
   for (var i = 0; i < s.text.length; i++) html += '<p>' + s.text[i] + '</p>';
  }
  if (s.bullets && s.bullets.length) {
   html += '<ul>';
   for (var j = 0; j < s.bullets.length; j++) html += '<li>' + s.bullets[j] + '</li>';
   html += '</ul>';
   if (s.classroom) html += '<p><b>Classroom note:</b> ' + s.classroom + '</p>';
  }
  html += '</body></html>';
  var w = window.open("", "_blank"); if (!w) { alert("Popup blocked."); return; }
  w.document.open(); w.document.write(html); w.document.close();
  setTimeout(function () { try { w.focus(); w.print(); } catch (e) { } }, 250);
 }

 function printQuiz(items, withKey) {
  var html = '<!doctype html><html><head><title>Bill of Rights Quiz</title><meta charset="utf-8"><style>' +
   'body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:28px;font-size:x-large;color:#0f172a;' +
   '-webkit-print-color-adjust:exact; print-color-adjust:exact} h1{font-size:xx-large;margin:0 0 12px} ol{margin-left:20px} li{margin:12px 0} .ans{margin:8px 0;padding:8px 10px;border-radius:12px;background:#e2e8f0}' +
   '</style></head><body><h1>Bill of Rights — Quiz</h1><ol>';
  var i;
  for (i = 0; i < items.length; i++) {
   var it = items[i];
   html += '<li>' + it.q + '<div style="margin-top:6px">';
   html += '<div>A. ' + it.choices.a + '</div><div>B. ' + it.choices.b + '</div><div>C. ' + it.choices.c + '</div><div>D. ' + it.choices.d + '</div></div>';
   if (withKey) html += '<div class="ans"><b>Answer:</b> ' + it.answer.toUpperCase() + ' — ' + it.choices[it.answer] + '</div>';
   html += '</li>';
  }
  html += '</ol></body></html>';
  var w = window.open("", "_blank"); if (!w) { alert("Popup blocked."); return; }
  w.document.open(); w.document.write(html); w.document.close();
  setTimeout(function () { try { w.focus(); w.print(); } catch (e) { } }, 250);
 }

 function Chip(props) {
  return (
   <button
    onClick={props.onClick}
    className={"chip " + (props.active ? "chip-on" : "chip-off")}
    style={{ marginRight: 8, marginBottom: 8 }}
   >
    {props.children}
   </button>
  );
 }

 // --- Learn Tab ---
 function Learn() {
  return (
   <div className="qa-stack">
    <div className="qa-card animate-card">
     <div className="qa-flex">
      <div>
       <h2 className="qa-h2">📘 {ConstitutionData.title}</h2>
       <div className="muted">Tap any paragraph to hear it read aloud. Use TTS controls to adjust voice, rate, and pitch.</div>
      </div>
      <div className="qa-tabs">
       <button className={"tab " + (tab === "learn" ? "tab-active" : "")} onClick={function () { setTab("learn"); }}>Learn</button>
       <button className={"tab " + (tab === "quiz" ? "tab-active" : "")} onClick={function () { setTab("quiz"); }}>Quiz</button>
       <button className={"tab " + (tab === "print" ? "tab-active" : "")} onClick={function () { setTab("print"); }}>Print</button>
       <button className={"tab " + (tab === "deep" ? "tab-active" : "")} onClick={function () { setTab("deep"); }}>Deep Dive</button>
      </div>
     </div>
    </div>

    <div className="qa-card animate-card">
     <div className="qa-flex" style={{ gap: 18, flexWrap: "wrap" }}>
      <div>
       <div className="label">Browse</div>
       <Chip active={sectionType === "articles"} onClick={function () { setSectionType("articles"); }}>Articles</Chip>
       <Chip active={sectionType === "amendments"} onClick={function () { setSectionType("amendments"); }}>Bill of Rights</Chip>
      </div>

      <div className="chip-wrap">
       {sections.map(function (s) {
        return (
         <Chip key={s.id} active={activeId === s.id} onClick={function () { setActiveId(s.id); }}>
          {s.title}
         </Chip>
        );
       })}
      </div>
     </div>
    </div>

    <div className="qa-card animate-card">
     <div className="qa-flex" style={{ alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
      <div>
       <div className="label">Voice</div>
       <select
        className="sp-select"
        value={voice ? voice.name : ""}
        onChange={function (e) {
         var name = e.target.value; var i;
         for (i = 0; i < voices.length; i++) { if (voices[i].name === name) { setVoice(voices[i]); break; } }
        }}
       >
        {voices && voices.length ? voices.map(function (v) {
         return <option key={v.name} value={v.name}>{v.name}</option>;
        }) : <option value="">Default</option>}
       </select>
      </div>
      <div><div className="label">Rate {rate.toFixed(1)}</div><input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={function (e) { setRate(parseFloat(e.target.value)); }} /></div>
      <div><div className="label">Pitch {pitch.toFixed(1)}</div><input type="range" min="0" max="2" step="0.1" value={pitch} onChange={function (e) { setPitch(parseFloat(e.target.value)); }} /></div>
      <div className="qa-actions">
       <button className="btn btn-primary" onClick={function () { if (active) speakText(active.title + ". " + active.text.join(" ")); }}>▶ Read Section</button>
       <button className="btn btn-ghost" onClick={stopSpeech}>⏹ Stop</button>
       <button className="btn btn-neutral" onClick={function () { if (active) printSection(active); }}>🖨️ Print This Section</button>
      </div>
     </div>

     {active ? (
      <div style={{ marginTop: 14 }}>
       <h3 className="qa-h3" style={{ marginBottom: 8 }}>{active.title}</h3>
       {active.text.map(function (p, i) {
        return (
         <p key={i} className="qa-p" onClick={function () { speakText(p); }} style={{ cursor: "pointer" }} title="Click to speak">
          {p}
         </p>
        );
       })}
      </div>
     ) : <div className="muted">Select a section above.</div>}
    </div>
   </div>
  );
 }

 // --- Deep Dive Tab ---
 function DeepDive() {
  var view = sectionType === "articles" ? ConstitutionData.deepArticles : ConstitutionData.deepAmendments;
  var deepActive = null; var i;
  for (i = 0; i < view.length; i++) { if (view[i].ref === (sectionType === "articles" ? activeId : activeId)) { deepActive = view[i]; break; } }
  if (!deepActive && view.length) deepActive = view[0];

  return (
   <div className="qa-stack">
    <div className="qa-card animate-card">
     <div className="qa-flex">
      <div>
       <h2 className="qa-h2">🔎 Deep Dive — {sectionType === "articles" ? "Constitution Articles" : "Bill of Rights"}</h2>
       <div className="muted">Richer explanations with bullet points and a short classroom note. Tap any line to hear it.</div>
      </div>
      <div className="qa-tabs">
       <button className={"tab " + (tab === "learn" ? "tab-active" : "")} onClick={function () { setTab("learn"); }}>Learn</button>
       <button className={"tab " + (tab === "quiz" ? "tab-active" : "")} onClick={function () { setTab("quiz"); }}>Quiz</button>
       <button className={"tab " + (tab === "print" ? "tab-active" : "")} onClick={function () { setTab("print"); }}>Print</button>
       <button className={"tab " + (tab === "deep" ? "tab-active" : "")} onClick={function () { setTab("deep"); }}>Deep Dive</button>
      </div>
     </div>
    </div>

    <div className="qa-card animate-card">
     <div className="qa-flex" style={{ gap: 18, flexWrap: "wrap" }}>
      <div>
       <div className="label">Choose Set</div>
       <Chip active={sectionType === "articles"} onClick={function () { setSectionType("articles"); }}>Articles</Chip>
       <Chip active={sectionType === "amendments"} onClick={function () { setSectionType("amendments"); }}>Bill of Rights</Chip>
      </div>

      <div className="chip-wrap">
       {(sectionType === "articles" ? ConstitutionData.articles : ConstitutionData.amendments).map(function (s) {
        return (
         <Chip key={s.id} active={activeId === s.id} onClick={function () { setActiveId(s.id); }}>
          {s.title}
         </Chip>
        );
       })}
      </div>
     </div>
    </div>

    {deepActive ? (
     <div className="qa-card animate-card">
      <div className="qa-actions" style={{ marginBottom: 8, gap: 10, flexWrap: "wrap" }}>
       <button className="btn btn-primary" onClick={function () {
        var speech = deepActive.title + ". " + deepActive.bullets.join(". ") + (deepActive.classroom ? (". " + deepActive.classroom) : "");
        speakText(speech);
       }}>▶ Read Deep Dive</button>
       <button className="btn btn-ghost" onClick={stopSpeech}>⏹ Stop</button>
       <button className="btn btn-neutral" onClick={function () { printSection(deepActive); }}>🖨️ Print This Deep Dive</button>
      </div>

      <h3 className="qa-h3" style={{ marginBottom: 6 }}>{deepActive.title}</h3>
      <ul style={{ marginTop: 8 }}>
       {deepActive.bullets.map(function (b, i) {
        return (
         <li key={i} className="qa-p" onClick={function () { speakText(b); }} style={{ cursor: "pointer" }} title="Click to speak">
          {b}
         </li>
        );
       })}
      </ul>
      {deepActive.classroom ? (
       <p className="qa-p" style={{ marginTop: 10 }}>
        <b>Classroom note:</b> <span onClick={function () { speakText(deepActive.classroom); }} style={{ cursor: "pointer" }}>{deepActive.classroom}</span>
       </p>
      ) : null}
     </div>
    ) : <div className="qa-card"><div className="muted">Select a section to view its deep dive.</div></div>}
   </div>
  );
 }

 // --- Quiz Tab ---
 function Quiz() {
  var total = questions.length;
  var g = finished ? grade(questions, answers) : null;
  return (
   <div className="qa-stack">
    <div className="qa-card animate-card">
     <div className="qa-flex">
      <div>
       <h2 className="qa-h2">🧠 Bill of Rights Quiz</h2>
       <div className="muted">Practice gives instant feedback; Test hides it until you finish.</div>
      </div>
      <div className="qa-tabs">
       <button className={"tab " + (tab === "learn" ? "tab-active" : "")} onClick={function () { setTab("learn"); }}>Learn</button>
       <button className={"tab " + (tab === "quiz" ? "tab-active" : "")} onClick={function () { setTab("quiz"); }}>Quiz</button>
       <button className={"tab " + (tab === "print" ? "tab-active" : "")} onClick={function () { setTab("print"); }}>Print</button>
       <button className={"tab " + (tab === "deep" ? "tab-active" : "")} onClick={function () { setTab("deep"); }}>Deep Dive</button>
      </div>
     </div>
    </div>

    <div className="qa-card animate-card">
     <div className="qa-flex" style={{ flexWrap: "wrap", gap: 10 }}>
      <div>
       <div className="label">Mode</div>
       <Chip active={mode === "practice"} onClick={function () { setMode("practice"); setFinished(false); setAnswers({}); }}>Practice</Chip>
       <Chip active={mode === "test"} onClick={function () { setMode("test"); setFinished(false); setAnswers({}); }}>Test</Chip>
      </div>
      <div className="qa-actions" style={{ marginLeft: "auto" }}>
       <button className="btn btn-primary btn-shimmer" onClick={function () {
        setFinished(true);
        try { window.ConfettiBoom && window.ConfettiBoom.celebrate({ duration: 1500, count: 28 }); } catch (e) { }
       }}>Finish</button>
       <button className="btn btn-ghost" onClick={function () { setAnswers({}); setFinished(false); }}>Reset</button>
       <button className="btn btn-neutral" onClick={function () { printQuiz(questions, true); }}>🖨️ Print w/ Answer Key</button>
      </div>
     </div>

     {questions.map(function (q) {
      var user = answers[q.id] || null;
      var isCorrect = user === q.answer;
      return (
       <div key={q.id} className="qa-opt" style={{ marginTop: 10 }}>
        <div style={{ marginBottom: 6, fontWeight: 900 }}>{q.q}</div>
        {["a", "b", "c", "d"].map(function (k) {
         var sel = user === k;
         var right = k === q.answer;
         var show = mode === "practice" && user !== null;
         var cls = "qa-opt " + (sel ? "is-selected " : "") + (show && right ? "is-right " : "") + (show && sel && !right ? "is-wrong " : "");
         return (
          <label key={k} className={cls} style={{ display: "flex", alignItems: "center", gap: 8 }}>
           <input type="radio" name={q.id} checked={sel} onChange={function () {
            selectAns(q.id, k);

           }} />
           <span className="qa-opt-key">{k.toUpperCase()}</span>
           <span>{q.choices[k]}</span>
          </label>
         );
        })}
        {mode === "practice" && user !== null ? (
         <div className="muted" style={{ marginTop: 6 }}>
          {isCorrect ? "✅ Correct!" : ("❌ Correct answer: " + q.answer.toUpperCase() + " — " + q.choices[q.answer])}
         </div>
        ) : null}
       </div>
      );
     })}
    </div>

    {finished ? (
     <div className="qa-card animate-card">
      <h3 className="qa-h3">Results</h3>
      <div className="qa-p">
       You answered <b>{g.correct}</b> out of {g.total} correctly ({Math.round((g.correct / g.total) * 100)}%).
      </div>
     </div>
    ) : null}
   </div>
  );
 }

 // --- Print Tab ---
 function Print() {
  return (
   <div className="qa-stack">
    <div className="qa-card animate-card">
     <div className="qa-flex">
      <div>
       <h2 className="qa-h2">🖨️ Printables</h2>
       <div className="muted">Print any Article/Amendment or a Bill of Rights quiz with an answer key.</div>
      </div>
      <div className="qa-tabs">
       <button className={"tab " + (tab === "learn" ? "tab-active" : "")} onClick={function () { setTab("learn"); }}>Learn</button>
       <button className={"tab " + (tab === "quiz" ? "tab-active" : "")} onClick={function () { setTab("quiz"); }}>Quiz</button>
       <button className={"tab " + (tab === "print" ? "tab-active" : "")} onClick={function () { setTab("print"); }}>Print</button>
       <button className={"tab " + (tab === "deep" ? "tab-active" : "")} onClick={function () { setTab("deep"); }}>Deep Dive</button>
      </div>
     </div>
    </div>

    <div className="qa-card animate-card">
     <div className="qa-flex" style={{ gap: 12, flexWrap: "wrap" }}>
      <div>
       <div className="label">Collection</div>
       <Chip active={sectionType === "articles"} onClick={function () { setSectionType("articles"); }}>Articles</Chip>
       <Chip active={sectionType === "amendments"} onClick={function () { setSectionType("amendments"); }}>Bill of Rights</Chip>
      </div>
      <div className="chip-wrap">
       {(sectionType === "articles" ? ConstitutionData.articles : ConstitutionData.amendments).map(function (s) {
        return <Chip key={s.id} active={activeId === s.id} onClick={function () { setActiveId(s.id); }}>{s.title}</Chip>;
       })}
      </div>
      <div className="qa-actions" style={{ marginLeft: "auto" }}>
       <button className="btn btn-neutral" onClick={function () {
        var set = sectionType === "articles" ? ConstitutionData.deepArticles : ConstitutionData.deepAmendments;
        var found = null; var i; for (i = 0; i < set.length; i++) { if (set[i].ref === activeId) { found = set[i]; break; } }
        if (!found) {
         var arr = sectionType === "articles" ? ConstitutionData.articles : ConstitutionData.amendments;
         var fallback = null; var j; for (j = 0; j < arr.length; j++) { if (arr[j].id === activeId) { fallback = arr[j]; break; } }
         printSection(fallback);
        } else { printSection(found); }
       }}>Print Selected</button>
       <button className="btn btn-primary" onClick={function () { printQuiz(questions, true); }}>Print Bill of Rights Quiz</button>
      </div>
     </div>
    </div>
   </div>
  );
 }

 return (
  <div className="qa-card sp-card animate-card menu-area" style={{ maxWidth: 1100, margin: "0 auto" }}>
   {tab === "learn" ? <Learn /> : null}
   {tab === "quiz" ? <Quiz /> : null}
   {tab === "print" ? <Print /> : null}
   {tab === "deep" ? <DeepDive /> : null}
  </div>
 );
}
