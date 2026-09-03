import { useState, useEffect } from "react";
 
/* ============================================================
   PATTERNS LIBRARY - Montecristo Project
   Separate, self-contained file. Created in GitHub as
   src/PatternLibrary.jsx (empty box, does not mix with App.jsx).
   App.jsx only imports and calls it - 4 small lines.
   Visible text in English; stored values (si_es, no_es, etc.)
   kept intact so the filter and table schema keep working.
   ============================================================ */
 
// -- Palette (same as the app) -------------------------------------------------
const C = {
  bg: "#070a0f", panel: "#0d1219", panel2: "#111827", border: "#1e2d3d",
  accent: "#00c9ff", gold: "#f0b429", green: "#10d98a", red: "#f63b3b",
  muted: "#3a5068", text: "#cfe4f5", dim: "#607d94",
};
 
// -- UI helpers (local copies, so this file needs nothing from App.jsx) ---------
function Inp({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "IBM Plex Mono, monospace" }} />
    </div>
  );
}
 
function Sel({ label, value, onChange, options, placeholder = "-" }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "IBM Plex Mono, monospace" }}>
        <option value="">{placeholder}</option>
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
 
function Btn({ children, onClick, color = C.accent, ghost = false, danger = false, full = false, disabled = false, small = false }) {
  const bg = danger ? C.red : ghost ? "transparent" : color;
  const col = danger ? "#fff" : ghost ? color : "#000";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: small ? "6px 12px" : "9px 18px", background: bg, color: col, border: ghost ? `1px solid ${color}44` : "none", borderRadius: 4, fontSize: small ? 10 : 11, fontWeight: 700, letterSpacing: 2, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, width: full ? "100%" : "auto", fontFamily: "IBM Plex Mono, monospace" }}>
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
      <div style={{ fontSize: 32, opacity: 0.3 }}>*</div>
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
 
function TA({ label, value, onChange, placeholder, rows, color }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 9, color: color || C.dim, letterSpacing: 2, marginBottom: 5 }}>{label}</div>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows || 3}
        style={{ width: "100%", background: C.bg, border: `1px solid ${color ? color + "44" : C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "IBM Plex Mono, monospace", resize: "vertical" }} />
    </div>
  );
}
 
// -- Library data --------------------------------------------------------------
const LIB_PATTERNS = [
  { value: "bull_flag",            label: "Bull Flag" },
  { value: "bear_flag",            label: "Bear Flag" },
  { value: "symmetrical_triangle", label: "Symmetrical Triangle" },
  { value: "expanding_triangle",   label: "Expanding Triangle" },
  { value: "ascending_channel",    label: "Ascending Channel" },
  { value: "descending_channel",   label: "Descending Channel" },
  { value: "rising_wedge",         label: "Rising Wedge" },
  { value: "falling_wedge",        label: "Falling Wedge" },
  { value: "the_arc",              label: "The Arc" },
];
const libPatLabel = (v) => (LIB_PATTERNS.find(p => p.value === v) || {}).label || v;
 
const LIB_RULES = {
  1: "R1 - 3 touches top & bottom",
  2: "R2 - Triple confirmation",
  3: "R3 - SL anchored to structure",
  4: "R4 - TP at pattern end",
  5: "R5 - Risk <= 1%",
  6: "R6 - Spread exception (max 1.7%)",
  7: "R7 - Pattern in the pullback",
  8: "R8 - Pattern size",
};
 
// stored verdict values stay 'no_es' / 'si_es'; only the LABELS are in English
const libVerdict = (verdict, sub) => {
  if (verdict === "no_es") return { color: C.red, label: "INVALID" };
  if (sub === "casi_perfecto") return { color: C.gold, label: "VALID - near-perfect" };
  return { color: C.green, label: "VALID - perfect" };
};
 
// -- LIBRARY (main tab) --------------------------------------------------------
export default function PatternLibrary({ supaUrl, supaKey }) {
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fPattern, setFPattern] = useState("");
  const [fVerdict, setFVerdict] = useState("");
  const [fPair, setFPair] = useState("");
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
 
  const H = { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json" };
 
  const load = async () => {
    setLoading(true);
    try {
      const url = `${supaUrl}/rest/v1/pattern_library?order=created_at.desc`;
      const r = await fetch(url, { headers: H });
      const data = await r.json();
      setAllEntries(Array.isArray(data) ? data : []);
    } catch { setAllEntries([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
 
  const del = async (id) => {
    await fetch(`${supaUrl}/rest/v1/pattern_library?id=eq.${id}`, { method: "DELETE", headers: H });
    setDetail(null); load();
  };
 
  // distinct pairs present in the library, for the pair filter dropdown
  const pairOptions = Array.from(new Set(allEntries.map(e => e.pair).filter(Boolean))).sort();
 
  // apply filters in memory
  const entries = allEntries.filter(e =>
    (!fPattern || e.pattern_type === fPattern) &&
    (!fVerdict || e.verdict === fVerdict) &&
    (!fPair || e.pair === fPair)
  );
 
  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 18 }}>
        <div style={{ minWidth: 190 }}>
          <Sel label="PATTERN" value={fPattern} onChange={setFPattern} options={LIB_PATTERNS} placeholder="All patterns" />
        </div>
        <div style={{ minWidth: 150 }}>
          <Sel label="PAIR" value={fPair} onChange={setFPair} options={pairOptions} placeholder="All pairs" />
        </div>
        <div style={{ minWidth: 150 }}>
          <Sel label="VERDICT" value={fVerdict} onChange={setFVerdict}
            options={[{ value: "si_es", label: "VALID" }, { value: "no_es", label: "INVALID" }]} placeholder="All" />
        </div>
        <div style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>SHOWING</div>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 22, color: C.accent, lineHeight: 1.2 }}>
            {entries.length}<span style={{ fontSize: 12, color: C.muted }}> / {allEntries.length}</span>
          </div>
        </div>
        <div style={{ marginBottom: 13, marginLeft: "auto" }}>
          <Btn onClick={() => setModal({})}>+ Classify case</Btn>
        </div>
      </div>
 
      {loading ? <Empty text="Loading library..." />
        : !entries.length ? <Empty text="No cases with this filter. Classify the first one." />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
            {entries.map(e => {
              const v = libVerdict(e.verdict, e.sub_verdict);
              return (
                <div key={e.id} onClick={() => setDetail(e)}
                  style={{ background: C.panel, border: `1px solid ${C.border}`, borderLeft: `3px solid ${v.color}`, borderRadius: 10, overflow: "hidden", cursor: "pointer" }}>
                  {e.image_url
                    ? <img src={e.image_url} alt="" style={{ width: "100%", height: 140, objectFit: "cover", display: "block", background: C.bg }} />
                    : <div style={{ height: 140, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 11 }}>no image</div>}
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: v.color, letterSpacing: 1, fontWeight: 700 }}>{v.label}</div>
                    <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 17, letterSpacing: 1, marginTop: 3 }}>
                      {libPatLabel(e.pattern_type)}
                    </div>
                    {e.direction && <div style={{ fontSize: 10, color: C.dim, marginTop: 1 }}>{e.direction}{e.pair ? ` - ${e.pair}` : ""}</div>}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 9 }}>
                      {(e.rules || []).map(r => <Tag key={r} color={C.accent}>R{r}</Tag>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
 
      {modal && <PatternCaseModal supaUrl={supaUrl} supaKey={supaKey}
        onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
      {detail && <PatternCaseView entry={detail} onClose={() => setDetail(null)} onDelete={del} />}
    </div>
  );
}
 
// -- Case classification form --------------------------------------------------
function PatternCaseModal({ supaUrl, supaKey, onClose, onDone }) {
  const [verdict, setVerdict] = useState("si_es");
  const [sub, setSub] = useState("perfecto");
  const [patternType, setPatternType] = useState("bull_flag");
  const [direction, setDirection] = useState("");
  const [pair, setPair] = useState("");
  const [timeframe, setTimeframe] = useState("1H");
  const [rules, setRules] = useState([]);
  const [description, setDescription] = useState("");
  const [tvLink, setTvLink] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
 
  const toggleRule = (r) => setRules(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r].sort((a, b) => a - b));
 
  const save = async () => {
    if (!description.trim()) return alert("Write the reason before saving.");
    setSaving(true);
    try {
      let image_url = null;
      if (file) {
        try {
          const path = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
          const up = await fetch(`${supaUrl}/storage/v1/object/pattern-library/${path}`, {
            method: "POST",
            headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": file.type || "image/png" },
            body: file,
          });
          if (up.ok) image_url = `${supaUrl}/storage/v1/object/public/pattern-library/${path}`;
          else alert("Could not upload the image (the case will be saved without it).");
        } catch { alert("Could not upload the image (the case will be saved without it)."); }
      }
      const row = {
        pattern_type: patternType,
        direction: direction || null,
        verdict,
        sub_verdict: verdict === "si_es" ? sub : null,
        entered: verdict === "si_es" && sub === "perfecto",
        pair: pair || null,
        timeframe,
        rules,
        description,
        image_url,
        tradingview_link: tvLink || null,
      };
      const r = await fetch(`${supaUrl}/rest/v1/pattern_library`, {
        method: "POST",
        headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(row),
      });
      if (!r.ok) throw new Error(await r.text());
      onDone();
    } catch (e) {
      alert("Could not save: " + (e.message || e));
    }
    setSaving(false);
  };
 
  return (
    <Modal title="CLASSIFY CASE" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="VERDICT" value={verdict} onChange={setVerdict}
          options={[{ value: "si_es", label: "VALID" }, { value: "no_es", label: "INVALID" }]} placeholder="" />
        {verdict === "si_es"
          ? <Sel label="PERFECT OR NEAR?" value={sub} onChange={setSub}
              options={[{ value: "perfecto", label: "Perfect (entered)" }, { value: "casi_perfecto", label: "Near-perfect (not entered)" }]} placeholder="" />
          : <div />}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="PATTERN" value={patternType} onChange={setPatternType} options={LIB_PATTERNS} placeholder="" />
        <Sel label="DIRECTION" value={direction} onChange={setDirection}
          options={[{ value: "bullish", label: "Bullish" }, { value: "bearish", label: "Bearish" }]} placeholder="-" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Inp label="PAIR" value={pair} onChange={setPair} placeholder="GBP/NZD" />
        <Sel label="TIMEFRAME" value={timeframe} onChange={setTimeframe} options={["1H", "4H", "15m", "D"]} placeholder="" />
      </div>
 
      <div style={{ marginBottom: 13 }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 8 }}>RULES INVOLVED (the culprit if INVALID - the ones that confirm if VALID)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.keys(LIB_RULES).map(k => Number(k)).map(r => (
            <button key={r} onClick={() => toggleRule(r)} title={LIB_RULES[r]}
              style={{ padding: "5px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: "IBM Plex Mono, monospace",
                       border: `1px solid ${rules.includes(r) ? C.accent : C.border}`,
                       background: rules.includes(r) ? `${C.accent}18` : C.bg,
                       color: rules.includes(r) ? C.accent : C.dim }}>
              R{r}
            </button>
          ))}
        </div>
      </div>
 
      <TA label="THE REASON - why is it valid, or why not?" value={description} onChange={setDescription}
        placeholder={"Ex: it broke the triangle line but did not break the previous low; without that structure break, the triple confirmation is incomplete -> not an entry."}
        rows={4} color={C.accent} />
 
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 2 }}>
        <div style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>SCREENSHOT (image)</div>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "7px 10px", borderRadius: 6, fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} />
        </div>
        <Inp label="TRADINGVIEW LINK (optional)" value={tvLink} onChange={setTvLink} placeholder="https://..." />
      </div>
 
      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={save} disabled={saving} full>{saving ? "Saving..." : "Save case"}</Btn>
      </div>
    </Modal>
  );
}
 
// -- Case detail ---------------------------------------------------------------
function PatternCaseView({ entry, onClose, onDelete }) {
  const v = libVerdict(entry.verdict, entry.sub_verdict);
  return (
    <Modal title={`${libPatLabel(entry.pattern_type)}`} onClose={onClose}>
      {entry.image_url && <img src={entry.image_url} alt="" style={{ width: "100%", maxHeight: 320, objectFit: "contain", background: C.bg, borderRadius: 8, marginBottom: 14, display: "block" }} />}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: v.color, letterSpacing: 1 }}>{v.label}</span>
        {entry.direction && <Tag>{entry.direction}</Tag>}
        {entry.pair && <Tag>{entry.pair}</Tag>}
        {entry.timeframe && <Tag color={C.accent}>{entry.timeframe}</Tag>}
      </div>
 
      {(entry.rules || []).length > 0 && (
        <div style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>RULES</div>
          {entry.rules.map(r => <div key={r} style={{ fontSize: 12, color: C.text, lineHeight: 1.8 }}>- {LIB_RULES[r]}</div>)}
        </div>
      )}
 
      <div style={{ background: `${C.accent}08`, border: `1px solid ${C.accent}22`, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, marginBottom: 6 }}>THE REASON</div>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>{entry.description}</div>
      </div>
 
      {entry.tradingview_link && (
        <a href={entry.tradingview_link} target="_blank" rel="noreferrer"
          style={{ display: "block", textAlign: "center", padding: 10, background: `${C.accent}10`, border: `1px solid ${C.accent}33`, color: C.accent, borderRadius: 6, marginBottom: 14, fontSize: 12 }}>
          Open in TradingView
        </a>
      )}
 
      <Btn danger onClick={() => { if (confirm("Delete this case?")) onDelete(entry.id); }} full>Delete case</Btn>
    </Modal>
  );
}
 


