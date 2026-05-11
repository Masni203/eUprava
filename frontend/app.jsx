// ============ Main App ============

const SIDEBAR_NAV = {
  pacijent: [
    { id: 'home', label: 'Početna', icon: 'home' },
    { id: 'zakazi', label: 'Zakaži pregled', icon: 'plus' },
    { id: 'moji-pregledi', label: 'Moji pregledi', icon: 'calendar' },
    { id: 'karton', label: 'Moj karton', icon: 'document' },
    { id: 'profil', label: 'Profil', icon: 'user' },
  ],
  doktor: [
    { id: 'home', label: 'Početna', icon: 'home' },
    { id: 'moji-pregledi', label: 'Moji pregledi', icon: 'calendar' },
    { id: 'pacijenti', label: 'Pacijenti', icon: 'users' },
    { id: 'pretraga', label: 'Pretraga', icon: 'search' },
    { id: 'profil', label: 'Profil', icon: 'user' },
  ],
  admin: [
    { id: 'home', label: 'Početna', icon: 'home' },
    { id: 'korisnici', label: 'Korisnici', icon: 'users' },
    { id: 'doktori', label: 'Doktori', icon: 'stethoscope' },
    { id: 'pregledi', label: 'Pregledi', icon: 'calendar' },
    { id: 'izvestaji', label: 'Izveštaji', icon: 'file' },
    { id: 'statistika', label: 'Statistika', icon: 'chart' },
    { id: 'objavi', label: 'Objavi statistiku', icon: 'upload', accent: true },
    { id: 'profil', label: 'Profil', icon: 'user' },
  ],
  'op-korisnik': [
    { id: 'home', label: 'Početna', icon: 'home' },
    { id: 'datasetovi', label: 'Skupovi podataka', icon: 'database' },
  ],
  'op-admin': [
    { id: 'home', label: 'Početna', icon: 'home' },
    { id: 'datasetovi', label: 'Skupovi podataka', icon: 'database' },
    { id: 'izvori', label: 'Izvori', icon: 'shield' },
    { id: 'statistika', label: 'Statistika preuzimanja', icon: 'chart' },
  ],
};

const ROLE_INFO_STATIC = {
  pacijent:     { sys: 'health',   label: 'Pacijent' },
  doktor:       { sys: 'health',   label: 'Doktor' },
  admin:        { sys: 'health',   label: 'Administrator' },
  'op-korisnik':{ sys: 'opendata', label: 'Korisnik OP' },
  'op-admin':   { sys: 'opendata', label: 'Administrator OP' },
};

// Dinamički — uzima ime/email iz aktivnog JWT-a, fallback na demo labelu.
function roleInfo(role) {
  const stat = ROLE_INFO_STATIC[role] || { sys: 'health', label: role };
  const svc = stat.sys === 'opendata' ? 'op' : 'zdravstvo';
  const me = (typeof meFromToken === 'function') ? meFromToken(svc) : null;
  const name = me ? `${me.ime || ''} ${me.prezime || ''}`.trim() || stat.label : stat.label;
  const mail = me ? me.email : '';
  const initials = me
    ? ((me.ime?.[0] || '?') + (me.prezime?.[0] || '')).toUpperCase()
    : stat.label.slice(0, 2).toUpperCase();
  return { ...stat, name, mail, initials, me };
}

// Proxy radi backward kompatibilnosti sa ROLE_INFO[role] u JSX-u.
const ROLE_INFO = new Proxy({}, { get: (_, role) => roleInfo(role) });

const Sidebar = ({ role, page, onNav, onLogout }) => {
  const items = SIDEBAR_NAV[role] || [];
  const info = ROLE_INFO[role];
  return (
    <aside className="sidebar">
      <div className="role-badge">
        <div className="avatar">{info.initials}</div>
        <div>
          <div className="label">{info.label}</div>
          <div className="value">{info.name}</div>
        </div>
      </div>
      <div className="sidenav-section">Navigacija</div>
      <nav className="sidenav">
        {items.map(it => (
          <button key={it.id} className={page === it.id ? 'active' : ''} onClick={() => onNav(it.id)}>
            <Icon className="icon" name={it.icon} size={16} />
            {it.label}
            {it.accent && <span style={{marginLeft:'auto', width:6, height:6, background:'var(--success)', borderRadius:999}} />}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}><Icon name="logout" size={14} /> Odjavi se</button>
      </div>
    </aside>
  );
};

const SystemSwitch = ({ system, onSwitch, role }) => {
  // Prebacivanje između sistema ima smisla samo za pacijent/doktor — oni dobijaju javni
  // OP katalog (anoniman) preko svog tokena, a SSO ih ne čini autorima OP-a.
  // Admini (ADMIN, ADMIN_OP) i KORISNIK_OP imaju ulogu samo na svom servisu — switch sakrij.
  const moze = role === 'pacijent' || role === 'doktor';
  if (!moze) return null;
  return (
    <div className="system-switch">
      <button className={system === 'health' ? 'active' : ''} onClick={() => onSwitch('health')}
        style={{color: system === 'health' ? 'var(--primary)' : undefined}}>
        <span className="dot" />Zdravstvo
      </button>
      <button className={system === 'opendata' ? 'active' : ''} onClick={() => onSwitch('opendata')}
        style={{color: system === 'opendata' ? 'var(--opendata)' : undefined}}>
        <span className="dot" />Otvoreni Podaci
      </button>
    </div>
  );
};

const TopBar = ({ system, role, baseRole, onSwitch, onLogout }) => {
  const info = ROLE_INFO[role];
  return (
    <div className="navbar">
      <div className="brand">
        <div className={`brand-mark${system === 'opendata' ? ' opendata' : ''}`}>{system === 'opendata' ? 'OP' : 'eU'}</div>
        <div className="brand-text">
          <div className="b1">eUprava</div>
          <div className="b2">{system === 'opendata' ? 'Otvoreni Podaci' : 'Zdravstvo'}</div>
        </div>
      </div>
      <SystemSwitch system={system} onSwitch={onSwitch} role={baseRole || role} />
      <div className="nav-spacer" />
      <div className="user-chip">
        <div className="avatar">{info.initials}</div>
        <div style={{lineHeight:1.2}}>
          <div style={{fontWeight:600, fontSize:12.5}}>{info.name}</div>
          <div className="muted" style={{fontSize:11}}>{info.label}</div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  // 'landing' | 'public-op' | 'app'
  // Auto-restore: ako u localStorage postoji validan token, kreni pravo u app.
  const initial = (typeof activeSession === 'function') ? activeSession() : null;
  const [stage, setStage] = useState(initial ? 'app' : 'landing');
  const [role, setRole] = useState(initial ? initial.role : null);
  const [system, setSystem] = useState(initial ? (initial.svc === 'op' ? 'opendata' : 'health') : 'health');
  const [page, setPage] = useState('home');
  const [params, setParams] = useState(null);
  const [, setProfileTick] = useState(0);

  useEffect(() => {
    document.body.dataset.system = system;
  }, [system]);

  // Posle PUT /api/{pacijenti,doktori}/me, api.jsx detektuje X-New-Token i osveži localStorage.
  // Ovaj event forsira UI re-render da TopBar/Sidebar/ROLE_INFO pokupe svež claim iz tokena.
  useEffect(() => {
    const handler = () => setProfileTick(t => t + 1);
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, []);

  const go = (p, prm = null) => { setPage(p); setParams(prm); };

  const onLogin = (r) => {
    setRole(r);
    setSystem(ROLE_INFO[r].sys);
    setPage('home');
    setStage('app');
  };
  const onLogout = () => {
    if (typeof clearTokens === 'function') clearTokens();
    setStage('landing');
    setRole(null);
    setSystem('health');
    setPage('home');
  };
  const onSwitch = (sys) => {
    setSystem(sys);
    // keep current role's primary system unless explicit role-switch
    if (sys === 'opendata' && (role === 'pacijent' || role === 'doktor' || role === 'admin')) {
      // Demo: viewing public OP catalog with reduced rights
      setPage('home');
    } else if (sys === 'health' && (role === 'op-korisnik' || role === 'op-admin')) {
      setPage('home');
    } else {
      setPage('home');
    }
  };

  if (stage === 'landing') {
    return <Landing onLogin={onLogin} onPublicOP={() => setStage('public-op')} />;
  }
  if (stage === 'public-op') {
    return <OPPublic onBackToHealth={() => setStage('landing')} onLogin={() => setStage('landing')} />;
  }

  // Logged-in shell
  // Role override when system is switched and role doesn't match
  let effectiveRole = role;
  if (system === 'opendata' && (role === 'pacijent' || role === 'doktor')) effectiveRole = 'op-korisnik';
  if (system === 'opendata' && role === 'admin') effectiveRole = 'op-admin';
  if (system === 'health' && role === 'op-korisnik') effectiveRole = 'pacijent';
  if (system === 'health' && role === 'op-admin') effectiveRole = 'admin';

  const renderPage = () => {
    const key = `${effectiveRole}/${page}`;
    switch (key) {
      // Pacijent
      case 'pacijent/home': return <PacijentHome go={go} />;
      case 'pacijent/zakazi': return <PacijentZakazi go={go} />;
      case 'pacijent/moji-pregledi': return <PacijentMojiPregledi />;
      case 'pacijent/karton': return <PacijentKarton />;
      case 'pacijent/profil': return <ProfilStub role={effectiveRole} />;
      // Doktor
      case 'doktor/home': return <DoktorHome go={go} />;
      case 'doktor/moji-pregledi': return <DoktorMojiPregledi go={go} />;
      case 'doktor/pacijenti': return <DoktorPretraga />;
      case 'doktor/pretraga': return <DoktorPretraga />;
      case 'doktor/unos-dijagnoze': return <DoktorUnosDijagnoze params={params} go={go} />;
      case 'doktor/profil': return <ProfilStub role={effectiveRole} />;
      // Admin Zdravstvo
      case 'admin/home': return <AdminHome />;
      case 'admin/korisnici': return <AdminKorisnici />;
      case 'admin/doktori': return <AdminKorisnici />;
      case 'admin/pregledi': return <DoktorMojiPregledi go={go} />;
      case 'admin/izvestaji': return <AdminIzvestaji />;
      case 'admin/statistika': return <AdminHome />;
      case 'admin/objavi': return <AdminObjavi />;
      case 'admin/profil': return <ProfilStub role={effectiveRole} />;
      // OP Korisnik
      case 'op-korisnik/home': return <OPKorisnikHome />;
      case 'op-korisnik/datasetovi': return <OPKorisnikDatasetovi />;
      case 'op-korisnik/preuzimanja': return <OPKorisnikPreuzimanja />;
      case 'op-korisnik/pretplate': return <OPKorisnikPretplate />;
      case 'op-korisnik/api': return <OPKorisnikAPIKey />;
      // OP Admin
      case 'op-admin/home': return <OPAdminHome />;
      case 'op-admin/datasetovi': return <OPAdminDatasetovi />;
      case 'op-admin/odobrenje': return <OPAdminOdobrenje />;
      case 'op-admin/korisnici': return <AdminKorisnici />;
      case 'op-admin/izvori': return <OPAdminIzvori />;
      case 'op-admin/statistika': return <OPAdminStatistika />;
      default: return <PacijentHome go={go} />;
    }
  };

  return (
    <div className="app">
      <div className="govstrip">
        <div className="flag"><span className="flag-bar" /><span>Republika Srbija — eUprava</span></div>
        <div>{ROLE_INFO[role].mail} · Demo prototip</div>
      </div>
      <TopBar system={system} role={effectiveRole} baseRole={role} onSwitch={onSwitch} onLogout={onLogout} />
      <div className="shell">
        <Sidebar role={effectiveRole} page={page} onNav={go} onLogout={onLogout} />
        <main className="main"><div className="main-inner">{renderPage()}</div></main>
      </div>
    </div>
  );
};

const ProfilStub = ({ role }) => {
  if (role === 'pacijent') return <PacijentProfilEdit />;
  if (role === 'doktor')   return <DoktorProfilEdit />;
  return <ProfilReadOnly role={role} />;
};

const ProfilHeader = ({ role }) => {
  const info = ROLE_INFO[role];
  return (
    <div className="row gap-md" style={{marginBottom:18}}>
      <div className="avatar" style={{width:64, height:64, fontSize:22}}>{info.initials}</div>
      <div>
        <div style={{fontSize:18, fontWeight:600}}>{info.name}</div>
        <div className="muted">{info.label}</div>
        <div className="muted small">{info.mail}</div>
      </div>
    </div>
  );
};

const ProfilReadOnly = ({ role }) => {
  const info = ROLE_INFO[role];
  return (
    <div>
      <PageHeader title="Profil" subtitle="Lični podaci učitani iz JWT tokena" />
      <div className="card" style={{maxWidth:520}}>
        <div className="card-body">
          <ProfilHeader role={role} />
          <div className="col gap-sm small">
            <div className="row between"><span className="muted">Ime</span><strong>{info.me?.ime || '—'}</strong></div>
            <div className="row between"><span className="muted">Prezime</span><strong>{info.me?.prezime || '—'}</strong></div>
            <div className="row between"><span className="muted">Email</span><strong>{info.me?.email || '—'}</strong></div>
            <div className="row between"><span className="muted">Uloga</span><strong>{info.me?.uloga || '—'}</strong></div>
            <div className="row between"><span className="muted">Token ističe</span>
              <span className="mono">{info.me?.exp ? new Date(info.me.exp).toLocaleString('sr-RS') : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PacijentProfilEdit = () => {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.zd.get('/api/pacijenti/me').then(setData).catch(e => toast.push({kind:'error', title:'Greška', body:e.message}));
  }, []);

  if (!data) return <div><PageHeader title="Profil" /><div className="card"><div className="card-body">Učitavam…</div></div></div>;

  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.zd.put('/api/pacijenti/me', {
        ime: data.ime,
        prezime: data.prezime,
        email: data.email,
        jmbg: data.jmbg,
        datumRodjenja: data.datumRodjenja,
        grad: data.grad,
        telefon: data.telefon,
        aktivan: data.aktivan,
      });
      setData(updated);
      window.dispatchEvent(new CustomEvent('profile-updated'));
      toast.push({ kind: 'success', title: 'Profil sačuvan' });
    } catch (e) {
      toast.push({ kind: 'error', title: 'Čuvanje neuspešno', body: e.message });
    } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Profil" subtitle="Izmena ličnih podataka" />
      <form className="card" onSubmit={save} style={{maxWidth:720}}>
        <div className="card-body">
          <ProfilHeader role="pacijent" />
          <div className="form-grid">
            <Field label="Ime" required><Input value={data.ime || ''} onChange={set('ime')} /></Field>
            <Field label="Prezime" required><Input value={data.prezime || ''} onChange={set('prezime')} /></Field>
            <Field label="Email" required><Input type="email" value={data.email || ''} onChange={set('email')} /></Field>
            <Field label="JMBG" required><Input value={data.jmbg || ''} onChange={set('jmbg')} maxLength={13} /></Field>
            <Field label="Datum rođenja"><Input type="date" value={data.datumRodjenja || ''} onChange={set('datumRodjenja')} /></Field>
            <Field label="Grad"><Input value={data.grad || ''} onChange={set('grad')} /></Field>
            <Field label="Telefon"><Input value={data.telefon || ''} onChange={set('telefon')} /></Field>
            <div className="full row" style={{justifyContent:'flex-end'}}>
              <Button kind="primary" loading={saving} icon={saving ? null : 'check'}>Sačuvaj izmene</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const DoktorProfilEdit = () => {
  const [data, setData] = useState(null);
  const [spec, setSpec] = useState([]);
  const [boln, setBoln] = useState([]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      api.zd.get('/api/doktori/me'),
      api.zd.get('/api/specijalizacije'),
      api.zd.get('/api/bolnice'),
    ]).then(([d, s, b]) => { setData(d); setSpec(s); setBoln(b); })
      .catch(e => toast.push({ kind: 'error', title: 'Greška', body: e.message }));
  }, []);

  if (!data) return <div><PageHeader title="Profil" /><div className="card"><div className="card-body">Učitavam…</div></div></div>;

  const set = (path) => (e) => {
    const v = e.target.value;
    if (path === 'specijalizacijaSifra') setData({ ...data, specijalizacija: { ...data.specijalizacija, sifra: v }});
    else if (path === 'bolnicaSifra') setData({ ...data, bolnica: { ...data.bolnica, sifra: v }});
    else setData({ ...data, [path]: v });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.zd.put('/api/doktori/me', {
        ime: data.ime,
        prezime: data.prezime,
        email: data.email,
        specijalizacijaSifra: data.specijalizacija?.sifra,
        bolnicaSifra: data.bolnica?.sifra,
        aktivan: data.aktivan,
      });
      setData(updated);
      window.dispatchEvent(new CustomEvent('profile-updated'));
      toast.push({ kind: 'success', title: 'Profil sačuvan' });
    } catch (e) {
      toast.push({ kind: 'error', title: 'Čuvanje neuspešno', body: e.message });
    } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Profil" subtitle="Izmena ličnih podataka" />
      <form className="card" onSubmit={save} style={{maxWidth:720}}>
        <div className="card-body">
          <ProfilHeader role="doktor" />
          <div className="form-grid">
            <Field label="Ime" required><Input value={data.ime || ''} onChange={set('ime')} /></Field>
            <Field label="Prezime" required><Input value={data.prezime || ''} onChange={set('prezime')} /></Field>
            <Field label="Email" required><Input type="email" value={data.email || ''} onChange={set('email')} /></Field>
            <Field label="Specijalizacija" required>
              <Select value={data.specijalizacija?.sifra || ''} onChange={set('specijalizacijaSifra')}>
                {spec.map(s => <option key={s.sifra} value={s.sifra}>{s.naziv}</option>)}
              </Select>
            </Field>
            <Field label="Bolnica" required>
              <Select value={data.bolnica?.sifra || ''} onChange={set('bolnicaSifra')}>
                {boln.map(b => <option key={b.sifra} value={b.sifra}>{b.naziv} — {b.grad}</option>)}
              </Select>
            </Field>
            <div className="full row" style={{justifyContent:'flex-end'}}>
              <Button kind="primary" loading={saving} icon={saving ? null : 'check'}>Sačuvaj izmene</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <ToastProvider><App /></ToastProvider>
);
