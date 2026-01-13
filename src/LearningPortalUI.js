// LearningPortalUI.js
import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search as SearchIcon, Sparkles } from "lucide-react";

// ----- Data (2x YouTube + Wikipedia + Map/Diagram when relevant) -----
const SAMPLE_DATA = {
  "weeks": [
    {
      "week": 1,
      "subject": [
        {
          "history": {
            "topic": "The Nation Up To 1850",
            "urls": [
              "https://www.youtube.com/watch?v=RNftCCwAol0",
              "https://www.youtube.com/watch?v=6ndGcZXeO_o",
              "https://en.wikipedia.org/wiki/History_of_the_United_States_(1815%E2%80%931849)",
              "https://www.google.com/search?q=The+Nation+Up+To+1850&hl=en&authuser=0"
            ]
          },
          "Science": {
            "topic": "Types of Matter in the World",
            "urls": [
              "https://www.youtube.com/watch?v=ELchwUIlWa8",
              "https://www.youtube.com/watch?v=24Yromifcss",
              "https://en.wikipedia.org/wiki/Matter",
              "https://www.google.com/search?q=states+of+matter+diagram&tbm=isch"
            ]
          }
        }
      ]
    },
    {
      "week": 2,
      "subject": [
        {
          "history": {
            "topic": "Colonial Government and Power of the People",
            "urls": [
              "https://www.youtube.com/watch?v=vd0fMpAIs1s",
              "https://www.youtube.com/watch?v=rAOe2j4jqJA",
              "https://en.wikipedia.org/wiki/Colonial_government_in_the_Thirteen_Colonies",
              "https://www.google.com/search?q=13+Colonies+map&hl=en&authuser=0"
            ]
          },
          "Science": {
            "topic": "Plant and Animal Anatomy Structures",
            "urls": [
              "https://www.youtube.com/watch?v=qULkjDccCeY",
              "https://www.youtube.com/watch?v=O3YBF8Sz2Ic",
              "https://en.wikipedia.org/wiki/Organ_(biology)",
              "https://www.google.com/search?q=cell+diagram+for+kids&tbm=isch"
            ]
          }
        }
      ]
    },
    {
      "week": 3,
      "subject": [
        {
          "history": {
            "topic": "Early Exploration of the Americas",
            "urls": [
              "https://www.youtube.com/watch?v=a8hDKU_bAec",
              "https://www.youtube.com/watch?v=kOUfsOCgWlI",
              "https://en.wikipedia.org/wiki/Exploration_of_North_America",
              "https://www.google.com/search?q=age+of+exploration+routes+map&tbm=isch"
            ]
          },
          "Science": {
            "topic": "Movement of Water",
            "urls": [
              "https://www.youtube.com/watch?v=TWb4KlM2vts",
              "https://www.youtube.com/watch?v=vD-ZwMjRDPU",
              "https://en.wikipedia.org/wiki/Water_cycle",
              "https://www.google.com/search?q=water+cycle+diagram&tbm=isch"
            ]
          }
        }
      ]
    },
    {
      "week": 4,
      "subject": [
        {
          "history": {
            "topic": "American Indians and Settlers",
            "urls": [
              "https://www.youtube.com/watch?v=uxNDKlh-Vjo",
              "https://www.youtube.com/watch?v=Q7StpIJ2Zy0",
              "https://en.wikipedia.org/wiki/Native_Americans_in_the_United_States",
              "https://www.google.com/search?q=Native+American+tribes+map"
            ]
          },
          "Science": {
            "topic": "Energy from the Sun and How it Heats the Earth",
            "urls": [
              "https://www.youtube.com/watch?v=9D05ej8u-gU",
              "https://youtu.be/6FB0rDsR_rc",
              "https://en.wikipedia.org/wiki/Sunlight",
              "https://www.google.com/search?q=solar+radiation+diagram&tbm=isch"
            ]
          }
        }
      ]
    },
    {
      "week": 5,
      "subject": [
        {
          "history": {
            "topic": "Political, Social, Religious & Economic of Colonial Era",
            "urls": [
              "https://www.youtube.com/watch?v=1j7lovGzYL4",
              "https://www.youtube.com/watch?v=kne4gkaIVys",
              "https://en.wikipedia.org/wiki/Colonial_history_of_the_United_States",
              "https://www.google.com/search?q=colonial+america+regions+map&hl=en&authuser=0"
            ]
          },
          "Science": {
            "topic": "Solar System Planets that Orbit the Sun",
            "urls": [
              "https://www.youtube.com/watch?v=libKVRa01L8",
              "https://www.youtube.com/watch?v=SeC22-94PMw",
              "https://en.wikipedia.org/wiki/Solar_System",
              "https://www.google.com/search?q=solar+system+diagram+labeled&tbm=isch"
            ]
          }
        }
      ]
    },
    {
      "week": 6,
      "subject": [
        {
          "history": {
            "topic": "American Revolution",
            "urls": [
              "https://www.youtube.com/watch?v=3EiSymRrKI4",
              "https://www.youtube.com/watch?v=Eytc9ZaNWyc",
              "https://en.wikipedia.org/wiki/American_Revolution",
              "https://www.google.com/search?q=american+revolution+battles+map&hl=en&authuser=0"
            ]
          },
          "Science": {}
        }
      ]
    },
    {
      "week": 7,
      "subject": [
        {
          "history": {
            "topic": "Development of the Constitution",
            "urls": [
              "https://www.youtube.com/watch?v=bO7FQsCcbD8",
              "https://www.youtube.com/watch?v=lrk4oY7UxpQ&list=PL8dPuuaLjXtOfse2ncvffeelTrqvhrz8H",
              "https://en.wikipedia.org/wiki/Constitution_of_the_United_States",
              "https://www.google.com/search?q=Development+of+the+Constitution"
            ]
          },
          "Science": {}
        }
      ]
    },
    {
      "week": 8,
      "subject": [
        {
          "history": {
            "topic": "Immigration and Settlement (1789–1800)",
            "urls": [
              "https://www.youtube.com/watch?v=Xo-aHleRBRo",
              "https://www.youtube.com/watch?v=MWbHkHMKncI",
              "https://en.wikipedia.org/wiki/Immigration_to_the_United_States",
              "https://www.google.com/search?q=major+US+ports+18th+century"
            ]
          },
          "Science": {}
        }
      ]
    }
  ]
};

// ----- Label utility (maps/diagrams/YouTube/Wikipedia) -----
function labelFor(url, topic, index) {
  try {
    var u = new URL(url);
    var host = u.hostname.replace("www.", "");
    var full = url.toLowerCase();
    var path = u.pathname.toLowerCase();

    if (full.indexOf("/maps") !== -1 || full.indexOf("maps") !== -1 || full.indexOf("place/") !== -1) {
      return "Map – " + topic;
    }
    if (full.indexOf("diagram") !== -1 || full.indexOf("routes") !== -1 || full.indexOf("tbm=isch") !== -1 || /\.(png|jpg|jpeg|svg|webp)$/.test(path)) {
      return "Diagram – " + topic;
    }
    if (host.indexOf("youtube.com") !== -1 || host.indexOf("youtu.be") !== -1) {
      var isPlaylist = (u.searchParams && u.searchParams.has("list")) || path.indexOf("/playlist") !== -1;
      var n = index + 1;
      return isPlaylist ? "YouTube Playlist – " + topic : "YouTube Video " + n + " – " + topic;
    }
    if (host.indexOf("wikipedia.org") !== -1) {
      return "Wikipedia – " + topic;
    }
    return host + " – " + topic;
  } catch (e) {
    return "Link – " + topic;
  }
}

// ----- Topic Card (uses QuizApp.css classes; subjects STACKED) -----
function TopicCard(props) {
  var title = props.title;
  var topic = props.topic;
  var urls = props.urls;
  var hasUrls = Array.isArray(urls) && urls.length > 0;

  return (
    <div className="qa-card">
      <div className="qa-card-head">
        <h3 className="qa-h3 graffiti neon-pulse" title={title}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={20} /> {title}
          </span>
        </h3>
      </div>
      <p className="qa-subtitle">{topic || ""}</p>

      {hasUrls ? (
        <ul className="chip-wrap">
          {urls.map(function (u, i) {
            return (
              <li key={String(u) + i}>
                <a
                  href={u}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="chip"
                  title={u}
                >
                  {labelFor(u, topic || "", i)}
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="qa-subtitle">No links yet.</p>
      )}
    </div>
  );
}

// ----- Collapsible Week Section (controlled: no internal state) -----
function WeekSection(props) {
  var week = props.week;
  var subjects = props.subjects;
  var open = props.open;
  var onToggle = props.onToggle;

  var subjObj = Array.isArray(subjects) && subjects.length > 0 && subjects[0] ? subjects[0] : {};
  var entries = Object.keys(subjObj).map(function (k) { return [k, subjObj[k]]; });

  return (
    <div className="qa-card">
      <div className="qa-card-head">
        <h2 className="qa-h2">Week {week}</h2>
        <button
          className="btn btn-primary btn-shimmer"
          onClick={function () { onToggle(week); }}
          aria-expanded={open ? "true" : "false"}
          aria-controls={"week-" + week}
        >
          {open ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              Collapse <ChevronUp size={18} />
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              Expand <ChevronDown size={18} />
            </span>
          )}
        </button>
      </div>

      {open ? (
        <div id={"week-" + week} className="qa-stack">
          {/* STACKED subjects: one after another */}
          {entries.map(function (pair) {
            var subjectName = pair[0];
            var data = pair[1];
            var t = data && typeof data.topic === "string" ? data.topic : "";
            var urls = data && Array.isArray(data.urls) ? data.urls : [];
            return (
              <TopicCard
                key={subjectName}
                title={String(subjectName)}
                topic={t}
                urls={urls}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// ----- Main UI (Accordion behavior: only one week open at a time) -----
export default function LearningPortalUI(props) {
  var data = props && props.data ? props.data : SAMPLE_DATA;

  // start with all collapsed
  var s = useState(null); // openWeek: null | number
  var openWeek = s[0];
  var setOpenWeek = s[1];

  var qstate = useState("");
  var query = qstate[0];
  var setQuery = qstate[1];

  var filteredWeeks = useMemo(function () {
    if (!data || !Array.isArray(data.weeks)) return [];
    var rawWeeks = data.weeks;

    if (String(query).trim() === "") return rawWeeks;

    var q = String(query).toLowerCase();
    return rawWeeks
      .map(function (w) {
        var arr = Array.isArray(w.subject) ? w.subject : [];
        var subjects = arr
          .map(function (obj) {
            var out = {};
            var keys = Object.keys(obj || {});
            for (var i = 0; i < keys.length; i++) {
              var k = keys[i];
              var v = obj[k];
              var topic = v && typeof v.topic === "string" ? v.topic.toLowerCase() : "";
              if (String(k).toLowerCase().indexOf(q) !== -1 || topic.indexOf(q) !== -1) {
                out[k] = v;
              }
            }
            return Object.keys(out).length ? out : null;
          })
          .filter(function (x) { return !!x; });
        return subjects.length ? { week: w.week, subject: subjects } : null;
      })
      .filter(function (x) { return !!x; });
  }, [data, query]);

  function handleToggle(weekNumber) {
    // if clicking the currently open one, close it; otherwise open the new and close others
    setOpenWeek(function (curr) {
      return curr === weekNumber ? null : weekNumber;
    });
  }

  return (
    <div className="qa-container">
      <div className="qa-inner">
        <header className="qa-stack">
          <h1 className="qa-title graffiti neon-pulse">5th Grade Learning Portal</h1>

          <div className="qa-card">
            <div className="qa-flex">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <SearchIcon size={20} />
                <label htmlFor="lp-search" className="qa-h3" style={{ margin: 0, fontSize: "1.1em" }}>
                  Search
                </label>
              </div>
              <input
                id="lp-search"
                value={query}
                onChange={function (e) { setQuery(e.target.value); }}
                placeholder="Search subjects or topics (e.g., Revolution, planets, matter)"
                className="sp-input-compact"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </header>

        <main className="qa-stack" style={{ marginTop: 18 }}>
          {Array.isArray(filteredWeeks) && filteredWeeks.length > 0 ? (
            filteredWeeks.map(function (w) {
              return (
                <WeekSection
                  key={w.week}
                  week={w.week}
                  subjects={w.subject}
                  open={openWeek === w.week}
                  onToggle={handleToggle}
                />
              );
            })
          ) : (
            <div className="qa-card">
              <p className="qa-subtitle">No matches. Try a different search.</p>
            </div>
          )}
        </main>

        <footer className="qa-stack" style={{ marginTop: 22 }}>
          <div className="qa-card">
            <div className="qa-flex">
              <span className="qa-subtitle">Built with ❤️😁</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
