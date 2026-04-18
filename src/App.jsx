import { useState, useMemo, useEffect } from "react";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", signDisplay: "exceptZero" }).format(n || 0);
const pct = (a, b) => b === 0 ? "—" : ((a / b) * 100).toFixed(1) + "%";

const C = {
  bg: "#070a0f", panel: "#0d1219", panel2: "#111827", border: "#1e2d3d",
  accent: "#00c9ff", gold: "#f0b429", green: "#10d98a", red: "#f63b3b",
  muted: "#3a5068", text: "#cfe4f5", dim: "#607d94",
};

const PAIRS = ["EUR/USD","GBP/USD","USD/JPY","USD/CHF","AUD/USD","NZD/USD","USD/CAD","EUR/GBP","EUR/JPY","GBP/JPY","XAU/USD","US30","NAS100","SPX500","Other"];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
const SESSIONS = ["London","New York","London/NY Overlap","Asia","Pre-market"];
const TIMEFRAMES = ["1m","5m","15m","30m","1H","4H","D"];
const EMOTIONS = ["Calm","Confident","Anxious","FOMO","Doubtful","Patient","Impulsive","Neutral"];
const CURRENCIES = ["USD","EUR","GBP","MXN"];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Bebas+Neue&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .fadein { animation: fadein .2s ease; }
  ::-webkit-scrollbar { width: 4px; background: #070a0f; }
  ::-webkit-scrollbar-thumb { background: #1e2d3d; border-radius: 4px; }
  input, select, textarea { outline: none; }
`;

function Inp({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "IBM Plex Mono, monospace" }} />
    </div>
  );
}

function Sel({ label, value, onChange, options, placeholder = "—" }) {
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
      <div style={{ fontSize: 32, opacity: 0.3 }}>◈</div>
      <div style={{ fontSize: 11, letterSpacing: 2 }}>{text}</div>
    </div>
  );
}

function SLabel({ children }) {
  return <div style={{ fontSize: 9, color: C.muted, letterSpacing: 3, marginBottom: 12 }}>{children}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div onMouseDown={e => e.stopPropagation()} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, width: "min(580px,100%)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, letterSpacing: 3 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        <div onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()} style={{ padding: "20px 22px", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [accounts, setAccounts] = useState([]);
  const [trades, setTrades] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [modal, setModal] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  // ── SUPABASE CONFIG ───────────────────────────────────────────────────────
  const SUPA_URL = "https://ewbcjvjzravyclgcgtzk.supabase.co";
  const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3YmNqdmp6cmF2eWNsZ2NndHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzQ4MTEsImV4cCI6MjA5MTExMDgxMX0.frkGQY3tWZu2FkzFI-HdPNhUEgkoMBGTc-7_OwrnpqY";
  const H = {"Content-Type": "application/json", apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, Prefer: "return=representation"};

  const dbGet = async (table) => {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?order=created_at.asc`, {headers: H});
    return r.json();
  };
  const dbUpsert = async (table, rows) => {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, {method:"POST", headers:{...H, Prefer:"resolution=merge-duplicates,return=representation"}, body:JSON.stringify(rows)});
    return r.json();
  };
  const dbDelete = async (table, id) => {
    await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {method:"DELETE", headers:H});
  };

  // ── LOAD from Supabase ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [a, t, p, pr] = await Promise.all([dbGet("accounts"), dbGet("trades"), dbGet("patterns"), dbGet("pairs")]);
        if (Array.isArray(a)) setAccounts(a.map(r => ({id:r.id, name:r.name, broker:r.broker, size:r.size, currency:r.currency, maxDaily:r.max_daily, maxDrawdown:r.max_drawdown})));
        if (Array.isArray(t)) setTrades(t.map(r => ({id:r.id, accountId:r.account_id, date:r.date, day:r.day, time:r.time, session:r.session, pair:r.pair, type:r.type, patternId:r.pattern_id, timeframe:r.timeframe, result:r.result, pnl:parseFloat(r.pnl)||0, riskPct:r.risk_pct, riskAmount:r.risk_amount, emotion:r.emotion, entryLink:r.entry_link, exitLink:r.exit_link, entryNotes:r.entry_notes, exitNotes:r.exit_notes, mistakes:r.mistakes})));
        if (Array.isArray(p)) setPatterns(p.map(r => ({id:r.id, name:r.name, timeframe:r.timeframe, session:r.session, pairs:r.pairs, description:r.description, rules:r.rules, confirmations:r.confirmations, imageLink:r.image_link})));
        if (Array.isArray(pr)) setPairs(pr.map(r => ({id:r.id, symbol:r.symbol, description:r.description||""})));
      } catch (e) { setSaveStatus("⚠ Connection error"); }
      setLoading(false);
    };
    load();
  }, []);

  // ── SAVE to Supabase ──────────────────────────────────────────────────────
  const saveAccounts = async (data) => {
    const prev = accounts;
    setAccounts(data);
    setSaveStatus("Saving...");
    try {
      const deleted = prev.filter(a => !data.find(d => d.id === a.id));
      await Promise.all(deleted.map(a => dbDelete("accounts", a.id)));
      if (data.length) await dbUpsert("accounts", data.map(a => ({id:a.id, name:a.name, broker:a.broker||null, size:a.size||null, currency:a.currency||"USD", max_daily:a.maxDaily||null, max_drawdown:a.maxDrawdown||null})));
      setSaveStatus("✓ Saved");
    } catch { setSaveStatus("⚠ Save error"); }
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const saveTrades = async (data) => {
    const prev = trades;
    setTrades(data);
    setSaveStatus("Saving...");
    try {
      const deleted = prev.filter(t => !data.find(d => d.id === t.id));
      await Promise.all(deleted.map(t => dbDelete("trades", t.id)));
      if (data.length) await dbUpsert("trades", data.map(t => ({id:t.id, account_id:t.accountId||null, date:t.date||null, day:t.day||null, time:t.time||null, session:t.session||null, pair:t.pair||null, type:t.type||null, pattern_id:t.patternId||null, timeframe:t.timeframe||null, result:t.result||"pending", pnl:t.pnl||0, risk_pct:t.riskPct||null, risk_amount:t.riskAmount||null, emotion:t.emotion||null, entry_link:t.entryLink||null, exit_link:t.exitLink||null, entry_notes:t.entryNotes||null, exit_notes:t.exitNotes||null, mistakes:t.mistakes||null})));
      setSaveStatus("✓ Saved");
    } catch { setSaveStatus("⚠ Save error"); }
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const savePatterns = async (data) => {
    const prev = patterns;
    setPatterns(data);
    setSaveStatus("Saving...");
    try {
      const deleted = prev.filter(p => !data.find(d => d.id === p.id));
      await Promise.all(deleted.map(p => dbDelete("patterns", p.id)));
      if (data.length) await dbUpsert("patterns", data.map(p => ({id:p.id, name:p.name, timeframe:p.timeframe||null, session:p.session||null, pairs:p.pairs||null, description:p.description||null, rules:p.rules||null, confirmations:p.confirmations||null, image_link:p.imageLink||null})));
      setSaveStatus("✓ Saved");
    } catch { setSaveStatus("⚠ Save error"); }
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const savePairs = async (data) => {
    const prev = pairs;
    setPairs(data);
    setSaveStatus("Saving...");
    try {
      const deleted = prev.filter(p => !data.find(d => d.id === p.id));
      await Promise.all(deleted.map(p => dbDelete("pairs", p.id)));
      if (data.length) await dbUpsert("pairs", data.map(p => ({id:p.id, symbol:p.symbol, description:p.description||""})));
      setSaveStatus("✓ Saved");
    } catch { setSaveStatus("⚠ Save error"); }
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const close = () => setModal(null);

  const stats = useMemo(() => {
    const wins = trades.filter(t => t.result === "win");
    const losses = trades.filter(t => t.result === "loss");
    const totalPnl = trades.reduce((a, t) => a + (t.pnl || 0), 0);
    const avgWin = wins.length ? wins.reduce((a, t) => a + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + t.pnl, 0) / losses.length) : 0;
    const rr = avgLoss ? (avgWin / avgLoss).toFixed(2) : "—";
    return { totalPnl, wins: wins.length, losses: losses.length, winrate: pct(wins.length, wins.length + losses.length), rr, avgWin, avgLoss, total: trades.length };
  }, [trades]);

  const acctName = id => (accounts.find(a => a.id === id) || {}).name || "—";
  const patName = id => (patterns.find(p => p.id === id) || {}).name || "—";

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg, flexDirection: "column", gap: 14, fontFamily: "IBM Plex Mono, monospace" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin .9s linear infinite" }} />
      <div style={{ color: C.accent, fontSize: 11, letterSpacing: 3 }}>LOADING YOUR DATA...</div>
    </div>
  );

  const navItems = [
    { id: "dashboard", icon: "▦", label: "Dashboard" },
    { id: "trades", icon: "⟳", label: "Trades" },
    { id: "patterns", icon: "◈", label: "Patterns" },
    { id: "pairs", icon: "◎", label: "Pairs" },
    { id: "compass", icon: "⊕", label: "AI Compass" },
    { id: "accounts", icon: "▣", label: "Accounts" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "IBM Plex Mono, monospace" }}>
      <style>{css}</style>

      {/* SIDEBAR */}
      <aside style={{ width: 210, background: C.panel, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 24, letterSpacing: 3 }}>TRADE<span style={{ color: C.accent }}>LOG</span></div>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 3, marginTop: 2 }}>FOREX JOURNAL</div>
        </div>

        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 3, padding: "16px 20px 6px" }}>MENU</div>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", background: tab === n.id ? `rgba(0,201,255,0.07)` : "transparent", border: "none", borderRight: tab === n.id ? `3px solid ${C.accent}` : "3px solid transparent", color: tab === n.id ? C.text : C.muted, fontSize: 12, letterSpacing: 1, cursor: "pointer", width: "100%", textAlign: "left" }}>
            <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{n.icon}</span>{n.label}
          </button>
        ))}

        <div style={{ marginTop: "auto", padding: 16, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 3, marginBottom: 6 }}>TOTAL P&L</div>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 26, color: stats.totalPnl >= 0 ? C.green : C.red }}>{fmt(stats.totalPnl)}</div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{stats.total} trades · {stats.winrate} WR</div>
          {saveStatus && <div style={{ fontSize: 10, color: C.accent, marginTop: 10, letterSpacing: 1 }}>{saveStatus}</div>}
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 26px", borderBottom: `1px solid ${C.border}`, background: C.panel, flexShrink: 0 }}>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 20, letterSpacing: 3 }}>
            {{ dashboard: "DASHBOARD", trades: "TRADE LOG", patterns: "PATTERNS", pairs: "MY PAIRS", compass: "AI COMPASS", accounts: "ACCOUNTS" }[tab]}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {tab === "accounts" && <Btn onClick={() => setModal({ type: "account" })}>+ Account</Btn>}
            {tab === "trades" && <Btn onClick={() => setModal({ type: "trade" })}>+ Trade</Btn>}
            {tab === "patterns" && <Btn onClick={() => setModal({ type: "pattern" })}>+ Pattern</Btn>}
            {tab === "pairs" && <Btn onClick={() => setModal({ type: "pair" })}>+ Pair</Btn>}
            {tab === "dashboard" && <>
              <Btn ghost onClick={() => setModal({ type: "pattern" })} color={C.accent}>+ Pattern</Btn>
              <Btn onClick={() => setModal({ type: "trade" })}>+ Trade</Btn>
            </>}
          </div>
        </div>

        <div className="fadein" style={{ flex: 1, padding: "22px 26px", overflowY: "auto" }}>
          {tab === "dashboard" && <Dashboard trades={trades} stats={stats} patterns={patterns} acctName={acctName} patName={patName} onViewTrade={id => setModal({ type: "view-trade", id })} />}
          {tab === "trades" && <TradeLog trades={trades} acctName={acctName} patName={patName} onView={id => setModal({ type: "view-trade", id })} />}
          {tab === "patterns" && <PatternLog patterns={patterns} trades={trades} onView={id => setModal({ type: "view-pattern", id })} />}
          {tab === "compass" && <Compass trades={trades} stats={stats} patName={patName} aiResult={aiResult} setAiResult={setAiResult} aiLoading={aiLoading} setAiLoading={setAiLoading} />}
          {tab === "pairs" && <PairsLog pairs={pairs} onEdit={id => setModal({ type: "pair", id })} />}
          {tab === "accounts" && <AccountLog accounts={accounts} trades={trades} onEdit={id => setModal({ type: "account", id })} />}
        </div>
      </div>

      {/* MODALS */}
      {modal?.type === "account" && (
        <AccountModal
          account={modal.id ? accounts.find(a => a.id === modal.id) : null}
          onClose={close}
          onSave={acc => { saveAccounts(modal.id ? accounts.map(a => a.id === modal.id ? acc : a) : [...accounts, acc]); close(); }}
          onDelete={id => { saveAccounts(accounts.filter(a => a.id !== id)); close(); }}
        />
      )}
      {modal?.type === "trade" && (
        <TradeModal
          trade={modal.id ? trades.find(t => t.id === modal.id) : null}
          accounts={accounts} patterns={patterns} pairs={pairs} allTrades={trades} onClose={close}
          onSave={t => {
            if (modal.id) {
              // editing: t is a single object
              saveTrades(trades.map(x => x.id === modal.id ? t : x));
            } else {
              // new: t may be an array (multiple accounts)
              const newTrades = Array.isArray(t) ? t : [t];
              saveTrades([...trades, ...newTrades]);
            }
            close();
          }}
          onDelete={id => { saveTrades(trades.filter(t => t.id !== id)); close(); }}
        />
      )}
      {modal?.type === "pattern" && (
        <PatternModal
          pattern={modal.id ? patterns.find(p => p.id === modal.id) : null}
          onClose={close}
          onSave={p => { savePatterns(modal.id ? patterns.map(x => x.id === modal.id ? p : x) : [...patterns, p]); close(); }}
          onDelete={id => { savePatterns(patterns.filter(p => p.id !== id)); close(); }}
        />
      )}
      {modal?.type === "pair" && (
        <PairModal
          pair={modal.id ? pairs.find(p => p.id === modal.id) : null}
          onClose={close}
          onSave={p => { savePairs(modal.id ? pairs.map(x => x.id === modal.id ? p : x) : [...pairs, p]); close(); }}
          onDelete={id => { savePairs(pairs.filter(p => p.id !== id)); close(); }}
        />
      )}
      {modal?.type === "view-trade" && (
        <TradeViewModal trade={trades.find(t => t.id === modal.id)} acctName={acctName} patName={patName}
          allTrades={trades} patterns={patterns}
          onClose={close} onEdit={() => setModal({ type: "trade", id: modal.id })} />
      )}
      {modal?.type === "view-pattern" && (
        <PatternViewModal pattern={patterns.find(p => p.id === modal.id)} trades={trades}
          onClose={close} onEdit={() => setModal({ type: "pattern", id: modal.id })} />
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ trades, stats, patterns, acctName, patName, onViewTrade }) {
  const pm = {};
  trades.forEach(t => {
    if (!t.patternId) return;
    if (!pm[t.patternId]) pm[t.patternId] = { wins: 0, total: 0, pnl: 0 };
    pm[t.patternId].total++;
    pm[t.patternId].pnl += t.pnl || 0;
    if (t.result === "win") pm[t.patternId].wins++;
  });
  const topPatterns = Object.entries(pm).sort((a, b) => b[1].pnl - a[1].pnl).slice(0, 5);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 22 }}>
        {[
          { label: "TOTAL P&L", val: fmt(stats.totalPnl), color: stats.totalPnl >= 0 ? C.green : C.red },
          { label: "TRADES", val: stats.total },
          { label: "WINNERS", val: stats.wins, color: C.green },
          { label: "LOSERS", val: stats.losses, color: C.red },
          { label: "WIN RATE", val: stats.winrate },
          { label: "R:R", val: stats.rr !== "—" ? stats.rr + ":1" : "—" },
        ].map(s => (
          <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "13px 14px" }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 20, color: s.color || C.text }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <SLabel>RECENT TRADES</SLabel>
          {!trades.length ? <Empty text="No trades yet" /> :
            [...trades].reverse().slice(0, 5).map(t => <TradeRow key={t.id} t={t} acctName={acctName} patName={patName} onClick={() => onViewTrade(t.id)} />)}
        </div>
        <div>
          <SLabel>TOP PATTERNS</SLabel>
          {!topPatterns.length ? <Empty text="No pattern data yet" /> :
            topPatterns.map(([id, d]) => (
              <div key={id} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{patName(id)}</div>
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{d.wins}/{d.total} wins</div>
                </div>
                <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, color: d.pnl >= 0 ? C.green : C.red }}>{fmt(d.pnl)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function TradeRow({ t, acctName, patName, onClick, full = false }) {
  const meta = { win: { c: C.green, i: "▲" }, loss: { c: C.red, i: "▼" }, pending: { c: C.gold, i: "◌" }, breakeven: { c: C.muted, i: "─" } };
  const r = meta[t.result] || meta.pending;
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 14px", marginBottom: 6, cursor: "pointer" }}>
      <div style={{ fontSize: 18, color: r.c, width: 20, textAlign: "center", flexShrink: 0 }}>{r.i}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {t.pair}
          <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, fontWeight: 700, background: t.type === "buy" ? "rgba(16,217,138,.15)" : "rgba(246,59,59,.15)", color: t.type === "buy" ? C.green : C.red, border: `1px solid ${t.type === "buy" ? C.green : C.red}44` }}>{(t.type || "").toUpperCase()}</span>
          {t.patternId && <Tag>{patName(t.patternId)}</Tag>}
        </div>
        <div style={{ fontSize: 10, color: C.dim, marginTop: 3 }}>
          {[t.date, t.time, t.day, full && t.session, acctName(t.accountId)].filter(Boolean).join(" · ")}
        </div>
      </div>
      {full && t.emotion && <Tag>{t.emotion}</Tag>}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 16, color: (t.pnl || 0) >= 0 ? C.green : C.red }}>{fmt(t.pnl)}</div>
        {t.riskPct && <div style={{ fontSize: 10, color: C.dim }}>Risk: {t.riskPct}%</div>}
      </div>
      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
        {t.entryLink && <a href={t.entryLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 10, padding: "3px 7px", background: "#071520", border: `1px solid ${C.accent}33`, color: C.accent, borderRadius: 3 }}>↗ Entry</a>}
        {t.exitLink && <a href={t.exitLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 10, padding: "3px 7px", background: "#071a10", border: `1px solid ${C.green}33`, color: C.green, borderRadius: 3 }}>↗ Exit</a>}
      </div>
    </div>
  );
}

function TradeLog({ trades, acctName, patName, onView }) {
  if (!trades.length) return <Empty text="No trades yet. Add your first one!" />;
  return <div>{[...trades].reverse().map(t => <TradeRow key={t.id} t={t} acctName={acctName} patName={patName} onClick={() => onView(t.id)} full />)}</div>;
}

function PatternLog({ patterns, trades, onView }) {
  if (!patterns.length) return <Empty text="No patterns yet. Document your setups!" />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
      {patterns.map(p => {
        const pt = trades.filter(t => t.patternId === p.id);
        const wins = pt.filter(t => t.result === "win").length;
        const pnl = pt.reduce((a, t) => a + (t.pnl || 0), 0);
        return (
          <div key={p.id} onClick={() => onView(p.id)} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, letterSpacing: 2 }}>{p.name}</div>
              {p.timeframe && <span style={{ fontSize: 10, color: C.accent, background: `${C.accent}15`, padding: "2px 7px", borderRadius: 3 }}>{p.timeframe}</span>}
            </div>
            {p.description && <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.7, marginBottom: 10 }}>{p.description}</div>}
            {p.rules && <pre style={{ fontSize: 11, color: C.text, lineHeight: 1.8, background: C.bg, padding: 10, borderRadius: 6, marginBottom: 10, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{p.rules}</pre>}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {p.session && <Tag>{p.session}</Tag>}
              {pt.length > 0 && <Tag color={C.accent}>{wins}/{pt.length} wins · {fmt(pnl)}</Tag>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Compass({ trades, stats, patName, aiResult, setAiResult, aiLoading, setAiLoading }) {
  const insights = [];
  if (trades.length >= 3) {
    if (stats.avgLoss > stats.avgWin * 1.5) insights.push("⚠️ Your average loss is 1.5x your average win. Tighten your stop or extend your target.");
    if (parseFloat(stats.winrate) > 60) insights.push("✅ Strong win rate (" + stats.winrate + "). Protect that edge.");
    if (parseFloat(stats.winrate) < 40) insights.push("🔴 Win rate is low (" + stats.winrate + "). Review your entry criteria.");
    if (parseFloat(stats.rr) > 0 && parseFloat(stats.rr) < 1) insights.push("📐 R:R is below 1:1. Look for better risk/reward setups.");
    if (parseFloat(stats.rr) >= 2) insights.push("📐 Excellent R:R of " + stats.rr + ":1. Keep that discipline.");
    const em = {};
    trades.forEach(t => { if (t.emotion) em[t.emotion] = (em[t.emotion] || 0) + (t.result === "loss" ? 1 : 0); });
    const worst = Object.entries(em).sort((a, b) => b[1] - a[1])[0];
    if (worst?.[1] > 0) insights.push(`🧠 You lose more when feeling "${worst[0]}". Consider pausing in that state.`);
    const dayMap = {};
    trades.forEach(t => { if (t.day) { if (!dayMap[t.day]) dayMap[t.day] = { w: 0, t: 0 }; dayMap[t.day].t++; if (t.result === "win") dayMap[t.day].w++; } });
    const best = Object.entries(dayMap).sort((a, b) => (b[1].w / b[1].t) - (a[1].w / a[1].t))[0];
    if (best) insights.push(`📅 Best day: ${best[0]} (${Math.round(best[1].w / best[1].t * 100)}% WR).`);
  }

  const runAI = async () => {
    if (!trades.length) return;
    setAiLoading(true); setAiResult(null);
    const prompt = `You are an expert forex trading coach. Analyze this data and respond ONLY with valid JSON (no markdown):
STATS: ${JSON.stringify({ total: trades.length, wins: stats.wins, losses: stats.losses, winrate: stats.winrate, avgWin: stats.avgWin.toFixed(2), avgLoss: stats.avgLoss.toFixed(2), rr: stats.rr, totalPnl: stats.totalPnl.toFixed(2) })}
TRADES: ${JSON.stringify(trades.map(t => ({ date: t.date, day: t.day, time: t.time, pair: t.pair, type: t.type, pattern: patName(t.patternId), session: t.session, emotion: t.emotion || "—", result: t.result, pnl: t.pnl, riskPct: t.riskPct, notes: t.notes || "" })))}
JSON: {"overallAssessment":"...","oneThingToFocusOn":"...","strengths":["..."],"weaknesses":["..."],"psychologyInsights":"...","bestDayTime":"...","bestPair":"...","actionPlan":["...","...","...","..."]}`;
    try {
      const res = await fetch("/.netlify/functions/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }) });
      const data = await res.json();
      const text = (data.content || []).map(b => b.text || "").join("");
      setAiResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setAiResult({ error: true }); }
    setAiLoading(false);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}>
        <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 44, color: C.accent }}>⊕</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 22, letterSpacing: 3 }}>YOUR TRADER'S COMPASS</div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{trades.length} trades logged</div>
        </div>
        <Btn onClick={runAI} disabled={aiLoading || !trades.length}>{aiLoading ? "Analyzing..." : "⊕ AI Analysis"}</Btn>
      </div>

      <SLabel>AUTO INSIGHTS</SLabel>
      {!insights.length
        ? <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 20, color: C.dim, fontSize: 13 }}>Log at least 3 trades to generate insights.</div>
        : insights.map((ins, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "13px 15px", marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, flexShrink: 0, marginTop: 6 }} />
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>{ins}</div>
          </div>
        ))}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, margin: "18px 0 22px" }}>
        {[["WIN RATE", stats.winrate], ["AVG R:R", stats.rr !== "—" ? stats.rr + ":1" : "—"], ["AVG WIN", fmt(stats.avgWin)], ["AVG LOSS", fmt(stats.avgLoss)], ["WINNERS", stats.wins], ["LOSERS", stats.losses]].map(([l, v]) => (
          <div key={l} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>{l}</div>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, color: C.accent }}>{v}</div>
          </div>
        ))}
      </div>

      {aiLoading && (
        <div style={{ background: C.panel, border: `1px solid ${C.accent}33`, borderRadius: 10, padding: "32px 20px", textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin .9s linear infinite", margin: "0 auto 14px" }} />
          <div style={{ color: C.accent, fontSize: 12, letterSpacing: 2 }}>CLAUDE IS ANALYZING YOUR DATA...</div>
        </div>
      )}

      {aiResult && !aiLoading && (aiResult.error
        ? <div style={{ color: C.red, fontSize: 13, padding: 16 }}>Could not generate analysis. Try again.</div>
        : <div>
            <SLabel>⊕ AI DEEP ANALYSIS</SLabel>
            {[["OVERALL ASSESSMENT", aiResult.overallAssessment, C.muted]].map(([t, v, c]) => (
              <div key={t} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "15px 17px", marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: c, letterSpacing: 2, marginBottom: 8 }}>{t}</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{v}</div>
              </div>
            ))}
            <div style={{ background: C.panel, border: `1px solid ${C.accent}55`, borderRadius: 10, padding: "15px 17px", marginBottom: 12, background: `${C.accent}08` }}>
              <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, marginBottom: 8 }}>#1 THING TO FOCUS ON</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>{aiResult.oneThingToFocusOn}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[["✅ STRENGTHS", aiResult.strengths, C.green, "▲"], ["⚠️ TO IMPROVE", aiResult.weaknesses, C.red, "▼"]].map(([title, items, color, icon]) => (
                <div key={title} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "15px 17px" }}>
                  <div style={{ fontSize: 9, color, letterSpacing: 2, marginBottom: 10 }}>{title}</div>
                  {(items || []).map((s, i) => <div key={i} style={{ fontSize: 12, color: C.text, lineHeight: 1.7, padding: "4px 0", borderBottom: `1px solid ${C.border}66`, display: "flex", gap: 8 }}><span style={{ color }}>{icon}</span>{s}</div>)}
                </div>
              ))}
            </div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "15px 17px", marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: C.gold, letterSpacing: 2, marginBottom: 8 }}>🧠 PSYCHOLOGY</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{aiResult.psychologyInsights}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[["BEST DAY/TIME", aiResult.bestDayTime], ["BEST PAIR", aiResult.bestPair]].map(([l, v]) => (
                <div key={l} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "15px 17px" }}>
                  <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>{l}</div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "15px 17px" }}>
              <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, marginBottom: 10 }}>📋 ACTION PLAN</div>
              {(aiResult.actionPlan || []).map((a, i) => <div key={i} style={{ fontSize: 12, color: C.text, lineHeight: 1.7, padding: "5px 0", borderBottom: `1px solid ${C.border}66`, display: "flex", gap: 10 }}><span style={{ color: C.accent, fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>{a}</div>)}
            </div>
          </div>
      )}
    </div>
  );
}

function PairsLog({ pairs, onEdit }) {
  if (!pairs.length) return (
    <div>
      <Empty text="No pairs yet. Add the forex pairs you trade!" />
      <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: C.muted, lineHeight: 1.8 }}>
        Examples: EUR/USD, GBP/USD, XAU/USD, US30, NAS100...
      </div>
    </div>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
      {pairs.map(p => (
        <div key={p.id} onClick={() => onEdit(p.id)}
          style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", cursor: "pointer", transition: "border-color .15s" }}>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 22, letterSpacing: 3, color: C.accent, marginBottom: 6 }}>{p.symbol}</div>
          {p.description && <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.6 }}>{p.description}</div>}
          <div style={{ fontSize: 9, color: C.muted, marginTop: 10, letterSpacing: 1 }}>✎ click to edit</div>
        </div>
      ))}
    </div>
  );
}

function PairModal({ pair, onClose, onSave, onDelete }) {
  const p = pair || {};
  const [symbol, setSymbol] = useState(p.symbol || "");
  const [description, setDescription] = useState(p.description || "");
  const save = () => {
    if (!symbol.trim()) return alert("Symbol required (e.g. EUR/USD)");
    onSave({ id: p.id || uid(), symbol: symbol.toUpperCase().trim(), description });
  };
  return (
    <Modal title={p.id ? "EDIT PAIR" : "NEW PAIR"} onClose={onClose}>
      <Inp label="SYMBOL" value={symbol} onChange={setSymbol} placeholder="e.g. EUR/USD, XAU/USD, US30" />
      <div style={{ marginBottom: 13 }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>NOTES (optional)</div>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="e.g. Best during London session, high volatility..."
          rows={3} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "IBM Plex Mono, monospace", resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={save} full>Save Pair</Btn>
        {p.id && <Btn danger onClick={() => { if (confirm("Delete this pair?")) onDelete(p.id); }}>Delete</Btn>}
      </div>
    </Modal>
  );
}

function AccountLog({ accounts, trades, onEdit }) {
  if (!accounts.length) return <Empty text="No accounts yet. Add your first funded account!" />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
      {accounts.map(acc => {
        const at = trades.filter(t => t.accountId === acc.id);
        const apnl = at.reduce((a, t) => a + (t.pnl || 0), 0);
        return (
          <div key={acc.id} onClick={() => onEdit(acc.id)} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, cursor: "pointer" }}>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, letterSpacing: 2, marginBottom: 3 }}>{acc.name}</div>
            <div style={{ fontSize: 10, color: C.dim, marginBottom: 12 }}>{acc.broker}{acc.size ? ` · $${Number(acc.size).toLocaleString()}` : ""}</div>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 24, color: apnl >= 0 ? C.green : C.red, marginBottom: 10 }}>{fmt(apnl)}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted }}>
              <span>{at.length} trades</span><span>{acc.currency || "USD"}</span>
            </div>
            <div style={{ fontSize: 9, color: C.muted, marginTop: 8, letterSpacing: 1 }}>✎ click to edit</div>
          </div>
        );
      })}
    </div>
  );
}

function AccountModal({ account, onClose, onSave, onDelete }) {
  const a = account || {};
  const [name, setName] = useState(a.name || "");
  const [broker, setBroker] = useState(a.broker || "");
  const [size, setSize] = useState(a.size || "");
  const [currency, setCurrency] = useState(a.currency || "USD");
  const [maxDaily, setMaxDaily] = useState(a.maxDaily || "");
  const [maxDrawdown, setMaxDrawdown] = useState(a.maxDrawdown || "");
  const save = () => { if (!name.trim()) return alert("Account name required"); onSave({ id: a.id || uid(), name, broker, size, currency, maxDaily, maxDrawdown }); };
  return (
    <Modal title={a.id ? "EDIT ACCOUNT" : "NEW ACCOUNT"} onClose={onClose}>
      <Inp label="ACCOUNT NAME" value={name} onChange={setName} placeholder="e.g. FTMO $10K Challenge" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Inp label="BROKER / FIRM" value={broker} onChange={setBroker} placeholder="FTMO, TopStep..." />
        <Inp label="ACCOUNT SIZE ($)" value={size} onChange={setSize} type="number" placeholder="10000" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="CURRENCY" value={currency} onChange={setCurrency} options={CURRENCIES} />
        <Inp label="MAX DAILY LOSS %" value={maxDaily} onChange={setMaxDaily} type="number" placeholder="5" />
      </div>
      <Inp label="MAX DRAWDOWN %" value={maxDrawdown} onChange={setMaxDrawdown} type="number" placeholder="10" />
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Btn onClick={save} full>Save Account</Btn>
        {a.id && <Btn danger onClick={() => { if (confirm("Delete this account?")) onDelete(a.id); }}>Delete</Btn>}
      </div>
    </Modal>
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

function TradeModal({ trade, accounts, patterns, pairs, allTrades, onClose, onSave, onDelete }) {
  const t = trade || {};
  const [selectedAccountIds, setSelectedAccountIds] = useState(
    t.accountId ? [t.accountId] : (accounts[0] ? [accounts[0].id] : [])
  );
  const toggleAccount = (id) => {
    setSelectedAccountIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  const [date, setDate] = useState(t.date || new Date().toISOString().slice(0, 10));
  const [day, setDay] = useState(t.day || "");
  const [time, setTime] = useState(t.time || "");
  const [session, setSession] = useState(t.session || "");
  const [pair, setPair] = useState(t.pair || "EUR/USD");
  const [type, setType] = useState(t.type || "buy");
  const [patternId, setPatternId] = useState(t.patternId || "");
  const [timeframe, setTimeframe] = useState(t.timeframe || "");
  const [result, setResult] = useState(t.result || "pending");
  const [pnl, setPnl] = useState(t.pnl ?? "");
  const [riskPct, setRiskPct] = useState(t.riskPct || "");
  const [riskAmount, setRiskAmount] = useState(t.riskAmount || "");
  const [emotion, setEmotion] = useState(t.emotion || "");
  const [entryLink, setEntryLink] = useState(t.entryLink || "");
  const [exitLink, setExitLink] = useState(t.exitLink || "");
  const [entryNotes, setEntryNotes] = useState(t.entryNotes || "");
  const [exitNotes, setExitNotes] = useState(t.exitNotes || "");
  const [mistakes, setMistakes] = useState(t.mistakes || "");
  const [miniCoach, setMiniCoach] = useState(null);
  const [miniCoachLoading, setMiniCoachLoading] = useState(false);

  const patName = id => (patterns.find(p => p.id === id) || {}).name || "—";

  const handleResultChange = async (newResult) => {
    setResult(newResult);
    if (newResult === "win" || newResult === "loss" || newResult === "breakeven") {
      setMiniCoachLoading(true);
      setMiniCoach(null);
      const history = (allTrades || []).slice(-15).map(tr => ({
        pair: tr.pair, result: tr.result, pnl: tr.pnl,
        emotion: tr.emotion, pattern: patName(tr.patternId),
        entryNotes: tr.entryNotes || "", exitNotes: tr.exitNotes || "", mistakes: tr.mistakes || ""
      }));
      const patRules = patterns.map(p => ({ name: p.name, rules: p.rules }));
      const prompt = `You are a brief, direct forex trading coach. A trader just closed a trade as "${newResult}". Give them a short, punchy coaching message. Respond ONLY with valid JSON:
TRADE: ${JSON.stringify({ pair: pair || "—", type, pattern: patName(patternId), result: newResult, pnl: parseFloat(pnl)||0, emotion, entryNotes: entryNotes||"none", exitNotes: exitNotes||"none", mistakes: mistakes||"none" })}
PATTERN RULES: ${JSON.stringify(patRules)}
HISTORY: ${JSON.stringify(history)}
JSON: {"message":"2-3 sentences of direct coaching based on this result and their history","emoji":"one relevant emoji","tone":"positive|warning|neutral"}`;
      try {
        const res = await fetch("/.netlify/functions/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 200, messages: [{ role: "user", content: prompt }] }) });
        const data = await res.json();
        const text = (data.content || []).map(b => b.text || "").join("");
        setMiniCoach(JSON.parse(text.replace(/```json|```/g, "").trim()));
      } catch { setMiniCoach(null); }
      setMiniCoachLoading(false);
    } else {
      setMiniCoach(null);
    }
  };

  const save = () => {
    if (!pair) return;
    if (!selectedAccountIds.length) return alert("Select at least one account");
    const base = { date, day, time, session, pair, type, patternId, timeframe, result, pnl: parseFloat(pnl) || 0, riskPct, riskAmount, emotion, entryLink, exitLink, entryNotes, exitNotes, mistakes };
    if (t.id) {
      // editing existing — update only this trade's account
      onSave({ ...base, id: t.id, accountId: selectedAccountIds[0] });
    } else {
      // new trade — create one per selected account
      onSave(selectedAccountIds.map(accId => ({ ...base, id: uid(), accountId: accId })));
    }
  };

  // TA is defined outside to prevent remount on re-render

  return (
    <Modal title={t.id ? "EDIT TRADE" : "NEW TRADE"} onClose={onClose}>
      <div style={{ marginBottom: 13 }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 8 }}>ACCOUNTS — select one or more</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {accounts.map(a => (
            <div key={a.id} onClick={() => !t.id && toggleAccount(a.id)}
              style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${selectedAccountIds.includes(a.id) ? C.accent : C.border}`, background: selectedAccountIds.includes(a.id) ? `${C.accent}15` : C.bg, color: selectedAccountIds.includes(a.id) ? C.accent : C.dim, fontSize: 12, cursor: t.id ? "default" : "pointer", transition: "all .15s", fontFamily: "IBM Plex Mono, monospace" }}>
              {selectedAccountIds.includes(a.id) ? "✓ " : ""}{a.name}
            </div>
          ))}
        </div>
        {!t.id && selectedAccountIds.length > 1 && (
          <div style={{ fontSize: 10, color: C.gold, marginTop: 6, letterSpacing: 1 }}>⚡ Will create {selectedAccountIds.length} trades — one per account</div>
        )}
      </div>
      <div style={{ marginBottom: 13 }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>DATE</div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "IBM Plex Mono, monospace" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Sel label="DAY" value={day} onChange={setDay} options={DAYS} />
        <Inp label="TIME" value={time} onChange={setTime} type="time" />
        <Sel label="SESSION" value={session} onChange={setSession} options={SESSIONS} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>PAIR</div>
          <select value={pair} onChange={e => setPair(e.target.value)}
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "IBM Plex Mono, monospace" }}>
            <option value="">Select pair...</option>
            {pairs && pairs.length > 0
              ? pairs.map(p => <option key={p.id} value={p.symbol}>{p.symbol}</option>)
              : PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {pairs && pairs.length === 0 && <div style={{ fontSize: 9, color: C.muted, marginTop: 4, letterSpacing: 1 }}>Add pairs in the Pairs section to customize this list</div>}
        </div>
        <Sel label="TYPE" value={type} onChange={setType} options={[{ value: "buy", label: "BUY (Long)" }, { value: "sell", label: "SELL (Short)" }]} placeholder="" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="PATTERN USED" value={patternId} onChange={setPatternId} options={patterns.map(p => ({ value: p.id, label: p.name }))} placeholder="— No pattern —" />
        <Sel label="TIMEFRAME" value={timeframe} onChange={setTimeframe} options={TIMEFRAMES} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Inp label="RISK $ AMOUNT" value={riskAmount} onChange={setRiskAmount} type="number" placeholder="0.00" />
        <Sel label="EMOTION AT ENTRY" value={emotion} onChange={setEmotion} options={EMOTIONS} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Inp label="TRADINGVIEW ENTRY LINK" value={entryLink} onChange={setEntryLink} placeholder="https://..." />
        <Inp label="TRADINGVIEW EXIT LINK" value={exitLink} onChange={setExitLink} placeholder="https://..." />
      </div>

      {/* TWO NOTES BOXES */}
      <div style={{ background: `${C.accent}08`, border: `1px solid ${C.accent}22`, borderRadius: 8, padding: "14px", marginBottom: 13 }}>
        <div style={{ fontSize: 9, color: C.accent, letterSpacing: 3, marginBottom: 10 }}>📝 TRADE NOTES</div>
        <TA label="ENTRY NOTES — What do you see? Why are you entering?" value={entryNotes} onChange={setEntryNotes}
          placeholder={"What pattern did you see?\nWhy does this setup make sense?\nWhat are you expecting to happen?"} rows={3} color={C.accent} />
        <TA label="EXIT NOTES — What happened? What did you observe?" value={exitNotes} onChange={setExitNotes}
          placeholder={"What happened after entry?\nDid price do what you expected?\nWhen/why did you exit?"} rows={3} color={C.green} />
        <TA label="MISTAKES / ERRORS — What went wrong? (write 'none' if no errors)" value={mistakes} onChange={setMistakes}
          placeholder={"Did you enter too early?\nDid you move your stop?\nDid you break a rule?\n→ Write 'none' if everything was correct."} rows={2} color={C.red} />
      </div>

      {/* RESULT + P&L + RISK */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>RESULT</div>
          <select value={result} onChange={e => handleResultChange(e.target.value)}
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "IBM Plex Mono, monospace" }}>
            {["pending","win","loss","breakeven"].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
          </select>
        </div>
        <Inp label="P&L (USD)" value={pnl} onChange={setPnl} type="number" placeholder="±0.00" />
        <Inp label="RISK %" value={riskPct} onChange={setRiskPct} type="number" placeholder="1" />
      </div>

      {/* MINI COACH */}
      {miniCoachLoading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: C.bg, border: `1px solid ${C.accent}22`, borderRadius: 8, marginBottom: 13 }}>
          <div style={{ width: 16, height: 16, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: C.dim }}>AI coach reviewing your trade...</div>
        </div>
      )}
      {miniCoach && !miniCoachLoading && (
        <div style={{ padding: "12px 14px", background: miniCoach.tone === "positive" ? `${C.green}0a` : miniCoach.tone === "warning" ? `${C.red}0a` : C.bg, border: `1px solid ${miniCoach.tone === "positive" ? C.green : miniCoach.tone === "warning" ? C.red : C.border}33`, borderRadius: 8, marginBottom: 13 }}>
          <div style={{ fontSize: 9, color: miniCoach.tone === "positive" ? C.green : miniCoach.tone === "warning" ? C.red : C.muted, letterSpacing: 2, marginBottom: 6 }}>⊕ AI MINI COACH</div>
          <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text }}>{miniCoach.emoji} {miniCoach.message}</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={save} full>Save Trade</Btn>
        {t.id && <Btn danger onClick={() => { if (confirm("Delete?")) onDelete(t.id); }}>Delete</Btn>}
      </div>
    </Modal>
  );
}

function PatternModal({ pattern, onClose, onSave, onDelete }) {
  const p = pattern || {};
  const [name, setName] = useState(p.name || "");
  const [timeframe, setTimeframe] = useState(p.timeframe || "");
  const [session, setSession] = useState(p.session || "");
  const [pairs, setPairs] = useState(p.pairs || "");
  const [description, setDescription] = useState(p.description || "");
  const [rules, setRules] = useState(p.rules || "");
  const [confirmations, setConfirmations] = useState(p.confirmations || "");
  const [imageLink, setImageLink] = useState(p.imageLink || "");
  const save = () => { if (!name.trim()) return alert("Name required"); onSave({ id: p.id || uid(), name, timeframe, session, pairs, description, rules, confirmations, imageLink }); };
  return (
    <Modal title={p.id ? "EDIT PATTERN" : "NEW PATTERN"} onClose={onClose}>
      <Inp label="PATTERN NAME" value={name} onChange={setName} placeholder="e.g. BOS Pullback 15m" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Sel label="TIMEFRAME" value={timeframe} onChange={setTimeframe} options={TIMEFRAMES} />
        <Sel label="BEST SESSION" value={session} onChange={setSession} options={SESSIONS} />
      </div>
      <Inp label="PAIRS (comma separated)" value={pairs} onChange={setPairs} placeholder="EUR/USD, GBP/USD..." />
      <div style={{ marginBottom: 13 }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>DESCRIPTION</div>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What conditions must be met?" rows={3}
          style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "IBM Plex Mono, monospace", resize: "vertical" }} />
      </div>
      <div style={{ marginBottom: 13 }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 5 }}>ENTRY RULES</div>
        <textarea value={rules} onChange={e => setRules(e.target.value)} placeholder={"1. Price above EMA 20\n2. Structure break\n3. Candle confirmation..."} rows={5}
          style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 6, fontSize: 12, fontFamily: "IBM Plex Mono, monospace", resize: "vertical" }} />
      </div>
      <Inp label="CONFIRMATIONS NEEDED" value={confirmations} onChange={setConfirmations} placeholder="RSI + structure + volume" />
      <Inp label="REFERENCE CHART LINK" value={imageLink} onChange={setImageLink} placeholder="https://..." />
      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={save} full>Save Pattern</Btn>
        {p.id && <Btn danger onClick={() => { if (confirm("Delete?")) onDelete(p.id); }}>Delete</Btn>}
      </div>
    </Modal>
  );
}

function TradeViewModal({ trade, acctName, patName, allTrades, patterns, onClose, onEdit }) {
  if (!trade) return null;
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const meta = { win: { c: C.green, i: "▲" }, loss: { c: C.red, i: "▼" }, pending: { c: C.gold, i: "◌" }, breakeven: { c: C.muted, i: "─" } };
  const r = meta[trade.result] || meta.pending;

  const det = (label, val) => (
    <div style={{ background: C.bg, borderRadius: 6, padding: "10px 12px" }}>
      <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{val || "—"}</div>
    </div>
  );

  const getAIFeedback = async () => {
    setAiLoading(true);
    setAiFeedback(null);
    // Build context from all previous trades and patterns
    const context = allTrades
      .filter(t => t.id !== trade.id)
      .slice(-20)
      .map(t => ({ pair: t.pair, type: t.type, pattern: patName(t.patternId), result: t.result, pnl: t.pnl, emotion: t.emotion, notes: t.notes || "", day: t.day, session: t.session }));
    const patternRules = patterns.map(p => ({ name: p.name, rules: p.rules, description: p.description }));
    const prompt = `You are an expert forex trading coach reviewing a specific trade. Analyze it deeply and give honest, specific feedback. Respond ONLY with valid JSON (no markdown):

THIS TRADE:
${JSON.stringify({ pair: trade.pair, type: trade.type, pattern: patName(trade.patternId), result: trade.result, pnl: trade.pnl, riskPct: trade.riskPct, emotion: trade.emotion, day: trade.day, time: trade.time, session: trade.session, entryNotes: trade.entryNotes || "none", exitNotes: trade.exitNotes || "none", mistakes: trade.mistakes || "none", entryLink: trade.entryLink ? "provided" : "none", exitLink: trade.exitLink ? "provided" : "none" })}

TRADER'S PATTERN RULES:
${JSON.stringify(patternRules)}

RECENT TRADE HISTORY (last 20):
${JSON.stringify(context)}

JSON format:
{
  "summary": "2-3 sentence honest assessment of this specific trade",
  "whatWentWell": ["point 1", "point 2"],
  "whatWentWrong": ["point 1", "point 2"],
  "ruleFollowed": true or false,
  "ruleAnalysis": "Did they follow their pattern rules? What was violated or respected?",
  "emotionImpact": "How did their emotion affect this trade?",
  "patternFromHistory": "What recurring pattern do you see in their history that relates to this trade?",
  "oneActionableTip": "The single most important thing to do differently next time"
}`;
    try {
      const res = await fetch("/.netlify/functions/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 800, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = (data.content || []).map(b => b.text || "").join("");
      setAiFeedback(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setAiFeedback({ error: true }); }
    setAiLoading(false);
  };

  return (
    <Modal title={`${trade.pair} · ${(trade.type || "").toUpperCase()}`} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{ fontSize: 32, color: r.c }}>{r.i}</div>
        <div>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 22, letterSpacing: 2 }}>{trade.pair}</div>
          <div style={{ fontSize: 11, color: C.dim }}>{[trade.date, trade.time, trade.day, acctName(trade.accountId)].filter(Boolean).join(" · ")}</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 26, color: (trade.pnl || 0) >= 0 ? C.green : C.red }}>{fmt(trade.pnl)}</div>
          {trade.riskPct && <div style={{ fontSize: 11, color: C.dim }}>Risk: {trade.riskPct}%</div>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
        {det("RESULT", trade.result)}{det("PATTERN", patName(trade.patternId))}{det("TIMEFRAME", trade.timeframe)}
        {det("SESSION", trade.session)}{det("EMOTION", trade.emotion)}{det("RISK $", trade.riskAmount ? `$${trade.riskAmount}` : null)}
      </div>

      {(trade.entryNotes || trade.exitNotes || trade.mistakes || trade.notes) && (
        <div style={{ marginBottom: 14 }}>
          {trade.entryNotes && <div style={{ background: `${C.accent}08`, border: `1px solid ${C.accent}22`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, marginBottom: 5 }}>📝 ENTRY NOTES</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text }}>{trade.entryNotes}</div>
          </div>}
          {trade.exitNotes && <div style={{ background: `${C.green}08`, border: `1px solid ${C.green}22`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.green, letterSpacing: 2, marginBottom: 5 }}>📝 EXIT NOTES</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text }}>{trade.exitNotes}</div>
          </div>}
          {trade.mistakes && <div style={{ background: `${C.red}08`, border: `1px solid ${C.red}22`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.red, letterSpacing: 2, marginBottom: 5 }}>⚠️ MISTAKES / ERRORS</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text }}>{trade.mistakes}</div>
          </div>}
          {trade.notes && !trade.entryNotes && <div style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 5 }}>NOTES</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text }}>{trade.notes}</div>
          </div>}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {trade.entryLink && <a href={trade.entryLink} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "6px 12px", background: "#071520", border: `1px solid ${C.accent}33`, color: C.accent, borderRadius: 4 }}>↗ TV Entry</a>}
        {trade.exitLink && <a href={trade.exitLink} target="_blank" rel="noreferrer" style={{ fontSize: 11, padding: "6px 12px", background: "#071a10", border: `1px solid ${C.green}33`, color: C.green, borderRadius: 4 }}>↗ TV Exit</a>}
      </div>

      {/* AI FEEDBACK SECTION */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: C.accent, letterSpacing: 3 }}>⊕ AI TRADE FEEDBACK</div>
          <Btn onClick={getAIFeedback} disabled={aiLoading} small ghost color={C.accent}>
            {aiLoading ? "Analyzing..." : aiFeedback ? "Refresh" : "Get AI Feedback"}
          </Btn>
        </div>

        {aiLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px", background: C.bg, borderRadius: 8 }}>
            <div style={{ width: 20, height: 20, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin .8s linear infinite", flexShrink: 0 }} />
            <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1 }}>Claude is reviewing your trade and history...</div>
          </div>
        )}

        {aiFeedback && !aiLoading && (aiFeedback.error
          ? <div style={{ fontSize: 12, color: C.red, padding: 12, background: C.bg, borderRadius: 8 }}>Could not generate feedback. Try again.</div>
          : <div>
              <div style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>SUMMARY</div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text }}>{aiFeedback.summary}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div style={{ background: "rgba(16,217,138,.06)", border: `1px solid ${C.green}22`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 9, color: C.green, letterSpacing: 2, marginBottom: 8 }}>✅ WHAT WENT WELL</div>
                  {(aiFeedback.whatWentWell || []).map((s, i) => <div key={i} style={{ fontSize: 11, color: C.text, lineHeight: 1.7, padding: "3px 0", display: "flex", gap: 6 }}><span style={{ color: C.green }}>▲</span>{s}</div>)}
                </div>
                <div style={{ background: "rgba(246,59,59,.06)", border: `1px solid ${C.red}22`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 9, color: C.red, letterSpacing: 2, marginBottom: 8 }}>⚠️ WHAT WENT WRONG</div>
                  {(aiFeedback.whatWentWrong || []).map((s, i) => <div key={i} style={{ fontSize: 11, color: C.text, lineHeight: 1.7, padding: "3px 0", display: "flex", gap: 6 }}><span style={{ color: C.red }}>▼</span>{s}</div>)}
                </div>
              </div>

              <div style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2 }}>PATTERN RULES</div>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: aiFeedback.ruleFollowed ? `${C.green}22` : `${C.red}22`, color: aiFeedback.ruleFollowed ? C.green : C.red }}>{aiFeedback.ruleFollowed ? "✓ Followed" : "✗ Violated"}</span>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text }}>{aiFeedback.ruleAnalysis}</div>
              </div>

              <div style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: C.gold, letterSpacing: 2, marginBottom: 6 }}>🧠 EMOTION IMPACT</div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text }}>{aiFeedback.emotionImpact}</div>
              </div>

              {aiFeedback.patternFromHistory && (
                <div style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>📊 PATTERN FROM YOUR HISTORY</div>
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text }}>{aiFeedback.patternFromHistory}</div>
                </div>
              )}

              <div style={{ background: `${C.accent}08`, border: `1px solid ${C.accent}33`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, marginBottom: 6 }}>⊕ #1 TIP FOR NEXT TIME</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, lineHeight: 1.6 }}>{aiFeedback.oneActionableTip}</div>
              </div>
            </div>
        )}

        {!aiFeedback && !aiLoading && (
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, padding: "10px 0" }}>
            Click "Get AI Feedback" to receive a personalized analysis of this trade based on your notes, patterns, and full trading history.
          </div>
        )}
      </div>

      <Btn onClick={onEdit} ghost color={C.accent} full>Edit Trade</Btn>
    </Modal>
  );
}

function PatternViewModal({ pattern, trades, onClose, onEdit }) {
  if (!pattern) return null;
  const pt = trades.filter(t => t.patternId === pattern.id);
  const wins = pt.filter(t => t.result === "win").length;
  const pnl = pt.reduce((a, t) => a + (t.pnl || 0), 0);
  return (
    <Modal title={pattern.name} onClose={onClose}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {pattern.timeframe && <Tag color={C.accent}>{pattern.timeframe}</Tag>}
        {pattern.session && <Tag>{pattern.session}</Tag>}
      </div>
      {pattern.description && <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.7, marginBottom: 14 }}>{pattern.description}</div>}
      {pattern.rules && <pre style={{ fontSize: 11, color: C.text, lineHeight: 1.8, background: C.bg, padding: 12, borderRadius: 8, marginBottom: 14, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{pattern.rules}</pre>}
      {pattern.confirmations && <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 5 }}>CONFIRMATIONS</div>
        <div style={{ fontSize: 12 }}>{pattern.confirmations}</div>
      </div>}
      {pt.length > 0 && <div style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>PERFORMANCE</div>
        <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 22, color: pnl >= 0 ? C.green : C.red }}>{fmt(pnl)}</div>
        <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>{wins}/{pt.length} wins · {Math.round(wins / pt.length * 100)}% WR</div>
      </div>}
      {pattern.imageLink && <a href={pattern.imageLink} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", padding: 10, background: `${C.accent}10`, border: `1px solid ${C.accent}33`, color: C.accent, borderRadius: 6, marginBottom: 14, fontSize: 12 }}>📎 View Reference Chart</a>}
      <Btn onClick={onEdit} ghost color={C.accent} full>Edit Pattern</Btn>
    </Modal>
  );
}

