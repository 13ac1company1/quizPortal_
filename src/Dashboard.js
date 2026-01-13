import React, { useEffect, useState } from "react";
import { getWeeks } from "./quizLoader.js";
import { exportSubjectPayload, importSubjectPayload, clearSubject } from "./subjectStorage.js";

function keyForProgress(s,w){return "quiz:"+s+":"+String(w);}
function keyForResult(s,w){return "quizResult:"+s+":"+String(w);}
function loadResult(s,w){try{return JSON.parse(localStorage.getItem(keyForResult(s,w))||"null");}catch(e){return null;}}
function loadProgress(s,w){try{return JSON.parse(localStorage.getItem(keyForProgress(s,w))||"null");}catch(e){return null;}}
function loadHistory(s,w){try{return JSON.parse(localStorage.getItem("quizHistory:"+s+":"+String(w))||"[]");}catch(e){return [];}}

export default function Dashboard({ subject, onContinue }){
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(function(){
    var mounted=true; setLoading(true);
    getWeeks(subject,"./").then(function(ws){
      if(!mounted) return;
      var data = ws.map(function(w){
        var res = loadResult(subject,w);
        var prog = loadProgress(subject,w);
        var hist = loadHistory(subject,w);
        return {
          week:w,
          title: (res && res.title) || (prog && prog.title) || ("Week "+w),
          best: res?res.pct:null,
          lastDurationMs: res?res.durationMs:null,
          hasProgress: !!(prog && prog.started && !prog.finished),
          history: hist
        };
      }).sort(function(a,b){return a.week-b.week;});
      setRows(data); setLoading(false);
    }).catch(function(e){console.error(e); setRows([]); setLoading(false);});
    return function(){mounted=false};
  },[subject]);

  if(loading) return <div className="muted">Loading dashboard…</div>;

  return (
    <div className="qa-stack">
      <div className="qa-card sp-card">
        <div className="qa-actions">
          <button
            className="btn btn-neutral"
            onClick={function(){
              try{
                var data = exportSubjectPayload(subject);
                var blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a");
                var ts = new Date().toISOString().slice(0,10).replace(/-/g,"");
                a.href = url; a.download = subject+"-quiz-progress-"+ts+".json";
                document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
              }catch(e){ alert("Export failed: "+(e && e.message ? e.message : String(e))); }
            }}
          >Export {subject} Progress</button>

          <label className="btn btn-primary" style={{ cursor:"pointer" }}>
            Import {subject} Progress
            <input type="file" accept="application/json" className="hidden"
              onChange={async function(e){
                var file = e.target.files && e.target.files[0];
                if(!file) return;
                try{
                  var text = await file.text();
                  var payload = JSON.parse(text);
                  importSubjectPayload(payload, subject);
                  alert("Import complete. Refreshing…");
                  window.location.reload();
                }catch(err){ alert("Import failed: "+(err && err.message ? err.message : String(err))); }
                finally { e.target.value = ""; }
              }}
            />
          </label>

          <button
            className="btn btn-danger"
            onClick={function () {
              if (!window.confirm('This will permanently delete ALL saved data for "'+subject+'". Proceed?')) return;
              try {
                var n = clearSubject(subject);
                alert("Deleted "+n+" item(s) for subject \""+subject+"\". Reloading…");
                window.location.reload();
              } catch (e) {
                alert("Clear failed: " + (e && e.message ? e.message : String(e)));
              }
            }}
          >
            Clear All Data
          </button>
        </div>
      </div>

      <div className="qa-card sp-card">
        <div className="qa-table-wrap">
          <table className="qa-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Title</th>
                <th>Best Score</th>
                <th>Last Time</th>
                <th>Continue</th>
                <th>History</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(function(r){
                var lastTime = r.lastDurationMs!=null ? (function(){var m=Math.floor(r.lastDurationMs/60000), s=Math.floor((r.lastDurationMs%60000)/1000); return m+"m "+s+"s";})() : "—";
                return (
                  <tr key={r.week}>
                    <td>Week {r.week}</td>
                    <td>{r.title}</td>
                    <td>{r.best!=null ? <span className="ok">{r.best}%</span> : <span className="muted">—</span>}</td>
                    <td>{lastTime}</td>
                    <td>{r.hasProgress ? <button onClick={function(){onContinue(r.week);}} className="btn btn-primary">Continue</button> : <span className="muted">No progress</span>}</td>
                    <td>
                      {r.history && r.history.length ? (
                        <details>
                          <summary className="muted">View ({r.history.length})</summary>
                          <div className="qa-hist">
                            <ol>
                              {r.history.slice().reverse().map(function(h,i){
                                var m=Math.floor((h.durationMs||0)/60000), s=Math.floor(((h.durationMs||0)%60000)/1000);
                                var when = h.at ? new Date(h.at).toLocaleString() : "—";
                                return <li key={i}><b>{h.pct}%</b> — {m}m {s}s <span className="muted">({when})</span></li>
                              })}
                            </ol>
                          </div>
                        </details>
                      ) : <span className="muted">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
