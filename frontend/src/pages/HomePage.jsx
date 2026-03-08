import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import API from "../api.js"

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


const translations = {
  en: {
    appName: "Sereno",
    tagline: "Your quiet space to reflect",
    nav: { diary: "Diary", dashboard: "Mood", discoveries: "Discoveries" },
    write: "Write today's entry...",
    save: "Save Entry",
    deleteEntry: "Delete",
    moodWeek: "This Week",
    moodAll: "All Time",
    streak: "Day Streak",
    topMood: "Dominant Mood",
    entries: "Entries",
    aiTitle: "AI Discovery",
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
    placeholder: "What's on your mind today? Write freely, this is your space...",
    noEntries: "No entries yet. Start writing today.",
    toggleLang: "IT",
    bestMonth: "Best Month",
    keywords: "Keywords this week",
  },
  it: {
    appName: "Sereno",
    tagline: "Il tuo spazio tranquillo per riflettere",
    nav: { diary: "Diario", dashboard: "Umore", discoveries: "Scoperte" },
    write: "Scrivi il tuo pensiero di oggi...",
    save: "Salva",
    deleteEntry: "Elimina",
    moodWeek: "Questa Settimana",
    moodAll: "Sempre",
    streak: "Giorni di Fila",
    topMood: "Umore Dominante",
    entries: "Voci",
    aiTitle: "Scoperta AI",
    positive: "Positivo",
    neutral: "Neutro",
    negative: "Negativo",
    placeholder: "Cosa hai in mente oggi? Scrivi liberamente, questo è il tuo spazio...",
    noEntries: "Nessuna voce ancora. Inizia a scrivere oggi.",
    toggleLang: "EN",
    bestMonth: "Mese Migliore",
    keywords: "Parole chiave questa settimana",
  },
};

const mockEntries = [
  { id: 1, type: "diary", content: "Today was hard but I managed to do some coding. Small progress.", sentiment: "positive", sentiment_score: 0.72, keywords: "progress, coding, tired", created_at: "2024-03-06T09:00:00Z" },
  { id: 2, type: "ai_discovery", content: "Mindfulness-Based Cognitive Therapy resources for anxiety", sentiment: null, source_url: "https://www.mind.org.uk", source_title: "Mind UK — MBCT Guide", created_at: "2024-03-06T09:01:00Z" },
  { id: 3, type: "diary", content: "Felt anxious about the trip in August. My Italian feels so weak still.", sentiment: "negative", sentiment_score: 0.61, keywords: "anxiety, Italian, travel", created_at: "2024-03-05T10:30:00Z" },
  { id: 4, type: "diary", content: "Cleaned for 3 hours. Back hurts but I earned money. Proud of that.", sentiment: "positive", sentiment_score: 0.81, keywords: "work, proud, pain, money", created_at: "2024-03-04T15:00:00Z" },
  { id: 5, type: "ai_discovery", content: "Chronic pain and mental health connection — local resources in Veneto", sentiment: null, source_url: "https://example.com", source_title: "Sportello Salute Mentale — Treviso", created_at: "2024-03-04T15:01:00Z" },
  { id: 6, type: "diary", content: "Quiet day. Watched some Italian TV. Understood more than I expected.", sentiment: "neutral", sentiment_score: 0.55, keywords: "Italian, learning, quiet", created_at: "2024-03-03T18:00:00Z" },
  { id: 7, type: "diary", content: "Struggled today. Could not focus at all. Gave up on coding early.", sentiment: "negative", sentiment_score: 0.78, keywords: "focus, struggle, coding", created_at: "2024-03-02T12:00:00Z" },
];

const mockMoodData = [
  { day: "Mon", score: 0.3 },
  { day: "Tue", score: 0.55 },
  { day: "Wed", score: 0.78 },
  { day: "Thu", score: 0.61 },
  { day: "Fri", score: 0.81 },
  { day: "Sat", score: 0.45 },
  { day: "Sun", score: 0.72 },
];

const mockAllTimeData = [
  { month: "Sep", score: 0.42 },
  { month: "Oct", score: 0.51 },
  { month: "Nov", score: 0.38 },
  { month: "Dec", score: 0.60 },
  { month: "Jan", score: 0.55 },
  { month: "Feb", score: 0.67 },
  { month: "Mar", score: 0.72 },
];

const sentimentColor = (s) => s === "POSITIVE" ? "#4ade80" : s === "NEGATIVE" ? "#f87171" : "#facc15";
const sentimentDot = (s) => s === "POSITIVE" ? "🟢" : s === "NEGATIVE" ? "🔴" : "🟡";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const mood = score > 0.65 ? "positive" : score < 0.45 ? "negative" : "neutral";
    return (
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px 14px", fontSize: 13, color: "var(--text)" }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ color: sentimentColor(mood) }}>{Math.round(score * 100)}% {mood}</div>
      </div>
    );
  }
  return null;
};

// Helper: get start of week (Monday)
const getStartOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day); // adjust if Sunday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Days labels
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Helper: get month label from Date
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];



export default function Sereno() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("diary");
  const [entries, setEntries] = useState([]);
  const [moodData, setMoodData] = useState([]);
  const [allTimeData, setAllTimeData] = useState([]);
  const [userLocation, setUserLocation] = useState("");
  const [writing, setWriting] = useState("");
  const [moodRange, setMoodRange] = useState("week");
  const t = translations[lang];

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
    :root {
      --bg: ${dark ? "#0f0f13" : "#f8f6f1"};
      --card: ${dark ? "#1a1a22" : "#ffffff"};
      --card2: ${dark ? "#22222d" : "#f0ede6"};
      --text: ${dark ? "#e8e4dc" : "#2a2420"};
      --muted: ${dark ? "#6b6880" : "#9e9589"};
      --border: ${dark ? "#2e2e3a" : "#e8e3da"};
      --accent: ${dark ? "#a78bfa" : "#7c6fcd"};
      --accent2: ${dark ? "#34d399" : "#059669"};
      --neg: #f87171;
      --pos: #4ade80;
      --neu: #facc15;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }
    .app { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; max-width: 480px; margin: 0 auto; }
    .header { padding: 24px 20px 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .logo { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; letter-spacing: 2px; color: var(--text); }
    .tagline { font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
    .controls { display: flex; gap: 8px; align-items: center; }
    .toggle-btn { background: var(--card2); border: 1px solid var(--border); color: var(--muted); border-radius: 20px; padding: 6px 14px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
    .toggle-btn:hover { color: var(--text); border-color: var(--accent); }
    .logout-btn { background: none; border: 1px solid var(--border); color: var(--muted); border-radius: 20px; padding: 6px 14px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
    .logout-btn:hover { color: var(--neg); border-color: var(--neg); }
    .nav { display: flex; gap: 2px; padding: 0 20px 20px; }
    .nav-btn { flex: 1; background: none; border: none; padding: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; letter-spacing: 0.5px; }
    .nav-btn.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 500; }
    .content { flex: 1; padding: 0 20px 40px; }
    .write-box { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-bottom: 20px; }
    .write-box textarea { width: 100%; background: none; border: none; outline: none; color: var(--text); font-family: 'Cormorant Garamond', serif; font-size: 18px; line-height: 1.7; resize: none; min-height: 100px; }
    .write-box textarea::placeholder { color: var(--muted); font-style: italic; }
    .save-btn { background: var(--accent); color: white; border: none; border-radius: 10px; padding: 10px 20px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; float: right; margin-top: 8px; transition: opacity 0.2s; }
    .save-btn:hover { opacity: 0.85; }
    .ai-btn { color: var(--accent); border: none; border-radius: 10px; padding: 10px 20px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; float: right; margin-top: 8px; transition: opacity 0.2s; }
    .ai-btn:hover { opacity: 0.85; }
    .btn-group {
  display: flex;
    justify-content: flex-end;

  gap: 12px;
}
    .entry-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; margin-bottom: 12px; position: relative; transition: transform 0.15s; }
    .entry-card:hover { transform: translateY(-1px); }
    .entry-card.ai { background: var(--card2); border-left: 3px solid var(--accent); }
    .entry-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .entry-type { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); }
    .entry-type.ai { color: var(--accent); }
    .entry-date { font-size: 11px; color: var(--muted); }
    .entry-content { font-family: 'Cormorant Garamond', serif; font-size: 17px; line-height: 1.65; color: var(--text); }
    .entry-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
    .sentiment-pill { font-size: 11px; padding: 3px 10px; border-radius: 20px; background: var(--card2); color: var(--muted); display: flex; align-items: center; gap: 5px; }
    .keywords { font-size: 11px; color: var(--muted); font-style: italic; }
    .delete-btn { background: none; border: none; color: var(--muted); font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 4px 8px; border-radius: 6px; transition: all 0.2s; }
    .delete-btn:hover { color: var(--neg); background: ${dark ? "#2a1a1a" : "#fff0f0"}; }
    .source-link { font-size: 12px; color: var(--accent); text-decoration: none; display: block; margin-top: 6px; }
    .source-link:hover { text-decoration: underline; }
    .dashboard { display: flex; flex-direction: column; gap: 16px; }
    .stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 14px 12px; text-align: center; }
    .stat-value { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 600; color: var(--accent); }
    .stat-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    .chart-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 18px; }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .chart-title { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 400; }
    .range-tabs { display: flex; gap: 4px; }
    .range-tab { background: none; border: 1px solid var(--border); color: var(--muted); border-radius: 8px; padding: 4px 12px; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
    .range-tab.active { background: var(--accent); color: white; border-color: var(--accent); }
    .keywords-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; }
    .keywords-title { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .keyword-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .keyword-tag { background: var(--card2); border: 1px solid var(--border); color: var(--text); border-radius: 20px; padding: 5px 14px; font-size: 12px; }
    .empty { text-align: center; color: var(--muted); font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 18px; padding: 40px 0; }
    .disc-entry { background: var(--card); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: 16px; padding: 16px; margin-bottom: 12px; }
    .disc-title { font-family: 'Cormorant Garamond', serif; font-size: 17px; color: var(--text); margin-bottom: 4px; }
  `;


  const fetchEntries = async () => {

    try {
      const res = await API.get("/entries");
      const data = res.data
        .filter(e => !e.deleted_at)

      const sorted = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
      setEntries(sorted);
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    // Filter diary entries for current week
    const startOfWeek = getStartOfWeek();
    const weekMood = weekDays.map((day, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);

      const dayEntries = entries.filter(
        (e) =>
          e.entry_type === "DIARY" &&
          new Date(e.created_at).toDateString() === dayDate.toDateString()
      );
      console.log(dayEntries)

      const avgScore =
        dayEntries.length > 0
          ? dayEntries.reduce((sum, e) => sum + (e.sentiment_score || 0), 0) /
            dayEntries.length
          : 0;

      return { day, score: avgScore };
    });

    setMoodData(weekMood);
  }, [entries]);


  useEffect(() => {
    // Filter only diary entries
    const diaryEntries = entries.filter(e => e.entry_type === "DIARY");

    // Group by month-year
    const monthMap = {};
    diaryEntries.forEach(e => {
      const d = new Date(e.created_at);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`; // e.g., "2026-2" for March 2026
      if (!monthMap[monthKey]) monthMap[monthKey] = [];
      monthMap[monthKey].push(e.sentiment_score || 0);
    });

    // Convert to array of { month: "Mar", score: 0.72 }
    const allTimeMood = Object.entries(monthMap)
      .map(([key, scores]) => {
        const [year, monthIndex] = key.split("-").map(Number);
        const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        return { month: monthLabels[monthIndex], year, score: avgScore };
      })
      // Sort by chronological order
      .sort((a, b) => a.year - b.year || monthLabels.indexOf(a.month) - monthLabels.indexOf(b.month));

    setAllTimeData(allTimeMood);
  }, [entries]);
  console.log(allTimeData)


  // Helper to get user's coordinates as a Promise
function getCurrentPositionAsync(options = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by this browser."));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    }
  });
}

async function fetchUserLocation() {
  try {
    const position = await getCurrentPositionAsync({
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });

    const { latitude, longitude } = position.coords;
    console.log("User's coordinates:", latitude, longitude);

    // Reverse geocoding with OpenStreetMap Nominatim
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
    const data = await res.json();

    const city = data.address.city || data.address.town || data.address.village || data.address.state;
    const country = data.address.country;

    const locationString = `${city}, ${country}`;
    console.log("User's location:", locationString);

    // Example: set state if using React
    setUserLocation(locationString);

  } catch (error) {
    console.error("Error getting location:", error.message);
  }
}

  useEffect(() =>{
    fetchUserLocation()
  }, [])




  const diaryEntries = entries.filter(e => e.entry_type === "DIARY");
  const discoveries = entries.filter(e => e.entry_type === "AI_DISCOVERY");
  const dominantMood = diaryEntries.filter(e => e.sentiment === "POSITIVE").length >= diaryEntries.length / 2 ? t.positive : t.negative;
const allKeywords = [
  ...new Set(
    diaryEntries.flatMap(e => (e.keywords || []).map(k => k.keyword))
  )
].slice(0, 8);

  const handleSave = async () => {
    if (!writing.trim()) return;
    try {
      const res = await API.post("/entries", {
        content: writing,
        entry_type: "DIARY"
      })
      const savedEntry = res.data;
      setEntries([savedEntry, ...entries]);
      setWriting("");
    } catch (err) {
      console.error(err)
    }


  };

  const handleAI = async () => {
    try {
      const res = await API.post("/ai", {location: userLocation})
      setEntries(prev => [res.data, ...prev])
    } catch (err) {
      console.error(err)
    }
  }

const handleDelete = async (id) => {
  if (!id) return;

  try {
    const res = await API.delete(`/entries/${id}`);
    // Filter out the deleted entry from state
    setEntries(prev => prev.filter(e => e.id !== id));
    console.log(`Entry ${id} soft-deleted.`);
  } catch (err) {
    console.error("Error deleting entry:", err.message);
  }
};


  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "it" ? "it-IT" : "en-GB", { day: "numeric", month: "short" });
  };

  console.log(entries)
  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div>
            <div className="logo">{t.appName}</div>
            <div className="tagline">{t.tagline}</div>
          </div>
          <div className="controls">
            <button className="toggle-btn" onClick={() => setLang(lang === "en" ? "it" : "en")}>{t.toggleLang}</button>
            <button className="toggle-btn" onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
            <button className="logout-btn" onClick={handleLogout}>{lang === "it" ? "Esci" : "Logout"}</button>

          </div>
        </div>

        <div className="nav">
          {["diary", "dashboard", "discoveries"].map(key => (
            <button key={key} className={`nav-btn ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>
              {t.nav[key]}
            </button>
          ))}
        </div>

        <div className="content">
          {tab === "diary" && (
            <>
              <div className="write-box">
                <textarea
                  placeholder={t.placeholder}
                  value={writing}
                  onChange={e => setWriting(e.target.value)}
                  rows={4}
                />
                <div className="btn-group">
                  <button className="save-btn" onClick={handleSave}>{t.save}</button>
                  <button className="ai-btn" onClick={handleAI}>Suggest</button>

                </div>

                <div style={{ clear: "both" }} />
              </div>
              {entries.length === 0 && <div className="empty">{t.noEntries}</div>}
              {entries.map(entry => (
                <div key={entry.id} className={`entry-card ${entry.entry_type === "AI_DISCOVERY" ? "ai" : ""}`}>
                  <div className="entry-meta">
                    <span className={`entry-type ${entry.entry_type === "AI_DISCOVERY" ? "ai" : ""}`}>
                      {entry.entry_type === "AI_DISCOVERY" ? `✦ ${t.aiTitle}` : "● " + (lang === "it" ? "Diario" : "Diary")}
                    </span>
                    <span className="entry-date">{formatDate(entry.created_at)}</span>
                  </div>

                  {entry.entry_type === "AI_DISCOVERY" ? 
                  <div className="entry-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {entry.content}
                    </ReactMarkdown>
                    </div> :
                                  <div className="entry-content">{entry.content}</div>

                }
                   


                  <div className="entry-footer">
                    {entry.sentiment && (
                      <span className="sentiment-pill">
                        {sentimentDot(entry.sentiment)} {t[entry.sentiment]}
                      </span>
                    )}
                    {entry.keywords && <span className="keywords">{entry.keywords.map((w) => w.keyword + ", ")}</span>}
                    <button className="delete-btn" onClick={() => handleDelete(Number(entry.id))}>{t.deleteEntry}</button>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "dashboard" && (
            <div className="dashboard">
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-value">5</div>
                  <div className="stat-label">{t.streak}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value" style={{ fontSize: 16, paddingTop: 6, color: sentimentColor(dominantMood === t.positive ? "positive" : "negative") }}>{dominantMood}</div>
                  <div className="stat-label">{t.topMood}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{diaryEntries.length}</div>
                  <div className="stat-label">{t.entries}</div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title">{moodRange === "week" ? t.moodWeek : t.moodAll}</div>
                  <div className="range-tabs">
                    <button className={`range-tab ${moodRange === "week" ? "active" : ""}`} onClick={() => setMoodRange("week")}>{t.moodWeek}</button>
                    <button className={`range-tab ${moodRange === "all" ? "active" : ""}`} onClick={() => setMoodRange("all")}>{t.moodAll}</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={moodRange === "week" ? moodData : allTimeData}>
                    <XAxis dataKey={moodRange === "week" ? "day" : "month"} tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 1]} hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: "var(--accent)", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="keywords-card">
                <div className="keywords-title">{t.keywords}</div>
                <div className="keyword-tags">
                  {allKeywords.map(k => <span key={k} className="keyword-tag">{k}</span>)}
                </div>
              </div>
            </div>
          )}

          {tab === "discoveries" && (
            <>
              {discoveries.length === 0 && <div className="empty">{t.noEntries}</div>}
              {discoveries.map(entry => (
                <div key={entry.id} className="disc-entry">
                  <div className="entry-meta">
                    <span className="entry-type ai">✦ {t.aiTitle}</span>
                    <span className="entry-date">{formatDate(entry.created_at)}</span>
                  </div>
                  {/* <div className="disc-title">{entry.content}</div> */}

<div className="disc-title">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {entry.content}
                    </ReactMarkdown>
                    </div>

                  {entry.source_title && (
                    <a className="source-link" href={entry.source_url} target="_blank" rel="noreferrer">↗ {entry.source_title}</a>
                  )}
                  <div className="entry-footer">
                    <button className="delete-btn" onClick={() => handleDelete(entry.id)}>{t.deleteEntry}</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}