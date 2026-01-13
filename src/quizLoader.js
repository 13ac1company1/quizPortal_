// Fetch & normalize weekly quiz data from /public JSONs

export async function getWeeks(subject, basePath) {
  var path = resolveJsonPath(subject, basePath);
  var data = await fetchJson(path);
  var weeks = [];
  if (data && data.weeks && Array.isArray(data.weeks)) {
    for (var i = 0; i < data.weeks.length; i++) {
      var w = data.weeks[i];
      if (w && typeof w.week !== "undefined") weeks.push(w.week);
    }
  }
  weeks.sort(function (a, b) { return a - b; });
  return weeks;
}

export async function loadWeek(subject, week, basePath) {
  var path = resolveJsonPath(subject, basePath);
  var data = await fetchJson(path);
  if (!data || !Array.isArray(data.weeks)) throw new Error("Invalid JSON for subject: " + subject);

  var found = null;
  for (var i = 0; i < data.weeks.length; i++) {
    if (Number(data.weeks[i].week) === Number(week)) { found = data.weeks[i]; break; }
  }
  if (!found) throw new Error("Week not found: " + week);

  var normalized = [];
  for (var j = 0; j < found.questions.length; j++) {
    var q = found.questions[j];
    var choices = q.choices || {};
    normalized.push({
      id: q.id,
      q: q.q,
      answer: q.answer,
      choices: { a: choices.a, b: choices.b, c: choices.c, d: choices.d }
    });
  }

  return { title: found.title, week: found.week, questions: normalized };
}

export function toOptions(question, shuffle) {
  var opts = [
    { key: "a", label: question.choices.a },
    { key: "b", label: question.choices.b },
    { key: "c", label: question.choices.c },
    { key: "d", label: question.choices.d }
  ];
  if (shuffle) {
    var seed = hashCode(String(question.id || ""));
    for (var i = opts.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      var j = Math.floor((seed / 233280) * (i + 1));
      var tmp = opts[i]; opts[i] = opts[j]; opts[j] = tmp;
    }
  }
  return opts;
}

export function grade(questions, userAnswers) {
  var correct = 0, details = [];
  for (var i = 0; i < questions.length; i++) {
    var q = questions[i];
    var chosen = userAnswers[q.id] || null;
    var ok = chosen === q.answer;
    if (ok) correct++;
    details.push({ id: q.id, chosen: chosen, correct: q.answer, isCorrect: ok });
  }
  return { correct: correct, total: questions.length, details: details };
}

function resolveJsonPath(subject, basePath) {
  var file = subject.toLowerCase() === "science" ? "science.json" : "history.json";
  if (!basePath) basePath = "./";
  return basePath.replace(/\/+$|\/+(?=\/)/g, "").replace(/\/$/, "") + "/" + file;
}

async function fetchJson(path) {
  var res = await fetch(path, { cache: "no-store" });
  var text = await res.text();
  if (!text || text.trim().charAt(0) !== "{") {
    throw new Error("Expected JSON but got non-JSON content from " + path);
  }
  try { return JSON.parse(text); }
  catch (e) { throw new Error("Invalid JSON at " + path + ": " + e.message); }
}

function hashCode(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
