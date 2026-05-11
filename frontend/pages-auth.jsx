// ============ Landing + Login ============

// Mapa UI uloga → backend servis
const ROLE_SERVICE = {
  'pacijent':    'zdravstvo',
  'doktor':      'zdravstvo',
  'admin':       'zdravstvo',
  'op-korisnik': 'op',
  'op-admin':    'op',
};

// Mapa backend uloga → UI uloga
function uiRoleFromBackend(uloga) {
  return ({
    'PACIJENT':    'pacijent',
    'DOKTOR':      'doktor',
    'ADMIN':       'admin',
    'KORISNIK_OP': 'op-korisnik',
    'ADMIN_OP':    'op-admin',
  })[uloga];
}

const DEMO_EMAILS = {
  'pacijent':    'jovan.markovic@example.rs',
  'doktor':      'marko.petrovic@kcs.rs',
  'admin':       'admin@euprava.gov.rs',
  'op-korisnik': 'marija.ilic@op.rs',
  'op-admin':    'admin.op@euprava.gov.rs',
};

const Landing = ({ onLogin, onPublicOP }) => {
  const [mode, setMode] = useState('landing'); // 'landing' | 'login'
  const [role, setRole] = useState('pacijent');
  const [email, setEmail] = useState(DEMO_EMAILS['pacijent']);
  const [password, setPassword] = useState('demo1234');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const onRolePick = (rid) => {
    setRole(rid);
    if (DEMO_EMAILS[rid]) setEmail(DEMO_EMAILS[rid]);
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email) errs.email = 'Email je obavezan';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Neispravan format email-a';
    if (!password) errs.password = 'Lozinka je obavezna';
    else if (password.length < 6) errs.password = 'Lozinka mora imati najmanje 6 karaktera';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const svc = ROLE_SERVICE[role];
    setLoading(true);
    try {
      const apiSvc = svc === 'zdravstvo' ? api.zd : api.op;
      const resp = await apiSvc.login(email, password);
      setToken(svc, resp.token);

      const detected = uiRoleFromBackend(resp.uloga);
      if (!detected) {
        toast.push({ kind: 'error', title: 'Nepoznata uloga', body: resp.uloga });
        setLoading(false);
        return;
      }
      if (detected !== role) {
        toast.push({ kind: 'info', title: 'Učitana uloga iz naloga', body: detected });
      }
      toast.push({ kind: 'success', title: 'Uspešna prijava', body: `Dobrodošli, ${resp.ime} ${resp.prezime}` });
      onLogin(detected);
    } catch (err) {
      const msg = err.status === 401 ? 'Pogrešni kredencijali' : (err.message || 'Greška pri prijavi');
      toast.push({ kind: 'error', title: 'Prijava neuspešna', body: msg });
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'pacijent', label: 'Pacijent', icon: 'user', sys: 'health' },
    { id: 'doktor', label: 'Doktor', icon: 'stethoscope', sys: 'health' },
    { id: 'admin', label: 'Admin (Zdravstvo)', icon: 'shield', sys: 'health' },
    { id: 'op-korisnik', label: 'Korisnik OP', icon: 'database', sys: 'opendata' },
    { id: 'op-admin', label: 'Admin (Otv. Podaci)', icon: 'settings', sys: 'opendata' },
  ];

  return (
    <div className="landing">
      <div className="govstrip">
        <div className="flag">
          <span className="flag-bar" />
          <span>Republika Srbija — Zvanični portal eUprava</span>
        </div>
        <div>Pomoć: 0800 100 100 · ⓘ Demo prototip</div>
      </div>
      <div className="navbar">
        <div className="brand">
          <div className="brand-mark">eU</div>
          <div className="brand-text">
            <div className="b1">eUprava</div>
            <div className="b2">Zdravstvo i Otvoreni Podaci</div>
          </div>
        </div>
        <div className="nav-spacer" />
        <button className="btn btn-ghost btn-sm" onClick={() => onPublicOP()}>Otvoreni Podaci (javno)</button>
        {mode === 'landing'
          ? <Button onClick={() => setMode('login')}>Prijava</Button>
          : <Button kind="ghost" onClick={() => setMode(mode === 'register' ? 'login' : 'landing')} icon="chevron_l">Nazad</Button>}
      </div>

      <div className="landing-hero">
        <div className="landing-grid">
          <div>
            <h1>eUprava — <span className="accent">Zdravstvo</span><br/>i <span className="accent" style={{color:'var(--opendata)'}}>Otvoreni Podaci</span></h1>
            <p className="landing-lead">
              Jedinstvena tačka pristupa elektronskom zdravstvenom kartonu i nacionalnom katalogu otvorenih podataka. Zakažite pregled, preuzmite svoju zdravstvenu evidenciju ili istražite javne datasetove — sve na jednom mestu.
            </p>
            <div className="system-cards">
              <button className="system-card" onClick={() => setMode('login')}>
                <div className="sc-icon"><Icon name="health" size={22} /></div>
                <h3>Pristup Zdravstvenom sistemu</h3>
                <p>Karton, zakazivanje, dijagnoze, terapija. Za pacijente, doktore i administraciju.</p>
                <div className="sc-link">Prijavi se <Icon name="arrow" size={14} /></div>
              </button>
              <button className="system-card green" onClick={() => onPublicOP()}>
                <div className="sc-icon"><Icon name="database" size={22} /></div>
                <h3>Portal Otvorenih Podataka</h3>
                <p>Katalog javnih datasetova, API pristup i statistike. Pretraga bez prijave.</p>
                <div className="sc-link">Istraži katalog <Icon name="arrow" size={14} /></div>
              </button>
            </div>
          </div>

          {mode === 'login' ? (
            <form className="login-card" onSubmit={submit}>
              <h2>Prijava na sistem</h2>
              <div className="sub">Unesite kredencijale i izaberite ulogu</div>

              <div className="col gap-md">
                <Field label="Email adresa" required error={errors.email}>
                  <Input type="email" value={email} error={errors.email}
                    onChange={(e) => setEmail(e.target.value)} placeholder="ime.prezime@example.rs" autoFocus />
                </Field>
                <Field label="Lozinka" required error={errors.password} hint="Demo: bilo koja lozinka od 6+ karaktera">
                  <Input type="password" value={password} error={errors.password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </Field>

                <div className="field">
                  <label>Uloga <span className="req">*</span></label>
                  <div className="role-grid">
                    {roles.map(r => (
                      <button type="button" key={r.id}
                        className={`role-pick${role === r.id ? ' active' : ''}${role === r.id && r.sys === 'opendata' ? ' opendata' : ''}`}
                        onClick={() => onRolePick(r.id)}>
                        <Icon className="r-icon" name={r.icon} size={16} />
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="row between" style={{marginTop:6}}>
                  <label className="row gap-sm small" style={{cursor:'pointer'}}>
                    <input type="checkbox" defaultChecked /> Zapamti me
                  </label>
                  <a href="#" className="small">Zaboravljena lozinka?</a>
                </div>

                <Button kind="primary" size="lg" loading={loading} className="btn-block">
                  {!loading && <Icon name="key" size={15} />}
                  Prijavi se
                </Button>
                <div className="row" style={{justifyContent:'center', fontSize:13, color:'var(--ink-3)'}}>
                  Nemate nalog? <a href="#" style={{marginLeft:6}} onClick={(e) => { e.preventDefault(); setMode('register'); }}>Registrujte se</a>
                </div>
              </div>
            </form>
          ) : mode === 'register' ? (
            <RegisterForm onDone={onLogin} onBack={() => setMode('login')} />
          ) : (
            <div className="login-card" style={{padding:0, overflow:'hidden'}}>
              <div style={{padding:'28px 32px', borderBottom:'1px solid var(--border)'}}>
                <h2 style={{margin:'0 0 4px'}}>Šta možete uraditi</h2>
                <div className="sub">Pregled funkcionalnosti po ulogama</div>
              </div>
              <div style={{padding:'12px 0'}}>
                {[
                  { ico:'user', t:'Kao pacijent', d:'Zakažite pregled, pregledajte svoj karton i istoriju, preuzmite recepte.' },
                  { ico:'stethoscope', t:'Kao doktor', d:'Vodite današnje preglede, unosite dijagnoze sa MKB kodovima, pretražujte pacijente.' },
                  { ico:'shield', t:'Kao admin', d:'Upravljajte korisnicima, generišite izveštaje i objavljujte statistike u Otvorene Podatke.' },
                  { ico:'database', t:'Kao korisnik OP', d:'Pretražite datasetove, preuzmite CSV/JSON/XML i koristite REST API.' },
                ].map((r,i) => (
                  <div key={i} style={{padding:'12px 32px', display:'flex', gap:14, alignItems:'flex-start', borderBottom: i<3 ? '1px solid var(--border)':''}}>
                    <div style={{width:36, height:36, borderRadius:8, background:'var(--primary-soft)', color:'var(--primary)', display:'grid', placeItems:'center', flexShrink:0}}>
                      <Icon name={r.ico} size={18} />
                    </div>
                    <div>
                      <div style={{fontWeight:600, fontSize:14, marginBottom:2}}>{r.t}</div>
                      <div className="muted small">{r.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{padding:'18px 32px', background:'var(--surface-2)'}}>
                <Button className="btn-block" onClick={() => setMode('login')}>Prijavi se</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

// ============ Register form ============
// Self-service registracija pravi PACIJENT nalog na Zdravstvo servisu.
// OP `KORISNIK_OP` self-register postoji na backendu ali nije izložen u UI-ju.
const RegisterForm = ({ onDone, onBack }) => {
  const [svc, setSvc] = useState('zdravstvo'); // 'zdravstvo' | 'op'
  const [f, setF] = useState({
    ime: '', prezime: '', email: '', lozinka: '',
    jmbg: '', datumRodjenja: '', grad: '', telefon: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setF(prev => ({ ...prev, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!f.ime?.trim()) errs.ime = 'Obavezno';
    if (!f.prezime?.trim()) errs.prezime = 'Obavezno';
    if (!f.email?.trim()) errs.email = 'Obavezno';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) errs.email = 'Neispravan format';
    if (!f.lozinka || f.lozinka.length < 6) errs.lozinka = 'Najmanje 6 karaktera';
    if (svc === 'zdravstvo') {
      if (!/^\d{13}$/.test(f.jmbg)) errs.jmbg = 'Tačno 13 cifara';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const apiSvc = svc === 'zdravstvo' ? api.zd : api.op;
      const body = svc === 'zdravstvo'
        ? {
            ime: f.ime, prezime: f.prezime, email: f.email, lozinka: f.lozinka,
            jmbg: f.jmbg,
            datumRodjenja: f.datumRodjenja || null,
            grad: f.grad || null,
            telefon: f.telefon || null,
          }
        : { ime: f.ime, prezime: f.prezime, email: f.email, lozinka: f.lozinka };
      const resp = await apiSvc.register(body);
      setToken(svc, resp.token);
      const detected = uiRoleFromBackend(resp.uloga);
      toast.push({ kind: 'success', title: 'Nalog kreiran', body: `Dobrodošli, ${resp.ime} ${resp.prezime}` });
      onDone(detected);
    } catch (err) {
      const msg = err.status === 409 ? (err.body?.message || 'Email ili JMBG već postoji') : (err.message || 'Greška');
      const fields = err.body?.fields || {};
      setErrors(fields);
      toast.push({ kind: 'error', title: 'Registracija neuspešna', body: msg });
    } finally { setLoading(false); }
  };

  return (
    <form className="login-card" onSubmit={submit}>
      <h2>Registracija</h2>
      <div className="sub">Kreiraj novi nalog</div>

      <div className="col gap-md">
        <div className="field">
          <label>Tip naloga</label>
          <div className="role-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
            <button type="button"
              className={`role-pick${svc === 'zdravstvo' ? ' active' : ''}`}
              onClick={() => setSvc('zdravstvo')}>
              <Icon className="r-icon" name="user" size={16} /> Pacijent (Zdravstvo)
            </button>
            <button type="button"
              className={`role-pick${svc === 'op' ? ' active opendata' : ''}`}
              onClick={() => setSvc('op')}>
              <Icon className="r-icon" name="database" size={16} /> Korisnik OP
            </button>
          </div>
        </div>

        <div className="form-grid">
          <Field label="Ime" required error={errors.ime}>
            <Input value={f.ime} error={errors.ime} onChange={set('ime')} />
          </Field>
          <Field label="Prezime" required error={errors.prezime}>
            <Input value={f.prezime} error={errors.prezime} onChange={set('prezime')} />
          </Field>
          <Field label="Email" required error={errors.email}>
            <Input type="email" value={f.email} error={errors.email} onChange={set('email')} placeholder="ime.prezime@example.rs" />
          </Field>
          <Field label="Lozinka" required error={errors.lozinka} hint="Najmanje 6 karaktera">
            <Input type="password" value={f.lozinka} error={errors.lozinka} onChange={set('lozinka')} />
          </Field>
          {svc === 'zdravstvo' && <>
            <Field label="JMBG" required error={errors.jmbg}>
              <Input value={f.jmbg} error={errors.jmbg} onChange={set('jmbg')} placeholder="13 cifara" maxLength={13} />
            </Field>
            <Field label="Datum rođenja">
              <Input type="date" value={f.datumRodjenja} onChange={set('datumRodjenja')} />
            </Field>
            <Field label="Grad">
              <Input value={f.grad} onChange={set('grad')} placeholder="Beograd" />
            </Field>
            <Field label="Telefon">
              <Input value={f.telefon} onChange={set('telefon')} placeholder="+381 ..." />
            </Field>
          </>}
        </div>

        <Button kind="primary" size="lg" loading={loading} className="btn-block">
          {!loading && <Icon name="check" size={15} />}
          Kreiraj nalog
        </Button>
        <div className="row" style={{justifyContent:'center', fontSize:13, color:'var(--ink-3)'}}>
          Imaš nalog? <a href="#" style={{marginLeft:6}} onClick={(e) => { e.preventDefault(); onBack(); }}>Prijavi se</a>
        </div>
      </div>
    </form>
  );
};

Object.assign(window, { Landing, RegisterForm });
