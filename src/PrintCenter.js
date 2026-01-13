// src/PrintCenter.js
import React, { useEffect, useState } from "react";
import { getWeeks, loadWeek } from "./quizLoader.js";
import wordLists from "./discovery_k12_spelling_5th_grade.json";

export default function PrintCenter() {
  // What to print
  var [type, setType] = useState("history"); // "history" | "science" | "spelling"
  var [histWeeks, setHistWeeks] = useState([]);
  var [sciWeeks, setSciWeeks] = useState([]);
  var [week, setWeek] = useState("");

  // Shared toggles
  var [includeAnswers, setIncludeAnswers] = useState(true);

  // Spelling worksheet toggles
  var [showWords, setShowWords] = useState(true);
  var [includeDefinitions, setIncludeDefinitions] = useState(false);

  // Puzzles toggles
  var [includePuzzleSolutions, setIncludePuzzleSolutions] = useState(false);
  var [gridSize, setGridSize] = useState(15);

  // Difficulty
  var [wsDifficulty, setWsDifficulty] = useState("medium");  // easy | medium | hard
  var [cwDifficulty, setCwDifficulty] = useState("medium");  // easy | medium | hard

  useEffect(function () {
    var alive = true;
    getWeeks("history", "./").then(function (ws) { if (alive) setHistWeeks(ws); }).catch(function () { setHistWeeks([]); });
    getWeeks("science", "./").then(function (ws) { if (alive) setSciWeeks(ws); }).catch(function () { setSciWeeks([]); });
    return function () { alive = false; };
  }, []);

  useEffect(function () {
    if (type === "spelling") {
      if (wordLists && wordLists.weeks && wordLists.weeks.length) {
        setWeek(String(wordLists.weeks[0].week));
      } else {
        setWeek("");
      }
    } else {
      var list = type === "history" ? histWeeks : sciWeeks;
      if (list && list.length) setWeek(String(list[0])); else setWeek("");
    }
  }, [type, histWeeks, sciWeeks]);

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // -------- HISTORY/SCIENCE standard quiz prints --------
  function printQuiz(subject, w, withAnswers) {
    loadWeek(subject, Number(w), "./").then(function (data) {
      var title = data.title || (subject + " Week " + w);
      var html = '<!doctype html><html><head><title>' + title + '</title>' +
        '<meta charset="utf-8"><style>' +
        'body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:28px;line-height:1.55;font-size:x-large;color:#0f172a;' +
        '-webkit-print-color-adjust:exact; print-color-adjust:exact}' +
        'h1{font-size:xx-large;margin:0 0 12px}' +
        '.meta{color:#64748b;margin-bottom:12px}' +
        'ol{margin-left:20px}' +
        'li{margin:14px 0}' +
        '.ans{margin-top:6px;padding:8px 10px;background:#e2e8f0;border-radius:10px;color:#0f172a}' +
        '</style></head><body>';
      html += '<h1>' + escapeHtml(title) + '</h1><div class="meta">Subject: ' + subject.charAt(0).toUpperCase() + subject.slice(1) + ' • Week ' + w + '</div><ol>';
      for (var i = 0; i < data.questions.length; i++) {
        var q = data.questions[i];
        html += '<li>' + escapeHtml(q.q) + '</li>';
        if (withAnswers) {
          var lab = q.choices && q.choices[q.answer] ? q.choices[q.answer] : "";
          html += '<div class="ans"><b>Answer:</b> ' + String(q.answer).toUpperCase() + (lab ? ' — ' + escapeHtml(lab) : '') + '</div>';
        }
      }
      html += '</ol></body></html>';
      var wdw = window.open("", "_blank"); if (!wdw) { alert("Popup blocked."); return; }
      wdw.document.open(); wdw.document.write(html); wdw.document.close();
      setTimeout(function () { try { wdw.focus(); wdw.print(); } catch (e) { } }, 250);
    }).catch(function (e) {
      alert("Failed to load week " + w + " for " + subject + ": " + (e && e.message ? e.message : String(e)));
    });
  }

  // -------- SPELLING worksheet with optional definitions --------
  function getSpellingWeek(weekStr) {
    var wk = null;
    if (wordLists && wordLists.weeks) {
      for (var i = 0; i < wordLists.weeks.length; i++) {
        if (String(wordLists.weeks[i].week) === String(weekStr)) { wk = wordLists.weeks[i]; break; }
      }
    }
    return wk;
  }

  function fetchDefinition(word) {
    return fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (Array.isArray(data) && data.length && data[0].meanings && data[0].meanings.length && data[0].meanings[0].definitions && data[0].meanings[0].definitions.length) {
          return data[0].meanings[0].definitions[0].definition;
        }
        return "";
      }).catch(function () { return ""; });
  }

  async function printSpelling(w, showWordsFlag, includeDefsFlag) {
    try {
      var wk = getSpellingWeek(w);
      if (!wk) { alert("Week not found in spelling list."); return; }

      var defs = [];
      if (includeDefsFlag) {
        for (var i = 0; i < wk.words.length; i++) {
          // eslint-disable-next-line no-await-in-loop
          var def = await fetchDefinition(wk.words[i]);
          defs.push(def || "");
        }
      }

      var title = "Spelling – Week " + wk.week;
      var html = '<!doctype html><html><head><title>' + title + '</title>' +
        '<meta charset="utf-8"><style>' +
        'html,body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:30px;line-height:1.6;color:#0f172a;font-size:x-large;' +
        '-webkit-print-color-adjust:exact; print-color-adjust:exact}' +
        'h1{font-size:xx-large;margin:0 0 14px}' +
        '.meta{color:#64748b;margin-bottom:16px}' +
        '.row{display:flex;align-items:center;gap:16px;margin:18px 0 8px}' +
        '.num{width:42px;text-align:right;font-weight:900}' +
        '.word{min-width:260px;font-weight:800}' +
        '.mainline{flex:1;border-bottom:2px solid #cbd5e1;height:32px}' +
        '.hint{color:#334155;margin:6px 0 6px;font-weight:800}' +
        '.line{height:28px;border-bottom:1px dashed #cbd5e1;margin:8px 0}' +
        '@media print {.row{break-inside:avoid}}' +
        '</style></head><body>';
      html += '<h1>' + escapeHtml(title) + '</h1><div class="meta">Write the correct spelling next to each number. Then add a definition and an example sentence.</div>';

      for (var j = 0; j < wk.words.length; j++) {
        var idx = j + 1;
        var word = wk.words[j];
        html += '<div class="row"><div class="num">' + idx + '.</div>';
        if (showWordsFlag) {
          html += '<div class="word">' + escapeHtml(word) + '</div>';
        }
        html += '<div class="mainline"></div></div>';
        if (includeDefsFlag) {
          var d = defs[j] ? escapeHtml(defs[j]) : "";
          html += '<div class="hint">Definition:</div>';
          if (d) { html += '<div>' + d + '</div>'; }
          else { html += '<div class="line"></div>'; }
        } else {
          html += '<div class="hint">Definition:</div><div class="line"></div>';
        }
        html += '<div class="hint">Example sentence:</div><div class="line"></div>';
      }

      html += '</body></html>';
      var wdw = window.open("", "_blank"); if (!wdw) { alert("Popup blocked."); return; }
      wdw.document.open(); wdw.document.write(html); wdw.document.close();
      setTimeout(function () { try { wdw.focus(); wdw.print(); } catch (e) { } }, 250);
    } catch (e) {
      alert("Failed to prepare spelling print: " + (e && e.message ? e.message : String(e)));
    }
  }

  // -------- WORD SEARCH --------

  function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function randomLetter() { return String.fromCharCode(65 + Math.floor(Math.random() * 26)); }

  // Build directions based on difficulty
  function wordSearchDirs(level) {
    // easy: only → and ↓
    // medium: + diagonals ↘
    // hard: add reverse directions
    if (level === "easy") return [[0,1],[1,0]];
    if (level === "medium") return [[0,1],[1,0],[1,1]];
    // hard
    return [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];
  }

  function buildWordSearch(wordsRaw, size, level) {
    var words = wordsRaw.map(function (w) { return w.toUpperCase().replace(/[^A-Z]/g, ""); }).filter(Boolean);
    var grid = [];
    var sol = [];
    var used = [];
    var i, j;
    for (i = 0; i < size; i++) { grid.push(new Array(size).fill("")); sol.push(new Array(size).fill("")); }

    var dirs = wordSearchDirs(level);

    function canPlace(w, r, c, dr, dc) {
      for (var k = 0; k < w.length; k++) {
        var rr = r + dr * k, cc = c + dc * k;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) return false;
        var ch = grid[rr][cc];
        if (ch !== "" && ch !== w[k]) return false;
      }
      return true;
    }

    function reverse(str){ return str.split("").reverse().join(""); }

    function placeWord(w) {
      // On hard, 50% chance to place reversed
      var candidate = (level === "hard" && Math.random() < 0.5) ? reverse(w) : w;
      for (var tries = 0; tries < 300; tries++) {
        var dir = dirs[randInt(0, dirs.length - 1)];
        var dr = dir[0], dc = dir[1];
        var r = randInt(0, size - 1), c = randInt(0, size - 1);
        if (!canPlace(candidate, r, c, dr, dc)) continue;
        for (var k = 0; k < candidate.length; k++) {
          var rr = r + dr * k, cc = c + dc * k;
          grid[rr][cc] = candidate[k];
          sol[rr][cc] = candidate[k];
        }
        return true;
      }
      return false;
    }

    words.sort(function (a, b) { return b.length - a.length; });
    for (i = 0; i < words.length; i++) {
      var w = words[i];
      if (w.length > size) continue;
      if (placeWord(w)) used.push(w);
    }

    for (i = 0; i < size; i++) {
      for (j = 0; j < size; j++) { if (grid[i][j] === "") grid[i][j] = randomLetter(); }
    }
    return { grid: grid, solution: sol, used: used };
  }

  function printWordSearch(weekStr, size, level, withSolution) {
    var wk = getSpellingWeek(weekStr);
    if (!wk) { alert("Week not found."); return; }
    var N = Number(size) || 15;
    var data = buildWordSearch(wk.words, N, level);

    var title = "Word Search – Week " + wk.week + " (" + level + ")";
    var css = 'body{font-family:ui-monospace,Menlo,Consolas,monospace;padding:28px;font-size:x-large;color:#0f172a;' +
      '-webkit-print-color-adjust:exact; print-color-adjust:exact}' +
      'h1{font-size:xx-large;margin:0 0 12px;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif}' +
      '.meta{color:#64748b;margin-bottom:12px;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif}' +
      '.grid{border-collapse:collapse;margin:12px 0}' +
      '.grid td{width:34px;height:34px;text-align:center;border:1px solid #0f172a;font-weight:900;vertical-align:middle}' +
      '.sol{color:#b91c1c}' +
      '.list{columns:2;column-gap:24px;margin-top:10px;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif}';

    var html = '<!doctype html><html><head><title>' + title + '</title><meta charset="utf-8"><style>' + css + '</style></head><body>';
    html += '<h1>' + escapeHtml(title) + '</h1><div class="meta">Find all the hidden words. Directions vary with difficulty.</div>';
    html += '<table class="grid">';
    for (var r = 0; r < data.grid.length; r++) {
      html += '<tr>';
      for (var c = 0; c < data.grid[r].length; c++) {
        var ch = data.grid[r][c];
        if (withSolution && data.solution[r][c]) {
          html += '<td class="sol">' + ch + '</td>';
        } else {
          html += '<td>' + ch + '</td>';
        }
      }
      html += '</tr>';
    }
    html += '</table>';

    html += '<div class="list"><h3>Word List</h3>';
    for (var i = 0; i < wk.words.length; i++) { html += escapeHtml(wk.words[i]) + '<br/>'; }
    html += '</div>';

    html += '</body></html>';
    var wdw = window.open("", "_blank"); if (!wdw) { alert("Popup blocked."); return; }
    wdw.document.open(); wdw.document.write(html); wdw.document.close();
    setTimeout(function () { try { wdw.focus(); wdw.print(); } catch (e) { } }, 250);
  }

  // -------- CROSSWORD with numbering --------

  function makeCrossword(wordsRaw, size, level) {
    // Simple criss-cross; "difficulty" mainly via grid size and willingness to place isolated words.
    var words = wordsRaw.map(function (w) { return w.toUpperCase().replace(/[^A-Z]/g, ""); }).filter(Boolean);
    var N = size;
    var grid = []; var usedMask = [];
    var i, j;
    for (i = 0; i < N; i++) { grid.push(new Array(N).fill("")); usedMask.push(new Array(N).fill(false)); }

    words.sort(function (a, b) { return b.length - a.length; });
    if (!words.length) return { grid: grid, placed: [] };

    var placed = [];

    function canPlaceH(w, r, c) {
      if (c + w.length > N) return false;
      for (var k = 0; k < w.length; k++) {
        var ch = grid[r][c + k];
        if (ch !== "" && ch !== w[k]) return false;
      }
      return true;
    }
    function canPlaceV(w, r, c) {
      if (r + w.length > N) return false;
      for (var k = 0; k < w.length; k++) {
        var ch = grid[r + k][c];
        if (ch !== "" && ch !== w[k]) return false;
      }
      return true;
    }
    function placeH(w, r, c) {
      for (var k = 0; k < w.length; k++) { grid[r][c + k] = w[k]; usedMask[r][c + k] = true; }
      placed.push({ word: w, r: r, c: c, dir: "H" });
    }
    function placeV(w, r, c) {
      for (var k = 0; k < w.length; k++) { grid[r + k][c] = w[k]; usedMask[r + k][c] = true; }
      placed.push({ word: w, r: r, c: c, dir: "V" });
    }

    // Place first word horizontally in the middle
    var midr = Math.floor(N / 2);
    var startc = Math.max(0, Math.floor((N - words[0].length) / 2));
    if (startc + words[0].length <= N) placeH(words[0], midr, startc);

    function tryCross(w) {
      for (var p = 0; p < placed.length; p++) {
        var pl = placed[p];
        for (var i2 = 0; i2 < w.length; i2++) {
          var ch = w[i2];
          for (var k = 0; k < pl.word.length; k++) {
            if (pl.word[k] !== ch) continue;
            if (pl.dir === "H") {
              var rr = pl.r - i2, cc = pl.c + k;
              if (canPlaceV(w, rr, cc)) { placeV(w, rr, cc); return true; }
            } else {
              var rr2 = pl.r + k, cc2 = pl.c - i2;
              if (canPlaceH(w, rr2, cc2)) { placeH(w, rr2, cc2); return true; }
            }
          }
        }
      }
      return false;
    }

    for (i = 1; i < words.length; i++) {
      var ok = tryCross(words[i]);
      if (!ok) {
        // Hard: allow isolated placements anywhere; Medium: try a bit; Easy: limited attempts
        var maxTries = level === "hard" ? 2000 : (level === "medium" ? 400 : 120);
        var placedFlag = false;
        for (var t = 0; t < maxTries && !placedFlag; t++) {
          var r = Math.floor(Math.random() * N), c = Math.floor(Math.random() * N);
          if (Math.random() < 0.5) { if (canPlaceH(words[i], r, c)) { placeH(words[i], r, c); placedFlag = true; } }
          else { if (canPlaceV(words[i], r, c)) { placeV(words[i], r, c); placedFlag = true; } }
        }
      }
    }

    return { grid: grid, placed: placed };
  }

  function numberCrossword(grid) {
    var R = grid.length, C = grid[0].length;
    var numbers = []; // 2D numbers or null
    var r, c;
    for (r = 0; r < R; r++) {
      numbers.push(new Array(C).fill(null));
    }
    var nextNum = 1;
    var across = [];
    var down = [];

    function isLetter(rr, cc) { return rr >= 0 && rr < R && cc >= 0 && cc < C && grid[rr][cc] !== ""; }

    for (r = 0; r < R; r++) {
      for (c = 0; c < C; c++) {
        if (!isLetter(r, c)) continue;

        var startAcross = (!isLetter(r, c - 1) && isLetter(r, c + 1));
        var startDown = (!isLetter(r - 1, c) && isLetter(r + 1, c));

        if (startAcross || startDown) {
          var num = nextNum++;
          numbers[r][c] = num;

          if (startAcross) {
            var cc = c; var wordA = "";
            while (isLetter(r, cc)) { wordA += grid[r][cc]; cc++; }
            across.push({ num: num, r: r, c: c, answer: wordA, len: wordA.length });
          }
          if (startDown) {
            var rr = r; var wordD = "";
            while (isLetter(rr, c)) { wordD += grid[rr][c]; rr++; }
            down.push({ num: num, r: r, c: c, answer: wordD, len: wordD.length });
          }
        }
      }
    }
    return { numbers: numbers, across: across, down: down };
  }

  function printCrossword(weekStr, level, withSolution) {
    var wk = getSpellingWeek(weekStr);
    if (!wk) { alert("Week not found."); return; }

    // Grid size by difficulty
    var size = (level === "easy") ? 13 : (level === "medium" ? 15 : 17);
    var data = makeCrossword(wk.words, size, level);
    var nums = numberCrossword(data.grid);

    var title = "Crossword – Week " + wk.week + " (" + level + ")";
    var css = ''
      + 'body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:28px;font-size:x-large;color:#0f172a;'
      + '-webkit-print-color-adjust:exact; print-color-adjust:exact}'
      + 'h1{font-size:xx-large;margin:0 0 12px}'
      + '.meta{color:#64748b;margin-bottom:12px}'
      + '.wrap{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start}'
      + '.grid{border-collapse:collapse;margin:6px 0}'
      + '.grid td{width:36px;height:36px;border:1px solid #0f172a;padding:0;position:relative;vertical-align:middle;text-align:center}'
      + '.cell{position:relative;width:100%;height:100%;}'
      + '.blk{background:#111 !important;}'
      + '.ch{font-weight:900;font-size:1.05em;}'
      + '.sol .ch{color:#ef4444;}'
      + '.num{position:absolute;top:1px;left:3px;font-size:.58em;color:#0f172a}'
      + '.col{flex:1 1 320px}'
      + '.list h3{margin:8px 0 6px}'
      + 'ol.clues{margin:0;padding-left:20px}'
      + 'ol.clues li{margin:5px 0}';

    var html = '<!doctype html><html><head><title>' + title + '</title><meta charset="utf-8"><style>' + css + '</style></head><body>';
    html += '<h1>' + escapeHtml(title) + '</h1><div class="meta">Fill the crossword. Numbers appear in the upper-left of each starting square. ' + (withSolution ? 'Answers are shown in red.' : 'Use the clues below.') + '</div>';

    html += '<div class="wrap">';
    // Grid
    html += '<div class="col"><table class="grid">';
    for (var r = 0; r < size; r++) {
      html += '<tr>';
      for (var c = 0; c < size; c++) {
        var ch = data.grid[r][c];
        if (ch === "") {
          html += '<td class="blk"></td>';
        } else {
          var num = nums.numbers[r][c];
          html += '<td' + (withSolution ? ' class="sol"' : '') + '>';
          html += '<div class="cell">';
          if (num) html += '<span class="num">' + num + '</span>';
          html += '<span class="ch">' + (withSolution ? ch : '') + '</span>';
          html += '</div></td>';
        }
      }
      html += '</tr>';
    }
    html += '</table></div>';

    // Clue lists
    html += '<div class="col list">';
    // We don’t have natural clues—so we number the entries and show length.
    html += '<h3>Across</h3><ol class="clues">';
    for (var a = 0; a < nums.across.length; a++) {
      var ac = nums.across[a];
      html += '<li value="' + ac.num + '">(' + ac.len + ' letters) ________</li>';
    }
    html += '</ol><h3>Down</h3><ol class="clues">';
    for (var d = 0; d < nums.down.length; d++) {
      var dn = nums.down[d];
      html += '<li value="' + dn.num + '">(' + dn.len + ' letters) ________</li>';
    }
    html += '</ol>';

    // Optional: word bank to help
    html += '<div style="margin-top:10px;color:#475569"><b>Word Bank:</b><br/>';
    for (var i2 = 0; i2 < wk.words.length; i2++) { html += escapeHtml(wk.words[i2]) + (i2 < wk.words.length - 1 ? ', ' : ''); }
    html += '</div>';

    html += '</div>'; // /col list
    html += '</div>'; // /wrap
    html += '</body></html>';

    var wdw = window.open("", "_blank"); if (!wdw) { alert("Popup blocked."); return; }
    wdw.document.open(); wdw.document.write(html); wdw.document.close();
    setTimeout(function () { try { wdw.focus(); wdw.print(); } catch (e) { } }, 250);
  }

  // ---------- UI ----------
  var weekOptions = [];
  if (type === "spelling") {
    if (wordLists && wordLists.weeks) {
      for (var i = 0; i < wordLists.weeks.length; i++) { weekOptions.push(wordLists.weeks[i].week); }
    }
  } else {
    weekOptions = type === "history" ? histWeeks : sciWeeks;
  }

  return (
    <div className="qa-card sp-card animate-card print-center menu-area" style={{ maxWidth: 980, margin: "0 auto" }}>
      <div className="qa-card-head">
        <h2 className="qa-h2">🖨️ Print Center</h2>
      </div>

      <div className="qa-stack">
        <div className="qa-bar print-center-controls">
          <div>
            <div className="label">Type</div>
            <select
              className="sp-select"
              value={type}
              onChange={function (e) { setType(e.target.value); }}
            >
              <option value="history">History</option>
              <option value="science">Science</option>
              <option value="spelling">Spelling</option>
            </select>
          </div>

          <div>
            <div className="label">Week</div>
            <select
              className="sp-select"
              value={week}
              onChange={function (e) { setWeek(e.target.value); }}
            >
              {weekOptions && weekOptions.length ? weekOptions.map(function (w) {
                return <option key={String(w)} value={String(w)}>Week {w}</option>;
              }) : <option value="">No weeks</option>}
            </select>
          </div>

          {type !== "spelling" ? (
            <div style={{ alignSelf: "end" }}>
              <label className="sp-check">
                <input
                  type="checkbox"
                  checked={includeAnswers}
                  onChange={function () { setIncludeAnswers(!includeAnswers); }}
                />
                <span>Include Answer Key</span>
              </label>
            </div>
          ) : (
            <>
              <div>
                <div className="label">Worksheet</div>
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <label className="sp-check">
                    <input
                      type="checkbox"
                      checked={showWords}
                      onChange={function () { setShowWords(!showWords); }}
                    />
                    <span>Show words</span>
                  </label>
                  <label className="sp-check">
                    <input
                      type="checkbox"
                      checked={includeDefinitions}
                      onChange={function () { setIncludeDefinitions(!includeDefinitions); }}
                    />
                    <span>Include definitions</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="label">Word Search</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <label>Difficulty:&nbsp;
                    <select className="sp-select" value={wsDifficulty} onChange={function (e) { setWsDifficulty(e.target.value); }}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </label>
                  <label>Grid Size:&nbsp;
                    <input
                      className="sp-input-compact"
                      type="number" min="10" max="24" value={gridSize}
                      onChange={function (e) { setGridSize(e.target.value); }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="label">Crossword</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <label>Difficulty:&nbsp;
                    <select className="sp-select" value={cwDifficulty} onChange={function (e) { setCwDifficulty(e.target.value); }}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </label>
                </div>
              </div>

              <div style={{ alignSelf: "end" }}>
                <label className="sp-check">
                  <input
                    type="checkbox"
                    checked={includePuzzleSolutions}
                    onChange={function () { setIncludePuzzleSolutions(!includePuzzleSolutions); }}
                  />
                  <span>Show puzzle solutions</span>
                </label>
              </div>
            </>
          )}
        </div>

        <div className="qa-actions" style={{ flexWrap: "wrap", gap: 12 }}>
          {type === "spelling" ? (
            <>
              <button
                className="btn btn-neutral"
                onClick={function () { if (week) printSpelling(week, showWords, includeDefinitions); }}
                title="Worksheet with lines for spelling + definition + example."
              >
                Print Spelling Page
              </button>

              <button
                className="btn btn-primary"
                onClick={function () { if (week) printWordSearch(week, gridSize, wsDifficulty, includePuzzleSolutions); }}
              >
                Print Word Search
              </button>

              <button
                className="btn btn-primary"
                onClick={function () { if (week) printCrossword(week, cwDifficulty, includePuzzleSolutions); }}
              >
                Print Crossword
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-neutral"
                onClick={function () { if (week) printQuiz(type, week, false); }}
              >
                Print Questions Only
              </button>
              <button
                className="btn btn-primary"
                onClick={function () { if (week) printQuiz(type, week, includeAnswers); }}
              >
                Print with Answer Key
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
