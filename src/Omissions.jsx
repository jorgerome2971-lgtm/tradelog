import { useState, useEffect } from "react";

/* ============================================================
   THE LEDGER OF OMISSIONS - Montecristo Project
   The valid setups you SAW but did NOT take. The trades that
   never happened - the invisible half of the journal.
   Self-contained file: src/Omissions.jsx. App.jsx imports it.
   Needs the 'omissions' table (see omissions_setup.sql).
   ============================================================ */

const C = {
  bg: "#0a0a0a", panel: "#141414", panel2: "#1c1c1c", border: "#2a2a2a",
  accent: "#c6f531", gold: "#f0b429", green: "#c6f531", red: "#f63b3b",
  muted: "#5a5a5a", text: "#e8e8e8", dim: "#808080",
};

function Inp({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "Inter, sans-serif" }} />
    </div>
  );
}

function Sel({ label, value, onChange, options, placeholder = "-" }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "Inter, sans-serif" }}>
        <option value="">{placeholder}</option>
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, color = C.accent, ghost = false, danger = false, full = false, disabled = false }) {
  const bg = danger ? C.red : ghost ? "transparent" : color;
  const col = danger ? "#fff" : ghost ? color : "#000";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: "9px 18px", background: bg, color: col, border: ghost ? `1px solid ${color}44` : "none", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, width: full ? "100%" : "auto", fontFamily: "Inter, sans-serif" }}>
      {children}
    </button>
  );
}

function Tag({ children, color = C.dim }) {
  return <span style={{ fontSize: 9, padding: "2px 7px", background: C.border, borderRadius: 3, color, letterSpacing: 1 }}>{children}</span>;
}

function Empty({ text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "80px 20px", color: C.muted }}>
      <div style={{ fontSize: 32, opacity: 0.3 }}>🎣</div>
      <div style={{ fontSize: 11, letterSpacing: 2 }}>{text}</div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div onMouseDown={e => e.stopPropagation()} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, width: "min(580px,100%)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, letterSpacing: 3 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer" }}>X</button>
        </div>
        <div onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()} style={{ padding: "20px 22px", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function MicButton({ onText, lang = "es-ES" }) {
  const [listening, setListening] = useState(false);
  const [recRef] = useState(() => ({ r: null }));
  const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  if (!SR) return null;
  const toggle = () => {
    if (listening && recRef.r) { recRef.r.stop(); return; }
    const r = new SR(); r.lang = lang; r.continuous = true; r.interimResults = false;
    r.onresult = (e) => { let txt = ""; for (let i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) txt += e.results[i][0].transcript; } if (txt) onText(txt.trim()); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    try { r.start(); recRef.r = r; setListening(true); } catch (err) { setListening(false); }
  };
  return (
    <button type="button" onClick={toggle} title="Dictar por voz" style={{ background: listening ? C.accent : C.bg, color: listening ? C.bg : C.accent, border: `1px solid ${C.accent}`, borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
      {listening ? "● Recording…" : "🎤 Speak"}
    </button>
  );
}

function TA({ label, value, onChange, placeholder, rows, color }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ fontSize: 9, color: color || C.dim, letterSpacing: 2 }}>{label}</div>
        <MicButton onText={t => onChange((value ? value + " " : "") + t)} />
      </div>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows || 3}
        style={{ width: "100%", background: C.bg, border: `1px solid ${color ? color + "44" : C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "Inter, sans-serif", resize: "vertical" }} />
    </div>
  );
}

// -- Reference data ------------------------------------------------------------
const OM_PATTERNS = [
  { value: "bull_flag", label: "Bull Flag" },
  { value: "bear_flag", label: "Bear Flag" },
  { value: "symmetrical_triangle", label: "Symmetrical Triangle" },
  { value: "expanding_triangle", label: "Expanding Triangle" },
  { value: "ascending_channel", label: "Ascending Channel" },
  { value: "descending_channel", label: "Descending Channel" },
  { value: "rising_wedge", label: "Rising Wedge" },
  { value: "falling_wedge", label: "Falling Wedge" },
  { value: "the_arc", label: "The Arc" },
];
const omPatLabel = (v) => (OM_PATTERNS.find(p => p.value === v) || {}).label || v || "-";

const OM_REASONS = [
  { value: "fear", label: "Fear / hesitation" },
  { value: "not_watching", label: "Wasn't watching" },
  { value: "distraction", label: "Distraction" },
  { value: "revenge", label: "Post-loss / revenge state" },
  { value: "disbelief", label: "Didn't trust the setup" },
  { value: "other", label: "Other" },
];
const omReasonLabel = (v) => (OM_REASONS.find(r => r.value === v) || {}).label || v || "-";

const OM_OUTCOMES = [
  { value: "win", label: "Would have WON" },
  { value: "loss", label: "Would have LOST" },
  { value: "unknown", label: "Unknown yet" },
];

// -- Main ----------------------------------------------------------------------
export default function Omissions({ supaUrl, supaKey }) {
  const [rows, setRows] = useState([]);
  const [takenCount, setTakenCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fReason, setFReason] = useState("");
  const [modal, setModal] = useState(null);   // {} new, { entry } edit
  const [detail, setDetail] = useState(null);
  const [aiQ, setAiQ] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [aiRes, setAiRes] = useState(null);

  const H = { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${supaUrl}/rest/v1/omissions?order=created_at.desc`, { headers: H });
      const data = await r.json();
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    // taken trades count, for the harvest rate
    try {
      const t = await fetch(`${supaUrl}/rest/v1/trades?select=id`, { headers: H });
      const td = await t.json();
      setTakenCount(Array.isArray(td) ? td.length : null);
    } catch { setTakenCount(null); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    await fetch(`${supaUrl}/rest/v1/omissions?id=eq.${id}`, { method: "DELETE", headers: H });
    setDetail(null); load();
  };
  const openEdit = (entry) => { setDetail(null); setModal({ entry }); };

  const runAISearch = async () => {
    const q = aiQ.trim();
    if (!q || !rows.length) return;
    setAiSearching(true); setAiRes(null);
    try {
      const lib = rows.map((e, i) => ({ i, pattern: e.pattern_type, pair: e.pair, dir: e.direction, tf: e.timeframe, date: e.date_seen, reason: e.reason, outcome: e.would_have, amount: e.amount, why: (e.description || "").slice(0, 200) }));
      const prompt = "You are analyzing a forex trader's LEDGER OF OMISSIONS: valid setups they SAW but did NOT take. Each case has an index i, a reason they skipped it, whether it would_have won or lost, and the amount. Answer the trader's question about these missed trades: which cases fit, what patterns of hesitation show up, what it costs them. WRITE THE ANSWER IN THE SAME LANGUAGE THE TRADER USED IN THEIR QUESTION. Reply ONLY with valid JSON (keys in English), no markdown, no preamble, in this exact shape: {\"answer\": \"2-5 sentence plain-text answer, in the trader's language\", \"matches\": [i, i, ...]} where matches lists the indices of the relevant cases (empty array if none). OMISSIONS: " + JSON.stringify(lib) + " QUESTION: " + q;
      const res = await fetch("/.netlify/functions/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 900, messages: [{ role: "user", content: prompt }] }) });
      if (!res.ok) throw new Error("status " + res.status);
      const data = await res.json();
      let txt = (data.content || []).map(b => b.text || "").join("").trim().replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(txt.substring(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
      const ids = Array.isArray(parsed.matches) ? parsed.matches.filter(n => Number.isInteger(n) && n >= 0 && n < rows.length) : [];
      setAiRes({ answer: parsed.answer || "", ids });
    } catch (e) { setAiRes("__ERROR__"); }
    setAiSearching(false);
  };

  const entries = rows.filter(e => !fReason || e.reason === fReason);

  // ---- stats ----
  const skipped = rows.length;
  const harvest = (takenCount != null && (takenCount + skipped) > 0)
    ? Math.round((takenCount / (takenCount + skipped)) * 100) : null;
  const known = rows.filter(e => e.would_have === "win" || e.would_have === "loss");
  const wouldWin = known.filter(e => e.would_have === "win").length;
  const leftOnTable = known.reduce((a, e) => a + (e.would_have === "win" ? 1 : -1) * (parseFloat(e.amount) || 0), 0);
  const reasonTally = {};
  rows.forEach(e => { if (e.reason) reasonTally[e.reason] = (reasonTally[e.reason] || 0) + 1; });
  const topReason = Object.entries(reasonTally).sort((a, b) => b[1] - a[1])[0];

  const Stat = ({ label, value, sub, color }) => (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 15px", minWidth: 130, flex: 1 }}>
      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 26, color: color || C.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      {/* Intro */}
      <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.6, marginBottom: 16 }}>
        The valid setups you <b style={{ color: C.text }}>saw but did not take</b>. Your journal is blind to these - and for a disciplined trader, this is where most of the edge leaks. Log them honestly; the numbers will show you the cost of hesitation.
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <Stat label="HARVEST RATE" value={harvest != null ? `${harvest}%` : "-"} color={C.accent}
          sub={harvest != null ? `${takenCount} taken / ${skipped} skipped` : "needs your trades"} />
        <Stat label="SETUPS SKIPPED" value={skipped} color={C.gold} />
        <Stat label="WOULD HAVE WON" value={known.length ? `${wouldWin}/${known.length}` : "-"}
          sub={known.length ? "of the ones you checked" : "mark outcomes to see"} color={C.green} />
        <Stat label="LEFT ON THE TABLE" value={known.length ? (leftOnTable > 0 ? `+${leftOnTable}` : `${leftOnTable}`) : "-"}
          sub="net pips / R missed" color={leftOnTable >= 0 ? C.green : C.red} />
        <Stat label="TOP REASON" value={topReason ? omReasonLabel(topReason[0]).split(" ")[0] : "-"}
          sub={topReason ? `${topReason[1]}x - your biggest leak` : ""} color={C.red} />
      </div>

      {/* AI ask */}
      <div style={{ background: C.panel, border: `1px solid ${C.accent}44`, borderRadius: 10, padding: "14px 16px", marginBottom: 18 }}>
        <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, marginBottom: 8 }}>🔎 ASK YOUR OMISSIONS</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={aiQ} onChange={e => setAiQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") runAISearch(); }}
            placeholder='e.g. "which setups do I skip after a loss?" or "what is my hesitation costing me?"'
            style={{ flex: 1, minWidth: 220, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontFamily: "Inter, sans-serif", fontSize: 13 }} />
          <MicButton onText={t => setAiQ(v => (v ? v + " " : "") + t)} />
          <Btn onClick={runAISearch} disabled={aiSearching || !aiQ.trim() || !rows.length}>{aiSearching ? "Asking..." : "Ask"}</Btn>
          {aiRes && !aiSearching && <Btn ghost onClick={() => { setAiRes(null); setAiQ(""); }}>Clear</Btn>}
        </div>
        {aiSearching && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ width: 26, height: 26, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin .9s linear infinite", margin: "0 auto" }} />
          </div>
        )}
        {aiRes && !aiSearching && (
          <div style={{ marginTop: 12 }}>
            {aiRes === "__ERROR__"
              ? <div style={{ color: C.red, fontSize: 13 }}>Could not search. Try again.</div>
              : <>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: aiRes.ids.length ? 14 : 0 }}>{aiRes.answer}</div>
                  {aiRes.ids.length > 0 && <>
                    <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, marginBottom: 10 }}>MATCHING OMISSIONS ({aiRes.ids.length})</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
                      {aiRes.ids.map(i => { const e = rows[i]; if (!e) return null; const oc = e.would_have === "win" ? C.green : e.would_have === "loss" ? C.red : C.muted; return (
                        <div key={e.id} onClick={() => setDetail(e)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${oc}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer" }}>
                          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 15, letterSpacing: 1 }}>{omPatLabel(e.pattern_type)}</div>
                          <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{e.pair || ""}{e.date_seen ? ` · ${e.date_seen}` : ""}</div>
                          <div style={{ marginTop: 6 }}><Tag color={C.red}>{omReasonLabel(e.reason)}</Tag></div>
                        </div>
                      ); })}
                    </div>
                  </>}
                </>}
          </div>
        )}
      </div>

      {/* Filter + add */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 18 }}>
        <div style={{ minWidth: 200 }}>
          <Sel label="FILTER BY REASON" value={fReason} onChange={setFReason} options={OM_REASONS} placeholder="All reasons" />
        </div>
        <div style={{ marginBottom: 13, marginLeft: "auto" }}>
          <Btn onClick={() => setModal({})}>+ Log omission</Btn>
        </div>
      </div>

      {loading ? <Empty text="Loading omissions..." />
        : !entries.length ? <Empty text="Nothing logged with this filter. Log the first missed setup." />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
            {entries.map(e => {
              const oc = e.would_have === "win" ? C.green : e.would_have === "loss" ? C.red : C.muted;
              return (
                <div key={e.id} onClick={() => setDetail(e)}
                  style={{ background: C.panel, border: `1px solid ${C.border}`, borderLeft: `3px solid ${oc}`, borderRadius: 10, overflow: "hidden", cursor: "pointer" }}>
                  {e.image_url
                    ? <img src={e.image_url} alt="" style={{ width: "100%", height: 130, objectFit: "cover", display: "block", background: C.bg }} />
                    : <div style={{ height: 130, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 11 }}>no image</div>}
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: oc, letterSpacing: 1, fontWeight: 700 }}>
                      {e.would_have === "win" ? `WOULD HAVE WON${e.amount ? ` +${e.amount}` : ""}` : e.would_have === "loss" ? `WOULD HAVE LOST${e.amount ? ` -${e.amount}` : ""}` : "OUTCOME UNKNOWN"}
                    </div>
                    <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 17, letterSpacing: 1, marginTop: 3 }}>{omPatLabel(e.pattern_type)}</div>
                    <div style={{ fontSize: 10, color: C.dim, marginTop: 1 }}>{e.direction || ""}{e.pair ? ` - ${e.pair}` : ""}</div>
                    {e.date_seen && <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>📅 {e.date_seen}</div>}
                    <div style={{ marginTop: 8 }}><Tag color={C.red}>{omReasonLabel(e.reason)}</Tag></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {modal && <OmissionModal supaUrl={supaUrl} supaKey={supaKey} entry={modal.entry}
        onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
      {detail && <OmissionView entry={detail} onClose={() => setDetail(null)} onDelete={del} onEdit={openEdit} />}
    </div>
  );
}

// -- Add / edit form -----------------------------------------------------------
function OmissionModal({ supaUrl, supaKey, entry, onClose, onDone }) {
  const isEdit = !!(entry && entry.id);
  const [dateSeen, setDateSeen] = useState(entry?.date_seen || "");
  const [pair, setPair] = useState(entry?.pair || "");
  const [patternType, setPatternType] = useState(entry?.pattern_type || "bull_flag");
  const [direction, setDirection] = useState(entry?.direction || "");
  const [timeframe, setTimeframe] = useState(entry?.timeframe || "1H");
  const [reason, setReason] = useState(entry?.reason || "fear");
  const [wouldHave, setWouldHave] = useState(entry?.would_have || "unknown");
  const [amount, setAmount] = useState(entry?.amount != null ? String(entry.amount) : "");
  const [description, setDescription] = useState(entry?.description || "");
  const [tvLink, setTvLink] = useState(entry?.tradingview_link || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      let image_url = isEdit ? (entry.image_url || null) : null;
      if (file) {
        try {
          const path = `om_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
          const up = await fetch(`${supaUrl}/storage/v1/object/pattern-library/${path}`, {
            method: "POST",
            headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": file.type || "image/png" },
            body: file,
          });
          if (up.ok) image_url = `${supaUrl}/storage/v1/object/public/pattern-library/${path}`;
          else alert("Could not upload the image (saved without the new one).");
        } catch { alert("Could not upload the image (saved without the new one)."); }
      }
      const row = {
        date_seen: dateSeen || null,
        pair: pair || null,
        pattern_type: patternType,
        direction: direction || null,
        timeframe,
        reason,
        would_have: wouldHave,
        amount: amount === "" ? null : (parseFloat(amount) || 0),
        description: description || null,
        image_url,
        tradingview_link: tvLink || null,
      };
      const headers = { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json", Prefer: "return=representation" };
      let r;
      if (isEdit) r = await fetch(`${supaUrl}/rest/v1/omissions?id=eq.${entry.id}`, { method: "PATCH", headers, body: JSON.stringify(row) });
      else r = await fetch(`${supaUrl}/rest/v1/omissions`, { method: "POST", headers, body: JSON.stringify(row) });
      if (!r.ok) throw new Error(await r.text());
      onDone();
    } catch (e) { alert("Could not save: " + (e.message || e)); }
    setSaving(false);
  };

  return (
    <Modal title={isEdit ? "EDIT OMISSION" : "LOG OMISSION"} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="PATTERN" value={patternType} onChange={setPatternType} options={OM_PATTERNS} placeholder="" />
        <Sel label="DIRECTION" value={direction} onChange={setDirection}
          options={[{ value: "bullish", label: "Bullish" }, { value: "bearish", label: "Bearish" }]} placeholder="-" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Inp label="PAIR" value={pair} onChange={setPair} placeholder="GBP/NZD" />
        <Sel label="TIMEFRAME" value={timeframe} onChange={setTimeframe} options={["1H", "4H", "15m", "D"]} placeholder="" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Inp label="DATE SEEN (ON TRADINGVIEW)" value={dateSeen} onChange={setDateSeen} type="date" />
        <Sel label="WHY DIDN'T YOU TAKE IT?" value={reason} onChange={setReason} options={OM_REASONS} placeholder="" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="WOULD IT HAVE WORKED?" value={wouldHave} onChange={setWouldHave} options={OM_OUTCOMES} placeholder="" />
        <Inp label="RESULT IF TAKEN (pips or R)" value={amount} onChange={setAmount} type="number" placeholder="e.g. 45" />
      </div>

      <TA label="NOTES - what happened, what stopped you?" value={description} onChange={setDescription}
        placeholder={"Ex: perfect bear flag on GBP/JPY, I was away from the screen and missed the break. Would have hit TP clean."}
        rows={3} color={C.accent} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 2 }}>
        <div style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>SCREENSHOT (image){isEdit && entry.image_url ? " - leave empty to keep current" : ""}</div>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "7px 10px", borderRadius: 6, fontSize: 11, fontFamily: "Inter, sans-serif" }} />
        </div>
        <Inp label="TRADINGVIEW LINK (optional)" value={tvLink} onChange={setTvLink} placeholder="https://..." />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={save} disabled={saving} full>{saving ? "Saving..." : (isEdit ? "Save changes" : "Save omission")}</Btn>
      </div>
    </Modal>
  );
}

// -- Detail --------------------------------------------------------------------
function OmissionView({ entry, onClose, onDelete, onEdit }) {
  const oc = entry.would_have === "win" ? C.green : entry.would_have === "loss" ? C.red : C.muted;
  return (
    <Modal title={omPatLabel(entry.pattern_type)} onClose={onClose}>
      {entry.image_url && <img src={entry.image_url} alt="" style={{ width: "100%", maxHeight: 320, objectFit: "contain", background: C.bg, borderRadius: 8, marginBottom: 14, display: "block" }} />}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: oc, letterSpacing: 1 }}>
          {entry.would_have === "win" ? `WOULD HAVE WON${entry.amount ? ` +${entry.amount}` : ""}` : entry.would_have === "loss" ? `WOULD HAVE LOST${entry.amount ? ` -${entry.amount}` : ""}` : "OUTCOME UNKNOWN"}
        </span>
        {entry.direction && <Tag>{entry.direction}</Tag>}
        {entry.pair && <Tag>{entry.pair}</Tag>}
        {entry.timeframe && <Tag color={C.accent}>{entry.timeframe}</Tag>}
        {entry.date_seen && <Tag color={C.gold}>📅 {entry.date_seen}</Tag>}
      </div>

      <div style={{ background: `${C.red}10`, border: `1px solid ${C.red}33`, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.red, letterSpacing: 2, marginBottom: 6 }}>WHY IT WAS SKIPPED</div>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 700 }}>{omReasonLabel(entry.reason)}</div>
      </div>

      {entry.description && (
        <div style={{ background: `${C.accent}08`, border: `1px solid ${C.accent}22`, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, marginBottom: 6 }}>NOTES</div>
          <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>{entry.description}</div>
        </div>
      )}

      {entry.tradingview_link && (
        <a href={entry.tradingview_link} target="_blank" rel="noreferrer"
          style={{ display: "block", textAlign: "center", padding: 10, background: `${C.accent}10`, border: `1px solid ${C.accent}33`, color: C.accent, borderRadius: 6, marginBottom: 14, fontSize: 12 }}>
          Open in TradingView
        </a>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <Btn ghost onClick={() => onEdit(entry)} full>Edit</Btn>
        <Btn danger onClick={() => { if (confirm("Delete this omission?")) onDelete(entry.id); }} full>Delete</Btn>
      </div>
    </Modal>
  );
}
