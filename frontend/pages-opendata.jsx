// ============ Open Data pages ============

// Sort opcije za listing skupova — vrednost je Spring `sort=field,dir`.
const SORT_OPCIJE_OP = [
  { val: 'datum,desc',           label: 'Datum — najnovije prvo' },
  { val: 'datum,asc',            label: 'Datum — najstarije prvo' },
  { val: 'brojPreuzimanja,desc', label: 'Najpreuzimaniji' },
  { val: 'brojPreuzimanja,asc',  label: 'Najmanje preuzimanja' },
  { val: 'naslov,asc',           label: 'Naslov A–Š' },
  { val: 'naslov,desc',          label: 'Naslov Š–A' },
  { val: 'godina,desc',          label: 'Godina (novije)' },
  { val: 'godina,asc',           label: 'Godina (starije)' },
];

// ---------- PUBLIC ----------
const OPPublic = ({ onBackToHealth, onLogin }) => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Sve');
  const [god, setGod] = useState('Sve');
  const [sort, setSort] = useState('datum,desc');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(null);
  const [chart, setChart] = useState(null);
  const [stats, setStats] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.op.get('/api/stats', { anon: true }).then(setStats).catch(() => {});
  }, []);

  const reload = async () => {
    setLoading(true);
    try {
      const resp = await api.op.get('/api/dataset/pretraga', {
        anon: true,
        query: {
          q: q || undefined,
          kategorija: cat === 'Sve' ? undefined : cat,
          godina: god === 'Sve' ? undefined : god,
          sort,
          size: 50,
        },
      });
      setList(resp.content || []);
    } catch (e) {
      toast.push({ kind: 'error', title: 'Greška', body: e.message });
    } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, [cat, god, sort]);
  // q je manualno (Pretraži dugme i Enter)

  // Grafikon kad se otvori detalj
  useEffect(() => {
    if (!opened) { setChart(null); return; }
    api.op.get(`/api/dataset/${opened.id}/grafikon`, { anon: true })
      .then(setChart).catch(() => setChart(null));
  }, [opened]);

  const preuzmi = async (d, format) => {
    try {
      await api.op.post(`/api/dataset/${d.id}/preuzmi`, null, { anon: true, query: { format } });
      const blob = await apiCall('op', 'GET', `/api/dataset/${d.id}/export?format=${format.toLowerCase()}`, { anon: true, asBlob: true });
      const ext = format.toLowerCase();
      downloadBlob(blob, `${d.naslov.replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase()}.${ext}`);
      toast.push({ kind: 'success', title: 'Preuzeto', body: `${format}` });
    } catch (e) {
      toast.push({ kind: 'error', title: 'Preuzimanje neuspešno', body: e.message });
    }
  };

  return (
    <div className="app">
      <div className="govstrip">
        <div className="flag"><span className="flag-bar" /><span>Republika Srbija — Otvoreni Podaci</span></div>
        <div>data.gov.rs · Demo prototip</div>
      </div>
      <div className="navbar">
        <div className="brand">
          <div className="brand-mark opendata">OP</div>
          <div className="brand-text">
            <div className="b1">Portal Otvorenih Podataka</div>
            <div className="b2">Republika Srbija</div>
          </div>
        </div>
        <div className="nav-spacer" />
        <button className="btn btn-ghost btn-sm" onClick={onBackToHealth}><Icon name="health" size={14} /> Sistem Zdravstvo</button>
        <Button onClick={onLogin}>Prijava</Button>
      </div>

      <div className="opendata-hero">
        <div className="inner">
          <h1>Javni zdravstveni podaci. Otvoreni za sve.</h1>
          <p>Katalog javnih zdravstvenih podataka — pregledi, dijagnoze, vakcinacija, bolničko lečenje. Pretražujte, preuzimajte i koristite uz otvorene licence, bez prijave.</p>
          <div className="bigsearch">
            <input placeholder="Pretraži zdravstvene podatke — npr. vakcinacija, dijagnoze, bolnice..."
              value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && reload()} />
            <Button kind="primary" icon="search" size="lg" onClick={reload}>Pretraži</Button>
          </div>
          <div className="opendata-stats">
            <div className="stat"><div className="v">{stats ? formatBroj(stats.brojSkupova) : '…'}</div><div className="l">Skupova podataka</div></div>
            <div className="stat"><div className="v">{stats ? formatBroj(stats.brojIzvora) : '…'}</div><div className="l">Institucija izvora</div></div>
            <div className="stat"><div className="v">{stats ? formatBroj(stats.brojPreuzimanja) : '…'}</div><div className="l">Ukupno preuzimanja</div></div>
            <div className="stat"><div className="v">CC-BY 4.0</div><div className="l">Otvorena licenca</div></div>
          </div>
        </div>
      </div>

      <div className="main-inner" style={{maxWidth: 1180, margin:'0 auto', width:'100%', padding: '32px 32px 60px'}}>
        <div className="filter-row">
          <span className="filter-label">Kategorija:</span>
          <Select value={cat} onChange={(e) => setCat(e.target.value)} style={{maxWidth:200}}>
            {KATEGORIJE_OP.map(k => <option key={k}>{k}</option>)}
          </Select>
          <span className="filter-label" style={{marginLeft:8}}>Godina:</span>
          <Select value={god} onChange={(e) => setGod(e.target.value)} style={{maxWidth:120}}>
            {GODINE_OP.map(k => <option key={k}>{k}</option>)}
          </Select>
          <span className="filter-label" style={{marginLeft:8}}>Sortiraj:</span>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} style={{maxWidth:230}}>
            {SORT_OPCIJE_OP.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </Select>
          <span style={{flex:1}} />
          <span className="muted small">{loading ? 'Učitavam…' : `${list.length} rezultata`}</span>
        </div>

        <div className="dataset-grid">
          {list.map(d => (
            <div key={d.id} className="dataset-card" onClick={() => setOpened(d)}>
              <div className="ds-cat">{d.kategorija?.naziv || ''}</div>
              <h4>{d.naslov}</h4>
              <div className="ds-desc">{d.opis}</div>
              <div className="ds-meta">
                <span className="row gap-sm"><Icon name="calendar" size={11} /><span className="mono">{fmtDate(d.datum)}</span></span>
                <div className="ds-formats">{(d.formati || []).map(f => <span key={f} className={`format-chip ${f.toLowerCase()}`}>{f}</span>)}</div>
              </div>
            </div>
          ))}
        </div>
        {!loading && list.length === 0 && <EmptyState title="Nema skupova podataka" body="Promenite filtere ili pretraži drugačijim terminom." icon="search" />}
      </div>

      <Footer />

      <Modal open={!!opened} onClose={() => setOpened(null)}
        title={opened?.naslov}
        footer={<Button kind="secondary" onClick={() => setOpened(null)}>Zatvori</Button>}>
        {opened && (
          <div className="col gap-md">
            <div className="row gap-sm">
              <Badge kind="success" dot>Objavljen</Badge>
              <Badge kind="primary">{opened.kategorija?.naziv}</Badge>
              <Badge kind="neutral">CC-BY 4.0</Badge>
            </div>
            <div style={{lineHeight:1.55}}>{opened.opis}</div>
            <div className="grid-2 small">
              <div><span className="muted">Izvor:</span> <strong>{opened.izvor?.naziv}</strong></div>
              <div><span className="muted">Godina:</span> <strong>{opened.godina}</strong></div>
              <div><span className="muted">Opština:</span> <strong>{opened.opstina}</strong></div>
              <div><span className="muted">Preuzimanja:</span> <strong className="mono">{formatBroj(opened.brojPreuzimanja || 0)}</strong></div>
            </div>
            {chart && chart.labels?.length > 0 && (
              <>
                <hr className="sep" />
                <div className="section-title">Vizualizacija</div>
                <DatasetChart chart={chart} />
              </>
            )}
            <hr className="sep" />
            <div className="section-title">Preuzmi u formatu</div>
            <div className="row gap-sm">
              {(opened.formati || []).filter(f => f === 'CSV' || f === 'JSON').map(f => (
                <Button key={f} kind="secondary" icon="download" onClick={() => preuzmi(opened, f)}>
                  {f}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ---------- KORISNIK OP DASHBOARD ----------
const OPKorisnikHome = () => {
  const me = (typeof meFromToken === 'function') ? meFromToken('op') : null;
  const [stats, setStats] = useState(null);
  useEffect(() => { api.op.get('/api/stats', { anon: true }).then(setStats).catch(() => {}); }, []);
  return (
    <div>
      <PageHeader title={me ? `Dobrodošli, ${me.ime}` : 'Dobrodošli'} subtitle="Portal Otvorenih Podataka" />
      <div className="kpi-grid">
        <KPI icon="database" label="Skupova podataka" value={stats ? formatBroj(stats.brojSkupova) : '…'} hint="Javno objavljeni" />
        <KPI icon="folder" label="Kategorija" value={stats ? formatBroj(stats.brojKategorija) : '…'} />
        <KPI icon="shield" label="Institucija izvora" value={stats ? formatBroj(stats.brojIzvora) : '…'} />
        <KPI icon="download" label="Ukupno preuzimanja" value={stats ? formatBroj(stats.brojPreuzimanja) : '…'} hint="Svih objavljenih skupova" />
      </div>
    </div>
  );
};

const OPKorisnikDatasetovi = () => {
  const [cat, setCat] = useState('Sve');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('datum,desc');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(null);
  const [chart, setChart] = useState(null);
  const toast = useToast();

  const reload = async () => {
    setLoading(true);
    try {
      const resp = await api.op.get('/api/dataset/pretraga', {
        query: { q: q || undefined, kategorija: cat === 'Sve' ? undefined : cat, sort, size: 50 },
      });
      setList(resp.content || []);
    } catch (e) { toast.push({ kind: 'error', title: 'Greška', body: e.message }); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, [cat, sort]);

  useEffect(() => {
    if (!opened) { setChart(null); return; }
    api.op.get(`/api/dataset/${opened.id}/grafikon`).then(setChart).catch(() => setChart(null));
  }, [opened]);

  const preuzmi = async (d, format) => {
    try {
      await api.op.post(`/api/dataset/${d.id}/preuzmi`, null, { query: { format } });
      const blob = await apiCall('op', 'GET', `/api/dataset/${d.id}/export?format=${format.toLowerCase()}`, { asBlob: true });
      downloadBlob(blob, `${d.naslov.replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase()}.${format.toLowerCase()}`);
      toast.push({ kind: 'success', title: 'Preuzeto', body: format });
    } catch (e) { toast.push({ kind: 'error', title: 'Preuzimanje neuspešno', body: e.message }); }
  };

  return (
    <div>
      <PageHeader title="Katalog skupova podataka" subtitle={`${loading ? '…' : list.length} dostupnih skupova`} />
      <div className="filter-row">
        <Input className="search-input input" placeholder="Pretraži po nazivu..." value={q}
          onChange={e=>setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && reload()} style={{maxWidth:280}} />
        <Button kind="secondary" icon="search" onClick={reload}>Pretraži</Button>
        <span className="filter-label" style={{marginLeft:8}}>Sortiraj:</span>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} style={{maxWidth:230}}>
          {SORT_OPCIJE_OP.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
        </Select>
        <span style={{flex:1}} />
        <span className="filter-label">Kategorija:</span>
        <div className="chip-row">
          {KATEGORIJE_OP.slice(0,7).map(k => (
            <button key={k} className={`chip ${cat===k?'active':''}`} onClick={() => setCat(k)}>{k}</button>
          ))}
        </div>
      </div>
      <div className="dataset-grid">
        {list.map(d => (
          <div key={d.id} className="dataset-card" onClick={() => setOpened(d)}>
            <div className="ds-cat">{d.kategorija?.naziv}</div>
            <h4>{d.naslov}</h4>
            <div className="ds-desc">{d.opis}</div>
            <div className="ds-meta">
              <span className="row gap-sm"><Icon name="download" size={11} /><span className="mono">{formatBroj(d.brojPreuzimanja || 0)}</span></span>
              <div className="ds-formats">{(d.formati || []).map(f => <span key={f} className={`format-chip ${f.toLowerCase()}`}>{f}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
      {!loading && list.length === 0 && <EmptyState title="Nema rezultata" icon="search" />}

      <Modal open={!!opened} onClose={() => setOpened(null)} title={opened?.naslov}
        footer={<Button kind="secondary" onClick={() => setOpened(null)}>Zatvori</Button>}>
        {opened && (
          <div className="col gap-md">
            <div className="row gap-sm">
              <Badge kind="success" dot>Objavljen</Badge>
              <Badge kind="primary">{opened.kategorija?.naziv}</Badge>
              <Badge kind="neutral">{opened.izvor?.naziv}</Badge>
            </div>
            <div style={{lineHeight:1.55}}>{opened.opis}</div>
            {chart && chart.labels?.length > 0 && (<><hr className="sep" /><div className="section-title">Vizualizacija</div><DatasetChart chart={chart} /></>)}
            <hr className="sep" />
            <div className="section-title">Preuzmi</div>
            <div className="row gap-sm">
              {(opened.formati || []).filter(f => f === 'CSV' || f === 'JSON').map(f =>
                <Button key={f} kind="secondary" icon="download" onClick={() => preuzmi(opened, f)}>{f}</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const OPKorisnikPreuzimanja = () => (
  <div>
    <PageHeader title="Moja preuzimanja" subtitle="Istorija preuzetih skupova podataka" />
    <div className="card">
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Skup podataka</th><th>Kategorija</th><th>Format</th><th>Veličina</th><th>Datum</th><th></th></tr></thead>
          <tbody>
            {[
              ['Najčešće dijagnoze (MKB-10) 2025', 'Dijagnoze', 'CSV', '4.2 MB', '08.05.2026 14:32'],
              ['Pregledi po opštinama — Q1 2026', 'Pregledi', 'JSON', '12.8 MB', '07.05.2026 09:14'],
              ['Apoteke — izdati recepti po grupama lekova', 'Apoteke', 'XML', '892 KB', '05.05.2026 16:48'],
              ['Bolničko lečenje — ležajevi i hospitalizacije', 'Bolnice', 'CSV', '6.4 MB', '03.05.2026 11:20'],
              ['Vakcinacija po starosnim grupama', 'Vakcinacija', 'JSON', '2.1 MB', '28.04.2026 08:05'],
            ].map((r,i) => (
              <tr key={i}>
                <td><Icon name="file" size={13} style={{marginRight:8, color:'var(--ink-3)'}} /><strong>{r[0]}</strong></td>
                <td><Badge kind="neutral">{r[1]}</Badge></td>
                <td><span className={`format-chip ${r[2].toLowerCase()}`}>{r[2]}</span></td>
                <td className="num mono small">{r[3]}</td>
                <td className="mono small">{r[4]}</td>
                <td className="actions"><button className="icon-btn"><Icon name="download" size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const OPKorisnikPretplate = () => {
  const [subs, setSubs] = useState({
    'Pregledi': true, 'Dijagnoze': true, 'Vakcinacija': true,
    'Bolnice': false, 'Apoteke': false, 'Mentalno zdravlje': false,
    'Hitna pomoć': true, 'Statistika': false,
  });
  const toast = useToast();
  return (
    <div>
      <PageHeader title="Pretplate na kategorije" subtitle="Dobijajte email kada je objavljen novi skup podataka" />
      <div className="card">
        <div className="card-body col gap-sm">
          {Object.entries(subs).map(([k, v]) => (
            <div key={k} className="row between" style={{padding:'12px 14px', background: v ? 'var(--opendata-soft)' : 'var(--surface-2)', borderRadius:'var(--radius)', border: '1px solid var(--border)'}}>
              <div>
                <div style={{fontWeight:600, fontSize:14}}>{k}</div>
                <div className="muted small">
                  {v ? 'Pretplaćeni — primićete obaveštenje za nove skupove podataka' : 'Niste pretplaćeni'}
                </div>
              </div>
              <Toggle on={v} onChange={(nv) => {
                setSubs(s => ({...s, [k]: nv}));
                toast.push({ kind: nv ? 'success' : 'info', title: nv ? 'Pretplaćeni' : 'Pretplata otkazana', body: k });
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const OPKorisnikAPIKey = () => {
  const [key, setKey] = useState('op_live_8f2a91bc4d5e7f3a9b2c1d8e0f6a4b7c');
  const [showCopied, setShowCopied] = useState(false);
  const toast = useToast();

  const regen = () => {
    const chars = '0123456789abcdef';
    let k = 'op_live_';
    for (let i = 0; i < 32; i++) k += chars[Math.floor(Math.random() * 16)];
    setKey(k);
    toast.push({ kind: 'success', title: 'API ključ regenerisan', body: 'Stari ključ više ne važi.' });
  };

  return (
    <div>
      <PageHeader title="API ključ" subtitle="Programski pristup skupovima podataka preko REST API-ja" />

      <div className="card" style={{marginBottom:18}}>
        <div className="card-head">
          <h3>Vaš API ključ</h3>
          <Badge kind="success" dot>Aktivan</Badge>
        </div>
        <div className="card-body">
          <div className="api-key-display">{key}</div>
          <div className="row gap-sm" style={{marginTop:12}}>
            <Button kind="secondary" icon="copy" onClick={() => { navigator.clipboard?.writeText(key); setShowCopied(true); setTimeout(() => setShowCopied(false), 1500); toast.push({kind:'success', title:'Kopirano u clipboard'}); }}>
              {showCopied ? 'Kopirano!' : 'Kopiraj'}
            </Button>
            <Button kind="secondary" icon="refresh" onClick={regen}>Generiši novi ključ</Button>
            <span style={{flex:1}} />
            <span className="muted small">Kreiran: 28.04.2026 · Poslednje korišćen pre 4 minuta</span>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{alignItems:'flex-start'}}>
        <div className="card">
          <div className="card-head"><h3>Primer — cURL</h3></div>
          <div className="card-body">
            <div className="code-block">
              <button className="copy-btn"><Icon name="copy" size={11} /> Kopiraj</button>
              <span className="cb-comment"># Preuzmi skup podataka u JSON formatu</span>{'\n'}
              <span className="cb-token">curl</span> -X GET \{'\n'}
              {'  '}<span className="cb-str">"https://api.data.gov.rs/v1/datasets/dijagnoze-2025"</span> \{'\n'}
              {'  '}-H <span className="cb-str">"Authorization: Bearer {key.slice(0, 18)}..."</span> \{'\n'}
              {'  '}-H <span className="cb-str">"Accept: application/json"</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Limiti i kvota</h3></div>
          <div className="card-body col gap-md">
            <div>
              <div className="row between small" style={{marginBottom:6}}>
                <span className="muted">Mesečni limit</span><strong className="mono">12.487 / 50.000</strong>
              </div>
              <div style={{height:8, background:'var(--surface-2)', borderRadius:999, overflow:'hidden'}}>
                <div style={{width:'25%', height:'100%', background:'var(--opendata)'}} />
              </div>
            </div>
            <div>
              <div className="row between small" style={{marginBottom:6}}>
                <span className="muted">Rate limit</span><strong>60 / minuti</strong>
              </div>
              <div className="muted small">Premašen limit vraća HTTP 429. Resetuje se na svakih 60s.</div>
            </div>
            <hr className="sep" />
            <a href="#" className="row gap-sm" style={{fontSize:13.5}}><Icon name="document" size={14} /> Kompletna API dokumentacija</a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- ADMIN OP ----------
const OPAdminHome = () => {
  const [stats, setStats] = useState(null);
  const [topPreuzimanja, setTopPreuzimanja] = useState([]);
  useEffect(() => {
    api.op.get('/api/stats').then(setStats).catch(() => {});
    api.op.get('/api/dataset/pretraga', { query: { size: 100 } })
      .then(p => {
        const sorted = [...(p.content || [])]
          .sort((a, b) => (b.brojPreuzimanja || 0) - (a.brojPreuzimanja || 0))
          .slice(0, 10)
          .map(d => ({ o: d.naslov, v: d.brojPreuzimanja || 0 }));
        setTopPreuzimanja(sorted);
      })
      .catch(() => {});
  }, []);
  return (
  <div>
    <PageHeader title="Otvoreni Podaci — Admin" subtitle="Upravljanje portalom javnih podataka" />
    <div className="kpi-grid">
      <KPI icon="database" label="Ukupno skupova" value={stats ? formatBroj(stats.brojSkupova) : '…'} hint="Status: OBJAVLJEN" />
      <KPI icon="folder" label="Kategorija" value={stats ? formatBroj(stats.brojKategorija) : '…'} />
      <KPI icon="shield" label="Izvora" value={stats ? formatBroj(stats.brojIzvora) : '…'} />
      <KPI icon="download" label="Ukupno preuzimanja" value={stats ? formatBroj(stats.brojPreuzimanja) : '…'} />
    </div>

    <div className="card" style={{marginTop:18}}>
      <div className="card-head"><h3>Top 10 najpreuzimanijih skupova podataka</h3></div>
      <div className="card-body">
        {topPreuzimanja.length > 0
          ? <BarChart data={topPreuzimanja} color="#0d4f3c" />
          : <div className="muted small">Učitavam…</div>}
      </div>
    </div>
  </div>
  );
};

const OPAdminDatasetovi = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirm, confirmNode] = useConfirm();
  const toast = useToast();

  const reload = async () => {
    setLoading(true);
    try {
      // Admin vidi sve statuse — povuci paralelno po svakom (filter ignoriše status kad korisnik ne pošalje).
      const statusi = ['OBJAVLJEN', 'NACRT', 'NA_ODOBRENJU', 'ODBIJEN'];
      const res = await Promise.all(statusi.map(s => api.op.get('/api/dataset/pretraga', { query: { status: s, size: 100 } })));
      const all = res.flatMap(r => r?.content || [])
        .sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));
      setItems(all);
    } catch (e) {
      toast.push({ kind: 'error', title: 'Greška', body: e.message });
    } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const remove = async (d) => {
    const ok = await confirm({ title: 'Brisanje skupa podataka', message: `Obrisati "${d.naslov}"? Sva preuzimanja vezana za ovaj skup biće obrisana.`, danger: true, confirmText: 'Obriši' });
    if (!ok) return;
    try {
      await api.op.del(`/api/dataset/${d.id}`);
      toast.push({ kind: 'success', title: 'Skup obrisan' });
      reload();
    } catch (e) {
      toast.push({ kind: 'error', title: 'Brisanje neuspešno', body: e.message });
    }
  };

  return (
    <div>
      <PageHeader title="Upravljanje skupovima podataka" subtitle={`${loading ? '…' : items.length} skupova ukupno`}
        actions={<Button kind="ghost" size="sm" icon="refresh" onClick={reload}>Osveži</Button>} />
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr>
              <th>Naslov</th><th>Kategorija</th><th>Izvor</th><th className="num">Preuzimanja</th><th>Status</th><th>Datum</th>
              <th style={{textAlign:'right'}}>Akcije</th>
            </tr></thead>
            <tbody>
              {items.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.naslov}</strong></td>
                  <td><Badge kind="neutral">{d.kategorija?.naziv}</Badge></td>
                  <td className="small">{d.izvor?.naziv}</td>
                  <td className="num mono">{formatBroj(d.brojPreuzimanja || 0)}</td>
                  <td><StatusBadge status={(d.status || 'nacrt').toLowerCase()} /></td>
                  <td className="mono small">{fmtDate(d.datum)}</td>
                  <td className="actions">
                    <button className="icon-btn danger" title="Obriši" onClick={() => remove(d)}><Icon name="trash" size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && items.length === 0 && <EmptyState title="Nema skupova" icon="database" />}
        </div>
      </div>
      {confirmNode}
    </div>
  );
};

const OPAdminOdobrenje = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [razlogZa, setRazlogZa] = useState(null); // {id, naslov}
  const [razlogText, setRazlogText] = useState('');
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();

  const reload = async () => {
    setLoading(true);
    try {
      const r = await api.op.get('/api/dataset/pretraga', { query: { status: 'NA_ODOBRENJU', size: 100 } });
      setItems(r?.content || []);
    } catch (e) {
      toast.push({ kind: 'error', title: 'Greška', body: e.message });
    } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const odobri = async (d) => {
    setBusyId(d.id);
    try {
      await api.op.post(`/api/dataset/${d.id}/odobri`);
      toast.push({ kind: 'success', title: 'Skup odobren i objavljen', body: d.naslov });
      setItems(prev => prev.filter(x => x.id !== d.id));
    } catch (e) {
      toast.push({ kind: 'error', title: 'Odobravanje neuspešno', body: e.message });
    } finally { setBusyId(null); }
  };

  const potvrdiOdbij = async () => {
    if (!razlogZa) return;
    setBusyId(razlogZa.id);
    try {
      await api.op.post(`/api/dataset/${razlogZa.id}/odbij`, { razlog: razlogText });
      toast.push({ kind: 'warning', title: 'Skup odbijen', body: razlogZa.naslov });
      setItems(prev => prev.filter(x => x.id !== razlogZa.id));
      setRazlogZa(null);
      setRazlogText('');
    } catch (e) {
      toast.push({ kind: 'error', title: 'Odbijanje neuspešno', body: e.message });
    } finally { setBusyId(null); }
  };

  return (
    <div>
      <PageHeader title="Skupovi koji čekaju odobrenje"
        subtitle={loading ? 'Učitavam…' : `${items.length} skup${items.length === 1 ? '' : 'a'} čeka pregled`}
        breadcrumbs={['Admin OP','Odobrenje']}
        actions={<Button kind="ghost" size="sm" icon="refresh" onClick={reload}>Osveži</Button>} />
      {items.length === 0 && !loading ? (
        <div className="card"><div className="card-body"><EmptyState title="Nema skupova na čekanju" body="Svi pristigli skupovi podataka su pregledani." icon="success" /></div></div>
      ) : (
        <div className="col gap-md">
          {items.map(d => (
            <div key={d.id} className="card">
              <div className="card-body">
                <div className="row between" style={{alignItems:'flex-start', gap:24}}>
                  <div style={{flex:1}}>
                    <div className="row gap-sm" style={{marginBottom:8}}>
                      <StatusBadge status="na_odobrenju" />
                      <Badge kind="neutral">{d.kategorija?.naziv}</Badge>
                      <Badge kind="neutral">{d.izvor?.naziv}</Badge>
                    </div>
                    <h3 style={{margin:'0 0 8px', fontSize:17}}>{d.naslov}</h3>
                    <p className="small muted" style={{margin:'0 0 10px', maxWidth:760}}>{d.opis}</p>
                    <div className="grid-3 small" style={{maxWidth:680}}>
                      <div><span className="muted">Godina:</span> <strong>{d.godina}</strong></div>
                      <div><span className="muted">Datum:</span> <span className="mono">{fmtDate(d.datum)}</span></div>
                      <div><span className="muted">Redova:</span> <span className="mono">{formatBroj(d.brojRedova || 0)}</span></div>
                    </div>
                  </div>
                  <div className="row gap-sm" style={{flexShrink:0}}>
                    <Button kind="danger" icon="x" disabled={busyId === d.id} onClick={() => { setRazlogZa({id: d.id, naslov: d.naslov}); setRazlogText(''); }}>Odbij</Button>
                    <Button kind="primary" icon="check" loading={busyId === d.id} onClick={() => odobri(d)}>Odobri</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!razlogZa} title="Razlog odbijanja"
        onClose={() => { setRazlogZa(null); setRazlogText(''); }}
        footer={<>
          <Button kind="secondary" onClick={() => { setRazlogZa(null); setRazlogText(''); }}>Otkaži</Button>
          <Button kind="danger" loading={!!busyId} onClick={potvrdiOdbij}>Potvrdi odbijanje</Button>
        </>}>
        <div className="col gap-sm">
          <div className="small muted">Skup: <strong>{razlogZa?.naslov}</strong></div>
          <Field label="Razlog (opciono)" hint="Razlog se prosleđuje Zdravstvu kao deo notifikacije.">
            <Textarea rows={4} value={razlogText} onChange={(e) => setRazlogText(e.target.value)} placeholder="Npr. Skup ne sadrži anonimizovane podatke." />
          </Field>
        </div>
      </Modal>
    </div>
  );
};

const OPAdminStatistika = () => {
  const [skupovi, setSkupovi] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const reload = async () => {
    setLoading(true);
    try {
      // Povlačimo samo OBJAVLJENE — obrisani, nacrt, na-odobrenju, odbijeni ne ulaze u javnu statistiku.
      const r = await api.op.get('/api/dataset/pretraga', { query: { status: 'OBJAVLJEN', size: 200 } });
      setSkupovi(r?.content || []);
    } catch (e) {
      toast.push({ kind: 'error', title: 'Greška', body: e.message });
    } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  // Top 10 po preuzimanjima.
  const top = useMemo(() => [...skupovi]
      .sort((a, b) => (b.brojPreuzimanja || 0) - (a.brojPreuzimanja || 0))
      .slice(0, 10)
      .map(d => ({ o: d.naslov, v: d.brojPreuzimanja || 0 })),
    [skupovi]);

  // Raspodela preuzimanja po kategoriji (pie %, largest-remainder za zbir tačno 100%).
  const poKategoriji = useMemo(() => {
    const palette = ['#0d4f3c', '#1098ad', '#b45309', '#7c2d12', '#5a6478', '#0369a1', '#7e22ce', '#15803d'];
    const grupe = {};
    skupovi.forEach(d => {
      const k = d.kategorija?.naziv || '—';
      grupe[k] = (grupe[k] || 0) + (d.brojPreuzimanja || 0);
    });
    const total = Object.values(grupe).reduce((s, x) => s + x, 0);
    if (total === 0) return [];
    const items = Object.entries(grupe).map(([k, count], i) => {
      const exact = 100 * count / total;
      return { k, count, floor: Math.floor(exact), rem: exact - Math.floor(exact), c: palette[i % palette.length] };
    });
    let rem = 100 - items.reduce((s, x) => s + x.floor, 0);
    items.sort((a, b) => b.rem - a.rem).forEach(it => { it.v = it.floor + (rem-- > 0 ? 1 : 0); });
    return items.sort((a, b) => b.count - a.count).map(it => ({ k: it.k, v: it.v, c: it.c }));
  }, [skupovi]);

  // Trend objava po mesecu (poslednjih 8 — proxy za aktivnost portala; preuzimanja po mesecu bi tražilo novi backend endpoint).
  const trend = useMemo(() => {
    const MES = ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'];
    const buckets = new Map();
    skupovi.forEach(d => {
      if (!d.datum) return;
      const ym = d.datum.slice(0, 7);
      buckets.set(ym, (buckets.get(ym) || 0) + (d.brojPreuzimanja || 0));
    });
    const today = new Date();
    const out = [];
    for (let i = 7; i >= 0; i--) {
      const dt = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const ym = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      out.push({ m: MES[dt.getMonth()], v: buckets.get(ym) || 0 });
    }
    return out;
  }, [skupovi]);

  return (
    <div>
      <PageHeader title="Statistika preuzimanja"
        subtitle={loading ? 'Učitavam…' : `Analitika nad ${skupovi.length} aktivnih skupova`}
        actions={<Button kind="ghost" size="sm" icon="refresh" onClick={reload}>Osveži</Button>} />
      <div className="grid-2" style={{alignItems:'flex-start'}}>
        <div className="card">
          <div className="card-head"><h3>Preuzimanja po mesecu objave</h3></div>
          <div className="card-body">
            {trend.length > 0 ? <LineChart data={trend} color="#0d4f3c" /> : <div className="muted">Nema podataka.</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Po kategorijama</h3></div>
          <div className="card-body">
            {poKategoriji.length > 0 ? <PieChart data={poKategoriji} /> : <div className="muted">Nema podataka.</div>}
          </div>
        </div>
      </div>
      <div className="card" style={{marginTop:18}}>
        <div className="card-head"><h3>Top 10 najpreuzimanijih skupova podataka</h3></div>
        <div className="card-body">
          {top.length > 0 ? <BarChart height={320} data={top} color="#0d4f3c" /> : <div className="muted">Nema aktivnih skupova.</div>}
        </div>
      </div>
    </div>
  );
};

const OPAdminIzvori = () => (
  <div>
    <PageHeader title="Izvori podataka" subtitle="Zdravstvene institucije koje objavljuju skupove podataka" />
    <div className="card">
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Institucija</th><th>Tip</th><th className="num">Skupova</th><th className="num">Preuzimanja</th><th>Status</th></tr></thead>
          <tbody>
            {[
              ['Ministarstvo zdravlja RS','Ministarstvo',62, 47820,'aktivan'],
              ['IZJZ Batut — Institut za javno zdravlje','Institut',48, 38420,'aktivan'],
              ['RFZO — Republički fond za zdravstveno osiguranje','Fond',36, 24820,'aktivan'],
              ['Klinički centar Srbije','Bolnica',18, 12204,'aktivan'],
              ['Institut za majku i dete','Institut',12, 9620,'aktivan'],
              ['Klinički centar Vojvodine','Bolnica',9, 7204,'aktivan'],
              ['Institut za transfuziju krvi','Institut',5, 3420,'aktivan'],
              ['Institut Dedinje','Bolnica',4, 1240,'neaktivan'],
            ].map((r,i) => (
              <tr key={i}>
                <td><Icon name="shield" size={14} style={{marginRight:8, color:'var(--opendata)'}} /><strong>{r[0]}</strong></td>
                <td><Badge kind="neutral">{r[1]}</Badge></td>
                <td className="num mono">{r[2]}</td>
                <td className="num mono">{formatBroj(r[3])}</td>
                <td><StatusBadge status={r[4]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

Object.assign(window, {
  OPPublic, OPKorisnikHome, OPKorisnikDatasetovi, OPKorisnikPreuzimanja,
  OPKorisnikPretplate, OPKorisnikAPIKey,
  OPAdminHome, OPAdminDatasetovi, OPAdminOdobrenje, OPAdminStatistika, OPAdminIzvori,
});
