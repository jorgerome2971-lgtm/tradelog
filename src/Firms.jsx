import { useState, useEffect } from "react";

/* ============================================================
   MY FIRMS - Montecristo Project
   Separate, self-contained file. Created in GitHub as
   src/Firms.jsx (empty box, does not mix with App.jsx).
   Per prop firm / platform: rules, rule screenshots, account
   data, and a POINTER to where credentials live.
   SECURITY: never stores passwords. Only a note saying where
   the password is kept (e.g. "Bitwarden").
   ============================================================ */

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const C = {
  bg: "#070a0f", panel: "#0d1219", panel2: "#111827", border: "#1e2d3d",
  accent: "#00c9ff", gold: "#f0b429", green: "#10d98a", red: "#f63b3b",
  muted: "#3a5068", text: "#cfe4f5", dim: "#607d94",
};

const FIRM_STATUS = ["Evaluation", "Challenge", "Funded", "Failed", "Other"];
const statusColor = (s) => ({ Evaluation: C.accent, Challenge: C.gold, Funded: C.green, Failed: C.red, Other: C.dim }[s] || C.dim);

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

function Btn({ children, onClick, color = C.accent, ghost = false, danger = false, full = false, disabled = false }) {
  const bg = danger ? C.red : ghost ? "transparent" : color;
  const col = danger ? "#fff" : ghost ? color : "#000";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: "9px 18px", background: bg, color: col, border: ghost ? `1px solid ${color}44` : "none", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, width: full ? "100%" : "auto", fontFamily: "IBM Plex Mono, monospace" }}>
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
      <div onMouseDown={e => e.stopPropagation()} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, width: "min(600px,100%)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
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
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows || 3}
        style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "IBM Plex Mono, monospace", resize: "vertical" }} />
    </div>
  );
}

export default function Firms({ supaUrl, supaKey }) {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {} (new) | firm (edit)

  const H = { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json" };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${supaUrl}/rest/v1/firms?order=created_at.desc`, { headers: H });
      const data = await r.json();
      setFirms(Array.isArray(data) ? data : []);
    } catch { setFirms([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <Btn onClick={() => setModal({})}>+ Add firm</Btn>
      </div>

      <div style={{ background: `${C.gold}0a`, border: `1px solid ${C.gold}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 11, color: C.gold, lineHeight: 1.6 }}>
        🔒 Never store passwords here. Keep them in a password manager (Bitwarden, etc.) and just note WHERE they live.
      </div>

      {loading ? <Empty text="Loading firms..." />
        : !firms.length ? <Empty text="No firms yet. Add your first prop firm / platform." />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
            {firms.map(f => (
              <div key={f.id} onClick={() => setModal(f)} style={{ background: C.panel, border: `1px solid ${C.border}`, borderLeft: `3px solid ${statusColor(f.status)}`, borderRadius: 10, padding: "16px 18px", cursor: "pointer" }}>
                <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 20, letterSpacing: 2, marginBottom: 4 }}>{f.name || "(unnamed)"}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {f.status && <Tag color={statusColor(f.status)}>{f.status}</Tag>}
                  {f.account_size && <Tag>{f.account_size}</Tag>}
                </div>
                {f.rules && <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.6, marginBottom: 10, maxHeight: 54, overflow: "hidden" }}>{f.rules}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted }}>
                  <span>{(f.images || []).length} screenshot{(f.images || []).length === 1 ? "" : "s"}</span>
                  <span>✎ open</span>
                </div>
              </div>
            ))}
          </div>
        )}

      {modal && <FirmModal supaUrl={supaUrl} supaKey={supaKey} firm={modal.id ? modal : null}
        onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
    </div>
  );
}

function FirmModal({ supaUrl, supaKey, firm, onClose, onDone }) {
  const f = firm || {};
  const [name, setName] = useState(f.name || "");
  const [status, setStatus] = useState(f.status || "Evaluation");
  const [accountSize, setAccountSize] = useState(f.account_size || "");
  const [rules, setRules] = useState(f.rules || "");
  const [credLoc, setCredLoc] = useState(f.credentials_location || "");
  const [loginEmail, setLoginEmail] = useState(f.login_email || "");
  const [accountNumber, setAccountNumber] = useState(f.account_number || "");
  const [server, setServer] = useState(f.server || "");
  const [notes, setNotes] = useState(f.notes || "");
  const [images, setImages] = useState(f.images || []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadShot = async (file) => {
    setUploading(true);
    try {
      const path = `firm_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
      const up = await fetch(`${supaUrl}/storage/v1/object/pattern-library/${path}`, {
        method: "POST",
        headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": file.type || "image/png" },
        body: file,
      });
      if (up.ok) setImages(prev => [...prev, `${supaUrl}/storage/v1/object/public/pattern-library/${path}`]);
      else alert("Could not upload the screenshot.");
    } catch { alert("Could not upload the screenshot."); }
    setUploading(false);
  };

  const save = async () => {
    if (!name.trim()) return alert("Give the firm a name.");
    setSaving(true);
    try {
      const row = { name, status, account_size: accountSize || null, rules: rules || null, credentials_location: credLoc || null, login_email: loginEmail || null, account_number: accountNumber || null, server: server || null, notes: notes || null, images };
      let r;
      if (f.id) {
        r = await fetch(`${supaUrl}/rest/v1/firms?id=eq.${f.id}`, { method: "PATCH", headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json" }, body: JSON.stringify(row) });
      } else {
        r = await fetch(`${supaUrl}/rest/v1/firms`, { method: "POST", headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ id: uid(), ...row }) });
      }
      if (!r.ok) throw new Error(await r.text());
      onDone();
    } catch (e) { alert("Could not save: " + (e.message || e)); }
    setSaving(false);
  };

  const del = async () => {
    if (!confirm("Delete this firm?")) return;
    await fetch(`${supaUrl}/rest/v1/firms?id=eq.${f.id}`, { method: "DELETE", headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json" } });
    onDone();
  };

  return (
    <Modal title={f.id ? "EDIT FIRM" : "NEW FIRM"} onClose={onClose}>
      <Inp label="FIRM / PLATFORM NAME" value={name} onChange={setName} placeholder="e.g. Hola Prime, FTMO..." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="STATUS" value={status} onChange={setStatus} options={FIRM_STATUS} placeholder="" />
        <Inp label="ACCOUNT SIZE" value={accountSize} onChange={setAccountSize} placeholder="200k" />
      </div>

      <TA label="FIRM RULES (written)" value={rules} onChange={setRules} placeholder={"Max daily loss, max drawdown, target, min days, payout split..."} rows={4} />

      {/* SCREENSHOTS */}
      <div style={{ marginBottom: 13 }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 8 }}>RULE SCREENSHOTS</div>
        {images.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            {images.map((url, i) => (
              <div key={i} style={{ position: "relative" }}>
                <a href={url} target="_blank" rel="noreferrer"><img src={url} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.border}`, display: "block" }} /></a>
                <button onClick={() => setImages(prev => prev.filter((_, x) => x !== i))}
                  style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: C.red, color: "#fff", border: "none", fontSize: 12, cursor: "pointer", lineHeight: 1 }}>x</button>
              </div>
            ))}
          </div>
        )}
        <input type="file" accept="image/*" disabled={uploading} onChange={e => { if (e.target.files[0]) uploadShot(e.target.files[0]); e.target.value = ""; }}
          style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "7px 10px", borderRadius: 6, fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} />
        {uploading && <div style={{ fontSize: 10, color: C.accent, marginTop: 6 }}>Uploading...</div>}
      </div>

      {/* NON-SECRET ACCOUNT DATA */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginBottom: 4 }}>
        <div style={{ fontSize: 9, color: C.gold, letterSpacing: 2, marginBottom: 10 }}>🔒 ACCESS INFO (no passwords!)</div>
        <Inp label="WHERE ARE THE CREDENTIALS?" value={credLoc} onChange={setCredLoc} placeholder="e.g. Bitwarden, Chrome passwords..." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Inp label="LOGIN / EMAIL" value={loginEmail} onChange={setLoginEmail} placeholder="user@email.com" />
          <Inp label="ACCOUNT NUMBER" value={accountNumber} onChange={setAccountNumber} placeholder="1234567" />
        </div>
        <Inp label="SERVER (MT4/MT5)" value={server} onChange={setServer} placeholder="e.g. HolaPrime-Live" />
      </div>

      <TA label="NOTES" value={notes} onChange={setNotes} placeholder="Anything else about this firm..." rows={2} />

      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={save} disabled={saving} full>{saving ? "Saving..." : "Save firm"}</Btn>
        {f.id && <Btn danger onClick={del}>Delete</Btn>}
      </div>
    </Modal>
  );
}
