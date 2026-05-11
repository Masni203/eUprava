// ============ Shared Components ============
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ----- Icons (inline SVG, stroke-based) -----
const Icon = ({ name, size = 16, className = '', style }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', className, style };
  const paths = {
    home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 9h18" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7" /><circle cx="17" cy="6" r="2.5" /><path d="M22 17c0-2.8-2.2-5-5-5" /></>,
    folder: <><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" /></>,
    chart: <><path d="M3 3v18h18" /><path d="M7 14l4-4 4 3 5-7" /></>,
    bar: <><rect x="3" y="13" width="4" height="8" /><rect x="10" y="8" width="4" height="13" /><rect x="17" y="4" width="4" height="17" /></>,
    file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    bell: <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    edit: <><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6" /><path d="M18 2l4 4-10 10H8v-4z" /></>,
    trash: <><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" /></>,
    pause: <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>,
    check: <><path d="M5 13l5 5 9-12" /></>,
    x: <><path d="M18 6L6 18M6 6l12 12" /></>,
    arrow: <><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>,
    chevron: <><path d="M9 6l6 6-6 6" /></>,
    chevron_l: <><path d="M15 18l-6-6 6-6" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
    heart: <><path d="M20.8 5.6a5.5 5.5 0 0 0-9-2 5.5 5.5 0 0 0-9 2c0 7 9 12 9 12s9-5 9-12z" /></>,
    health: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M12 8v8M8 12h8" /></>,
    database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" /><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" /></>,
    key: <><circle cx="8" cy="15" r="4" /><path d="M11 12l8-8" /><path d="M17 6l3 3" /></>,
    bookmark: <><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    play: <><polygon points="5 3 19 12 5 21 5 3" /></>,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
    alert: <><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></>,
    success: <><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" /></>,
    pill: <><rect x="2" y="9" width="20" height="6" rx="3" transform="rotate(-45 12 12)" /><path d="M9 9l6 6" /></>,
    stethoscope: <><path d="M6 3v6a4 4 0 0 0 8 0V3" /><path d="M10 19a3 3 0 0 0 6 0v-2" /><circle cx="20" cy="13" r="2" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 7v5l3 2" /></>,
    filter: <><path d="M22 3H2l8 9.5V19l4 2v-8.5z" /></>,
    copy: <><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" /></>,
    inbox: <><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" /></>,
    rss: <><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></>,
    api: <><path d="M3 12h4M17 12h4" /><circle cx="12" cy="12" r="3" /><path d="M12 3v4M12 17v4" /></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></>,
    document: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /><path d="M8 13h8M8 17h5" /></>,
  };
  return <svg {...props}>{paths[name] || paths.info}</svg>;
};

// ----- Buttons -----
const Button = ({ kind = 'primary', size, loading, icon, children, ...rest }) => {
  const cls = `btn btn-${kind}${size ? ` btn-${size}` : ''}${rest.className ? ` ${rest.className}`: ''}`;
  return (
    <button {...rest} className={cls} disabled={rest.disabled || loading}>
      {loading ? <span className="spinner" /> : (icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} />)}
      {children}
    </button>
  );
};

// ----- Field -----
const Field = ({ label, hint, error, required, children }) => (
  <div className="field">
    {label && <label>{label}{required && <span className="req">*</span>}</label>}
    {children}
    {hint && !error && <div className="hint">{hint}</div>}
    {error && <div className="err"><Icon name="alert" size={12} />{error}</div>}
  </div>
);

const Input = ({ error, ...rest }) => <input className={`input${error ? ' err' : ''}`} {...rest} />;
const Select = ({ error, children, ...rest }) => <select className={`select${error ? ' err' : ''}`} {...rest}>{children}</select>;
const Textarea = ({ error, ...rest }) => <textarea className={`textarea${error ? ' err' : ''}`} {...rest} />;

// ----- Modal -----
const Modal = ({ open, title, children, onClose, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>{title}</h3></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

// ----- Toast system -----
const ToastCtx = React.createContext({ push: () => {} });
const useToast = () => React.useContext(ToastCtx);

const ToastProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const push = useCallback((t) => {
    const id = Math.random().toString(36).slice(2, 9);
    setItems((s) => [...s, { id, kind: 'info', ...t }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toast-stack">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            <Icon className="t-icon" name={t.kind === 'success' ? 'success' : t.kind === 'error' ? 'alert' : t.kind === 'warning' ? 'alert' : 'info'} size={18} />
            <div>
              <div className="t-title">{t.title}</div>
              {t.body && <div className="t-body">{t.body}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

// ----- Confirm dialog hook -----
const useConfirm = () => {
  const [state, setState] = useState(null);
  const confirm = (opts) => new Promise((resolve) => setState({ ...opts, resolve }));
  const node = state ? (
    <Modal open title={state.title} onClose={() => { state.resolve(false); setState(null); }}
      footer={<>
        <Button kind="secondary" onClick={() => { state.resolve(false); setState(null); }}>Otkaži</Button>
        <Button kind={state.danger ? 'danger' : 'primary'} onClick={() => { state.resolve(true); setState(null); }}>{state.confirmText || 'Potvrdi'}</Button>
      </>}>
      {state.message}
    </Modal>
  ) : null;
  return [confirm, node];
};

// ----- Badge -----
const Badge = ({ kind = 'neutral', children, dot }) => (
  <span className={`badge ${kind}`}>{dot && <span className="b-dot" />}{children}</span>
);

const StatusBadge = ({ status }) => {
  const map = {
    zakazan: ['info', 'Zakazan'],
    zavrsen: ['success', 'Završen'],
    otkazan: ['danger', 'Otkazan'],
    aktivan: ['success', 'Aktivan'],
    neaktivan: ['neutral', 'Neaktivan'],
    objavljen: ['success', 'Objavljen'],
    nacrt: ['warning', 'Nacrt'],
    odobren: ['info', 'Odobren'],
    'in-progress': ['warning', 'U toku'],
    upcoming: ['neutral', 'Predstoji'],
    done: ['success', 'Završen'],
  };
  const [kind, label] = map[status] || ['neutral', status];
  return <Badge kind={kind} dot>{label}</Badge>;
};

// ----- KPI card -----
const KPI = ({ label, value, icon, delta, deltaDir, hint }) => (
  <div className="kpi">
    <div className="kpi-label">{icon && <Icon name={icon} size={13} />}{label}</div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-meta">
      {delta && <span className={`kpi-delta ${deltaDir || ''}`}>{deltaDir === 'up' ? '↑' : deltaDir === 'down' ? '↓' : ''} {delta}</span>}
      {hint && <span>{hint}</span>}
    </div>
  </div>
);

// ----- Page Header -----
const PageHeader = ({ title, subtitle, breadcrumbs, actions }) => (
  <div>
    {breadcrumbs && (
      <div className="breadcrumbs">
        {breadcrumbs.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === breadcrumbs.length - 1 ? 'current' : ''}>{b}</span>
          </React.Fragment>
        ))}
      </div>
    )}
    <div className="page-head">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="row gap-md">{actions}</div>}
    </div>
  </div>
);

// ----- Empty state -----
const EmptyState = ({ title = 'Nema podataka', body, icon = 'inbox' }) => (
  <div className="empty">
    <div className="empty-art"><Icon name={icon} size={36} /></div>
    <div className="empty-title">{title}</div>
    {body && <div className="empty-body">{body}</div>}
  </div>
);

// ----- Toggle switch -----
const Toggle = ({ on, onChange }) => (
  <button type="button" className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange && onChange(!on)} aria-pressed={on} />
);

// ----- Calendar -----
const MONTHS_SR = ['Januar','Februar','Mart','April','Maj','Jun','Jul','Avgust','Septembar','Oktobar','Novembar','Decembar'];
const DAYS_SR = ['Pon','Uto','Sre','Čet','Pet','Sub','Ned'];

function buildCalendar(year, month) {
  const first = new Date(year, month, 1);
  const start = first.getDay() === 0 ? 6 : first.getDay() - 1; // Mon-start
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const Calendar = ({ value, onChange, hasSlots }) => {
  const [view, setView] = useState(() => {
    const d = value || new Date(2026, 4, 9);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const cells = buildCalendar(view.y, view.m);
  const today = new Date(2026, 4, 9);
  return (
    <div>
      <div className="cal-head">
        <div className="cal-month">{MONTHS_SR[view.m]} {view.y}</div>
        <div className="cal-nav">
          <button className="icon-btn" onClick={() => setView(v => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 })}>
            <Icon name="chevron_l" size={14} />
          </button>
          <button className="icon-btn" onClick={() => setView(v => v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 })}>
            <Icon name="chevron" size={14} />
          </button>
        </div>
      </div>
      <div className="calendar">
        {DAYS_SR.map(d => <div key={d} className="cal-h">{d}</div>)}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="cal-d muted" style={{visibility:'hidden'}} />;
          const dt = new Date(view.y, view.m, d);
          const past = dt < today.setHours(0,0,0,0);
          const slot = hasSlots ? hasSlots(dt) : true;
          const sel = value && dt.getDate() === value.getDate() && dt.getMonth() === value.getMonth() && dt.getFullYear() === value.getFullYear();
          return (
            <button key={i} type="button"
              className={`cal-d${past || !slot ? ' disabled' : ''}${sel ? ' selected' : ''}${slot && !past ? ' has-slots' : ''}`}
              disabled={past || !slot}
              onClick={() => onChange && onChange(dt)}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ----- Stepper -----
const Stepper = ({ steps, current }) => (
  <div className="stepper">
    {steps.map((s, i) => (
      <div key={i} className={`step ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}>
        <div className="step-num">{i < current ? <Icon name="check" size={13} /> : i + 1}</div>
        <div className="step-label">
          <div className="l1">Korak {i + 1}</div>
          <div className="l2">{s}</div>
        </div>
      </div>
    ))}
  </div>
);

// ----- Autocomplete (MKB) -----
const MkbAutocomplete = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value ? `${value.code} — ${value.name}` : '');
  const matches = q.length === 0 ? MKB_KODOVI.slice(0, 6) :
    MKB_KODOVI.filter(m => (m.code + ' ' + m.name).toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  return (
    <div className="autocomplete">
      <input
        className="input"
        placeholder="Pretraži MKB-10 kod ili naziv dijagnoze..."
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); onChange(null); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="ac-list">
          {matches.length === 0 ? (
            <div className="ac-item"><div className="muted">Nema rezultata</div></div>
          ) : matches.map(m => (
            <div key={m.code} className="ac-item" onMouseDown={() => { onChange(m); setQ(`${m.code} — ${m.name}`); setOpen(false); }}>
              <div className="code">{m.code}</div>
              <div className="name">{m.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ----- Footer -----
const Footer = () => (
  <footer className="footer">
    <div className="footer-grid">
      <div>
        <div className="row gap-md" style={{marginBottom: 12}}>
          <div className="brand-mark" style={{width:34,height:34,fontSize:14}}>eU</div>
          <div className="brand-text">
            <div className="b1" style={{color:'#fff'}}>eUprava</div>
            <div className="b2" style={{color:'#7d88a8'}}>Republika Srbija</div>
          </div>
        </div>
        <div style={{lineHeight: 1.55, maxWidth: 280}}>
          Jedinstveni portal za digitalne usluge državne uprave. Zdravstveni sistem i Otvoreni Podaci.
        </div>
      </div>
      <div>
        <h4>Sistem Zdravstvo</h4>
        <ul>
          <li><a href="#">Pacijenti</a></li>
          <li><a href="#">Doktori i ustanove</a></li>
          <li><a href="#">Elektronski karton</a></li>
          <li><a href="#">Zakazivanje pregleda</a></li>
        </ul>
      </div>
      <div>
        <h4>Otvoreni Podaci</h4>
        <ul>
          <li><a href="#">Katalog skupova podataka</a></li>
          <li><a href="#">API dokumentacija</a></li>
          <li><a href="#">Standardi</a></li>
          <li><a href="#">RSS feed</a></li>
        </ul>
      </div>
      <div>
        <h4>Kontakt</h4>
        <ul>
          <li>kontakt@euprava.gov.rs</li>
          <li>+381 11 311 7000</li>
          <li>Nemanjina 11, Beograd</li>
          <li><a href="#">Prijavi grešku</a></li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <div>© 2026 Republika Srbija — Demo prototip za potrebe ispita</div>
      <div>v1.0.0 · MIT License · Otvoreni kod</div>
    </div>
  </footer>
);

Object.assign(window, {
  Icon, Button, Field, Input, Select, Textarea, Modal, ToastProvider, useToast,
  useConfirm, Badge, StatusBadge, KPI, PageHeader, EmptyState, Toggle,
  Calendar, Stepper, MkbAutocomplete, Footer, MONTHS_SR, DAYS_SR,
});
