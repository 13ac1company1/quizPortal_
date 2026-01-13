import React, { useEffect, useState } from "react";

export default function PerformanceChart() {
  const [history, setHistory] = useState([]);

  useEffect(function () {
    try {
      var parsed = JSON.parse(localStorage.getItem("performanceHistory"));
      if (Array.isArray(parsed)) {
        parsed.sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); });
        setHistory(parsed);
      }
    } catch (e) {}
  }, []);

  if (!history.length) {
    return <div className="muted">No spelling quiz attempts yet.</div>;
  }

  var byWeek = {};
  for (var i = 0; i < history.length; i++) {
    var wk = String(history[i].week);
    if (!byWeek[wk]) byWeek[wk] = [];
    byWeek[wk].push(history[i]);
  }
  var attemptNumberByEntry = new Map();
  var weekKeys = Object.keys(byWeek);
  for (var j = 0; j < weekKeys.length; j++) {
    var key = weekKeys[j];
    var ordered = byWeek[key]
      .slice()
      .sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); });
    for (var k = 0; k < ordered.length; k++) {
      attemptNumberByEntry.set(ordered[k], k + 1);
    }
  }

  return (
    <div>
      <h3 className="qa-h3">Spelling Performance</h3>
      <ol className="qa-review">
        {history.map(function (h, idx) {
          var when = h.date ? new Date(h.date).toLocaleString() : "";
          var wk = String(h.week);
          var weekEntries = byWeek[wk] || [];
          var attemptTotal = weekEntries.length || 1;
          var attemptIndex = attemptNumberByEntry.get(h);
          if (typeof attemptIndex !== "number") {
            attemptIndex = typeof h.attempt === "number" ? h.attempt : 1;
          }
          var total = typeof h.total === "number" ? h.total : null;
          var scoreDisplay = total ? (h.score + " / " + total) : String(h.score);
          return (
            <li key={idx} className="qa-review-item">
              <div className="qa-review-head">
                <span className="muted">Week {h.week} - Attempt {attemptIndex} of {attemptTotal}</span>
              </div>
              <div className="qa-p"><b>Score:</b> {scoreDisplay}</div>
              <div className="muted">{when}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
