import { useState, useEffect } from "react";
 
/* ============================================================
   BIBLIOTECA DE PATRONES - Proyecto Montecristo
   Archivo SEPARADO y autocontenido. Se crea en GitHub como
   src/PatternLibrary.jsx (caja vacia, sin mezclarse con App.jsx).
   App.jsx solo lo importa y lo llama - 4 lineas pequenas.
   ============================================================ */
 
// -- Paleta (misma de la app) --------------------------------------------------
const C = {
  bg: "#070a0f", panel: "#0d1219", panel2: "#111827", border: "#1e2d3d",
  accent: "#00c9ff", gold: "#f0b429", green: "#10d98a", red: "#f63b3b",
  muted: "#3a5068", text: "#cfe4f5", dim: "#607d94",
};
 
// -- Helpers de UI (copias locales, para no depender de App.jsx) ----------------
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
 
// -- Datos de la biblioteca ----------------------------------------------------
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
  1: "R1 - 3 toques arriba y abajo",
  2: "R2 - Triple confirmacion",
  3: "R3 - SL anclado a estructura",
  4: "R4 - TP en fin del patron",
  5: "R5 - Riesgo <= 1%",
  6: "R6 - Excepcion spread (max 1.7%)",
  7: "R7 - Patron en el retroceso",
  8: "R8 - Tamano del patron",
};
 
const libVerdict = (verdict, sub) => {
  if (verdict === "no_es") return { color: C.red, label: "NO ES" };
  if (sub === "casi_perfecto") return { color: C.gold, label: "SI ES - casi perfecto" };
  return { color: C.green, label: "SI ES - perfecto" };
};
 
// -- BIBLIOTECA (pestana principal) --------------------------------------------
export default function PatternLibrary({ supaUrl, supaKey }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fPattern, setFPattern] = useState("");
  const [fVerdict, setFVerdict] = useState("");
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
 
  const H = { apikey: supaKey, Authorization: `Bearer ${supaKey}`, "Content-Type": "application/json" };
 
  const load = async () => {
    setLoading(true);
    try {
      let url = `${supaUrl}/rest/v1/pattern_library?order=created_at.desc`;
      if (fPattern) url += `&pattern_type=eq.${fPattern}`;
      if (fVerdict) url += `&verdict=eq.${fVerdict}`;
      const r = await fetch(url, { headers: H });
      const data = await r.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch { setEntries([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [fPattern, fVerdict]);
 
  const del = async (id) => {
    await fetch(`${supaUrl}/rest/v1/pattern_library?id=eq.${id}`, { method: "DELETE", headers: H });
    setDetail(null); load();
  };
 
  return (
    <div>
      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 18 }}>
        <div style={{ minWidth: 190 }}>
          <Sel label="PATRON" value={fPattern} onChange={setFPattern} options={LIB_PATTERNS} placeholder="Todos los patrones" />
        </div>
        <div style={{ minWidth: 150 }}>
          <Sel label="VEREDICTO" value={fVerdict} onChange={setFVerdict}
            options={[{ value: "si_es", label: "SI ES" }, { value: "no_es", label: "NO ES" }]} placeholder="Todos" />
        </div>
        <div style={{ marginBottom: 13, marginLeft: "auto" }}>
          <Btn onClick={() => setModal({})}>+ Clasificar caso</Btn>
        </div>
      </div>
 
      {loading ? <Empty text="Cargando biblioteca..." />
        : !entries.length ? <Empty text="No hay casos con este filtro. Clasifica el primero." />
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
            {entries.map(e => {
              const v = libVerdict(e.verdict, e.sub_verdict);
              return (
                <div key={e.id} onClick={() => setDetail(e)}
                  style={{ background: C.panel, border: `1px solid ${C.border}`, borderLeft: `3px solid ${v.color}`, borderRadius: 10, overflow: "hidden", cursor: "pointer" }}>
                  {e.image_url
                    ? <img src={e.image_url} alt="" style={{ width: "100%", height: 140, objectFit: "cover", display: "block", background: C.bg }} />
                    : <div style={{ height: 140, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 11 }}>sin imagen</div>}
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
 
// -- Formulario para clasificar un caso ----------------------------------------
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
    if (!description.trim()) return alert("Escribe el porque antes de guardar.");
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
          else alert("No se pudo subir la imagen (se guarda el caso sin ella).");
        } catch { alert("No se pudo subir la imagen (se guarda el caso sin ella)."); }
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
      alert("No se pudo guardar: " + (e.message || e));
    }
    setSaving(false);
  };
 
  return (
    <Modal title="CLASIFICAR CASO" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="VEREDICTO" value={verdict} onChange={setVerdict}
          options={[{ value: "si_es", label: "SI ES" }, { value: "no_es", label: "NO ES" }]} placeholder="" />
        {verdict === "si_es"
          ? <Sel label="PERFECTO O CASI?" value={sub} onChange={setSub}
              options={[{ value: "perfecto", label: "Perfecto (se entro)" }, { value: "casi_perfecto", label: "Casi perfecto (no se entro)" }]} placeholder="" />
          : <div />}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="PATRON" value={patternType} onChange={setPatternType} options={LIB_PATTERNS} placeholder="" />
        <Sel label="DIRECCION" value={direction} onChange={setDirection}
          options={[{ value: "alcista", label: "Alcista" }, { value: "bajista", label: "Bajista" }]} placeholder="-" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Inp label="PAR" value={pair} onChange={setPair} placeholder="GBP/NZD" />
        <Sel label="TEMPORALIDAD" value={timeframe} onChange={setTimeframe} options={["1H", "4H", "15m", "D"]} placeholder="" />
      </div>
 
      <div style={{ marginBottom: 13 }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 8 }}>REGLAS IMPLICADAS (la culpable si NO ES - las que confirman si SI ES)</div>
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
 
      <TA label="EL PORQUE - por que si es, o por que no es?" value={description} onChange={setDescription}
        placeholder={"Ej: rompio la linea del triangulo pero no rompio el bajo anterior; sin ese rompimiento de estructura, la triple confirmacion queda incompleta -> no es entrada."}
        rows={4} color={C.accent} />
 
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 2 }}>
        <div style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>CAPTURA (imagen)</div>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "7px 10px", borderRadius: 6, fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }} />
        </div>
        <Inp label="LINK TRADINGVIEW (opcional)" value={tvLink} onChange={setTvLink} placeholder="https://..." />
      </div>
 
      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={save} disabled={saving} full>{saving ? "Guardando..." : "Guardar caso"}</Btn>
      </div>
    </Modal>
  );
}
 
// -- Detalle de un caso --------------------------------------------------------
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
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>REGLAS</div>
          {entry.rules.map(r => <div key={r} style={{ fontSize: 12, color: C.text, lineHeight: 1.8 }}>- {LIB_RULES[r]}</div>)}
        </div>
      )}
 
      <div style={{ background: `${C.accent}08`, border: `1px solid ${C.accent}22`, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, marginBottom: 6 }}>EL PORQUE</div>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>{entry.description}</div>
      </div>
 
      {entry.tradingview_link && (
        <a href={entry.tradingview_link} target="_blank" rel="noreferrer"
          style={{ display: "block", textAlign: "center", padding: 10, background: `${C.accent}10`, border: `1px solid ${C.accent}33`, color: C.accent, borderRadius: 6, marginBottom: 14, fontSize: 12 }}>
          Abrir en TradingView
        </a>
      )}
 
      <Btn danger onClick={() => { if (confirm("Borrar este caso?")) onDelete(entry.id); }} full>Borrar caso</Btn>
    </Modal>
  );
}
 


