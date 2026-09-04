import { useState, useEffect } from "react";

/* ============================================================
   STUDY LINKS - Montecristo Project
   Separate, self-contained file. Created in GitHub as
   src/StudyLinks.jsx (empty box, does not mix with App.jsx).
   Save links: YouTube motivation, podcasts, strategies,
   your own TradingView screen recordings, etc. By category.
   ============================================================ */

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const C = {
  bg: "#070a0f", panel: "#0d1219", panel2: "#111827", border: "#1e2d3d",
  accent: "#00c9ff", gold: "#f0b429", green: "#10d98a", red: "#f63b3b",
  muted: "#3a5068", text: "#cfe4f5", dim: "#607d94",
};

const LINK_CATEGORIES = ["Motivation", "Study", "Strategy", "My Recordings", "Podcast", "Other"];

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

function TA({ label, value, onChange, placeholder, rows }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>{label}</div>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows || 2}
        style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "IBM Plex Mono, monospace", resize: "vertical" }} />
    </div>
  );
}

const isYouTube = (url) => /youtube\.com|youtu\.be/i.test(url || "");
const catColor = (c) => ({ Motivation: C.gold, Study: C.accent, Strategy: C.green, "My Recordings": C.red, Podcast: "#b98cff", Other: C.dim }[c] || C.dim);

export default function StudyLinks({ supaUrl, supaKey }) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fCat, setFCat] = useState("");
  const [modal, setModal] = useState(false);

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
          <Btn onClick={() => setModal(true)}>+ Add link</Btn>
        </div>
      </div>

      {loading ? <Empty text="Loading links..." />
        : !links.length ? <Empty text="No links yet. Add your first study link." />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {links.map(l => (
              <div key={l.id} style={{ background: C.panel, border: `1px solid ${C.border}`, borderLeft: `3px solid ${catColor(l.category)}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                  <Tag color={catColor(l.category)}>{l.category || "Other"}</Tag>
                  {isYouTube(l.url) && <Tag color={C.red}>YouTube</Tag>}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6, lineHeight: 1.4 }}>{l.title || "(untitled)"}</div>
                {l.notes && <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.6, marginBottom: 10 }}>{l.notes}</div>}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {l.url && <a href={l.url} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: "center", fontSize: 11, padding: "7px 10px", background: `${C.accent}10`, border: `1px solid ${C.accent}33`, color: C.accent, borderRadius: 4, textDecoration: "none" }}>Open link</a>}
                  <button onClick={() => { if (confirm("Delete this link?")) del(l.id); }} style={{ fontSize: 11, padding: "7px 10px", background: "transparent", border: `1px solid ${C.red}44`, color: C.red, borderRadius: 4, cursor: "pointer" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

      {modal && <LinkModal supaUrl={supaUrl} supaKey={supaKey} onClose={() => setModal(false)} onDone={() => { setModal(false); load(); }} />}
    </div>
  );
}

function LinkModal({ supaUrl, supaKey, onClose, onDone }) {
  const [category, setCategory] = useState("Motivation");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!url.trim()) return alert("Paste a link (URL) before saving.");
    if (!title.trim()) return alert("Give the link a title.");
    setSaving(true);
    try {
      const row = { id: uid(), category, title, url, notes: notes || null };
      const r = await fetch(`${supaUrl}/rest/v1/study_links`, {
        method: "POST",
        headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(row),
      });
      if (!r.ok) throw new Error(await r.text());
      onDone();
    } catch (e) { alert("Could not save: " + (e.message || e)); }
    setSaving(false);
  };

  return (
    <Modal title="ADD STUDY LINK" onClose={onClose}>
      <Sel label="CATEGORY" value={category} onChange={setCategory} options={LINK_CATEGORIES} placeholder="" />
      <Inp label="TITLE" value={title} onChange={setTitle} placeholder="e.g. Mindset talk - staying patient" />
      <Inp label="LINK (URL)" value={url} onChange={setUrl} placeholder="https://youtube.com/... or https://..." />
      <TA label="NOTES (optional)" value={notes} onChange={setNotes} placeholder="Why this is worth revisiting..." rows={2} />
      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={save} disabled={saving} full>{saving ? "Saving..." : "Save link"}</Btn>
      </div>
    </Modal>
  );
}
