import { useState, useEffect } from "react";

/* ============================================================
   STUDY LINKS - Montecristo Project
   Separate, self-contained file. Created in GitHub as
   src/StudyLinks.jsx (empty box, does not mix with App.jsx).
   Save links: YouTube motivation, podcasts, strategies,
   your own TradingView screen recordings, OR upload a file
   from your computer (pdf, image, doc...). By category.
   Files are stored in the existing "pattern-library" bucket.
   ============================================================ */

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const C = {
  bg: "#0a0a0a", panel: "#141414", panel2: "#1c1c1c", border: "#2a2a2a",
  accent: "#c6f531", gold: "#f0b429", green: "#c6f531", red: "#f63b3b",
  muted: "#5a5a5a", text: "#e8e8e8", dim: "#808080",
};

const LINK_CATEGORIES = ["Motivation", "Study", "Strategy", "My Recordings", "Podcast", "Other"];

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
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, color = C.accent, ghost = false, danger = false, full = false, disabled = false, small = false }) {
  const bg = danger ? C.red : ghost ? "transparent" : color;
  const col = danger ? "#fff" : ghost ? color : "#000";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: small ? "6px 12px" : "9px 18px", background: bg, color: col, border: ghost ? `1px solid ${color}44` : "none", borderRadius: 4, fontSize: small ? 10 : 11, fontWeight: 700, letterSpacing: 2, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, width: full ? "100%" : "auto", fontFamily: "Inter, sans-serif" }}>
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
      <div onMouseDown={e => e.stopPropagation()} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, width: "min(520px,100%)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
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

function TA({ label, value, onChange, placeholder, rows }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2 }}>{label}</div>
        <MicButton onText={t => onChange((value ? value + " " : "") + t)} />
      </div>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows || 2}
        style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "Inter, sans-serif", resize: "vertical" }} />
    </div>
  );
}

const isYouTube = (url) => /youtube\.com|youtu\.be/i.test(url || "");
const isFile = (url) => /\/storage\/v1\/object\/public\//.test(url || "");
const fileNameFromUrl = (url) => { try { return decodeURIComponent((url || "").split("/").pop() || "").replace(/^\d+_/, "") || "file"; } catch { return "file"; } };
const catColor = (c) => ({ Motivation: C.gold, Study: C.accent, Strategy: C.green, "My Recordings": C.red, Podcast: "#b98cff", Other: C.dim }[c] || C.dim);

export default function StudyLinks({ supaUrl, supaKey }) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fCat, setFCat] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const H = { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${supaUrl}/rest/v1/study_links?order=created_at.desc`, { headers: H });
      const data = await r.json();
      setAll(Array.isArray(data) ? data : []);
    } catch { setAll([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    await fetch(`${supaUrl}/rest/v1/study_links?id=eq.${id}`, { method: "DELETE", headers: H });
    load();
  };

  const closeModal = () => { setModal(false); setEditing(null); };
  const links = all.filter(l => !fCat || l.category === fCat);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 18 }}>
        <div style={{ minWidth: 180 }}>
          <Sel label="CATEGORY" value={fCat} onChange={setFCat} options={LINK_CATEGORIES} placeholder="All categories" />
        </div>
        <div style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>SHOWING</div>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 22, color: C.accent, lineHeight: 1.2 }}>
            {links.length}<span style={{ fontSize: 12, color: C.muted }}> / {all.length}</span>
          </div>
        </div>
        <div style={{ marginBottom: 13, marginLeft: "auto" }}>
          <Btn onClick={() => { setEditing(null); setModal(true); }}>+ Add link / file</Btn>
        </div>
      </div>

      {loading ? <Empty text="Loading links..." />
        : !links.length ? <Empty text="No links yet. Add your first study link or file." />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {links.map(l => (
              <div key={l.id} style={{ background: C.panel, border: `1px solid ${C.border}`, borderLeft: `3px solid ${catColor(l.category)}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                  <Tag color={catColor(l.category)}>{l.category || "Other"}</Tag>
                  {isFile(l.url) ? <Tag color={C.accent}>📎 File</Tag> : isYouTube(l.url) && <Tag color={C.red}>YouTube</Tag>}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6, lineHeight: 1.4 }}>{l.title || "(untitled)"}</div>
                {isFile(l.url) && <div style={{ fontSize: 10, color: C.muted, marginBottom: 6, wordBreak: "break-all" }}>{fileNameFromUrl(l.url)}</div>}
                {l.notes && <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.6, marginBottom: 10 }}>{l.notes}</div>}
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  {l.url && <a href={l.url} target="_blank" rel="noreferrer" style={{ flex: 1, minWidth: 90, textAlign: "center", fontSize: 11, padding: "7px 10px", background: `${C.accent}10`, border: `1px solid ${C.accent}33`, color: C.accent, borderRadius: 4, textDecoration: "none" }}>{isFile(l.url) ? "Open file" : "Open link"}</a>}
                  <button onClick={() => { setEditing(l); setModal(true); }} style={{ fontSize: 11, padding: "7px 10px", background: "transparent", border: `1px solid ${C.accent}44`, color: C.accent, borderRadius: 4, cursor: "pointer" }}>Edit</button>
                  <button onClick={() => { if (confirm("Delete this link?")) del(l.id); }} style={{ fontSize: 11, padding: "7px 10px", background: "transparent", border: `1px solid ${C.red}44`, color: C.red, borderRadius: 4, cursor: "pointer" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

      {(modal || editing) && <LinkModal supaUrl={supaUrl} supaKey={supaKey} entry={editing} onClose={closeModal} onDone={() => { closeModal(); load(); }} />}
    </div>
  );
}

function LinkModal({ supaUrl, supaKey, entry, onClose, onDone }) {
  const isEdit = !!entry;
  const hadFile = isEdit && isFile(entry.url);
  const [category, setCategory] = useState(entry?.category || "Motivation");
  const [title, setTitle] = useState(entry?.title || "");
  const [url, setUrl] = useState(hadFile ? "" : (entry?.url || ""));
  const [notes, setNotes] = useState(entry?.notes || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const H = { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json" };

  const save = async () => {
    if (!title.trim()) return alert("Give it a title.");
    if (!url.trim() && !file && !hadFile) return alert("Paste a link (URL) or attach a file.");
    setSaving(true);
    try {
      let finalUrl = url.trim();
      if (file) {
        const path = `study/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
        const up = await fetch(`${supaUrl}/storage/v1/object/pattern-library/${path}`, {
          method: "POST",
          headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!up.ok) throw new Error("the file could not be uploaded (check the storage bucket allows this file type)");
        finalUrl = `${supaUrl}/storage/v1/object/public/pattern-library/${path}`;
      } else if (!finalUrl && hadFile) {
        finalUrl = entry.url;
      }
      const row = { category, title: title.trim(), url: finalUrl, notes: notes.trim() || null };
      if (isEdit) {
        const r = await fetch(`${supaUrl}/rest/v1/study_links?id=eq.${entry.id}`, { method: "PATCH", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(row) });
        if (!r.ok) throw new Error(await r.text());
      } else {
        const r = await fetch(`${supaUrl}/rest/v1/study_links`, { method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify({ id: uid(), ...row }) });
        if (!r.ok) throw new Error(await r.text());
      }
      onDone();
    } catch (e) { alert("Could not save: " + (e.message || e)); }
    setSaving(false);
  };

  return (
    <Modal title={isEdit ? "EDIT STUDY LINK" : "ADD STUDY LINK / FILE"} onClose={onClose}>
      <Sel label="CATEGORY" value={category} onChange={setCategory} options={LINK_CATEGORIES} placeholder="" />
      <Inp label="TITLE" value={title} onChange={setTitle} placeholder="e.g. Mindset talk - staying patient" />
      <Inp label="LINK (URL) — web page or video" value={url} onChange={setUrl} placeholder="https://youtube.com/... or https://..." />
      <div style={{ marginBottom: 13 }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>OR ATTACH A FILE FROM YOUR COMPUTER (pdf, image, doc…){hadFile ? " — leave empty to keep current file" : ""}</div>
        <input type="file" onChange={e => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
          style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "8px 10px", borderRadius: 6, fontSize: 12, fontFamily: "Inter, sans-serif" }} />
        {file && <div style={{ fontSize: 10, color: C.accent, marginTop: 5 }}>Selected: {file.name}</div>}
        {hadFile && !file && <div style={{ fontSize: 10, color: C.dim, marginTop: 5 }}>Current file: {fileNameFromUrl(entry.url)}</div>}
      </div>
      <TA label="NOTES (optional)" value={notes} onChange={setNotes} placeholder="Why this is worth revisiting..." rows={2} />
      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={save} disabled={saving} full>{saving ? "Saving..." : (isEdit ? "Save changes" : "Save")}</Btn>
      </div>
    </Modal>
  );
}
