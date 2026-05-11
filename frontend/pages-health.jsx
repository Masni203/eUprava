// ============ Health pages (Pacijent / Doktor / Admin) ============

// ---------- PACIJENT ----------
const PacijentHome = ({ go }) => {
  const [me, setMe] = useState(null);
  const [pregledi, setPregledi] = useState([]);
  const [karton, setKarton] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const meDto = await api.zd.get('/api/pacijenti/me');
        setMe(meDto);
        const [pr, k] = await Promise.all([
          api.zd.get('/api/pregledi/moji', { query: { size: 100 } }),
          api.zd.get(`/api/karton/${meDto.id}`).catch(() => null),
        ]);
        setPregledi(pr.content || []);
        setKarton(k);
      } catch (_) {}
    })();
  }, []);

  // Sledeći pregled = najraniji u budućnosti sa statusom ZAKAZAN
  const today = new Date().toISOString().slice(0, 10);
  const next = [...pregledi]
    .filter(p => p.status === 'ZAKAZAN' && p.datum >= today)
    .sort((a, b) => (a.datum + a.vreme).localeCompare(b.datum + b.vreme))[0];

  const aktivneDijagnoze = (karton?.dijagnoze || []).filter(d => d.aktivna);
  const ime = me?.ime || 'pacijent';

  return (
    <div>
      <PageHeader title={`Dobrodošli, ${ime}`} subtitle="Sažetak vašeg zdravstvenog kartona i predstojećih obaveza" />
      <div className="kpi-grid">
        <KPI icon="calendar" label="Sledeći pregled" value={next ? fmtDate(next.datum) : '—'}
             hint={next ? `${fmtTime(next.vreme)} · Dr ${next.doktorIme} ${next.doktorPrezime}` : 'Nema zakazanog pregleda'} />
        <KPI icon="list" label="Ukupno pregleda" value={pregledi.length} hint="Iz kartona" />
        <KPI icon="heart" label="Aktivne dijagnoze" value={aktivneDijagnoze.length}
             hint={aktivneDijagnoze[0] ? `${aktivneDijagnoze[0].mkbSifra} ${aktivneDijagnoze[0].mkbNaziv}` : '—'} />
        <KPI icon="alert" label="Alergije" value={karton?.alergije?.length || 0} hint="Evidentirane u kartonu" />
      </div>

      <div className="grid-2" style={{marginTop:18}}>
        <div className="card">
          <div className="card-head"><h3>Predstojeći pregled</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => go('moji-pregledi')}>Svi pregledi <Icon name="arrow" size={13} /></button>
          </div>
          <div className="card-body">
            {next ? (
              <div>
                <div className="row gap-md" style={{marginBottom:14}}>
                  <div style={{width:64, height:64, borderRadius:8, background:'var(--primary-soft)', color:'var(--primary)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px solid var(--primary)'}}>
                    <div style={{fontSize:11, textTransform:'uppercase', fontWeight:600, letterSpacing:'.04em'}}>
                      {MONTHS_SR[parseInt(next.datum.split('-')[1], 10) - 1].slice(0,3)} {next.datum.slice(2,4)}
                    </div>
                    <div style={{fontSize:22, fontWeight:700, fontFamily:'IBM Plex Serif', lineHeight:1}}>{next.datum.split('-')[2]}</div>
                  </div>
                  <div>
                    <div style={{fontWeight:600, fontSize:15}}>{next.specijalizacija}</div>
                    <div className="muted small">Dr {next.doktorIme} {next.doktorPrezime}</div>
                    <div className="row gap-sm small" style={{marginTop:6}}>
                      <Icon name="clock" size={12} /> {fmtTime(next.vreme)}
                      {next.razlog && <><span style={{color:'var(--ink-4)'}}>·</span> {next.razlog}</>}
                    </div>
                  </div>
                </div>
              </div>
            ) : <EmptyState title="Nema zakazanog pregleda" body="Zakažite novi pregled iz menija." />}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Brze akcije</h3></div>
          <div className="card-body col gap-md">
            <Button kind="primary" icon="plus" onClick={() => go('zakazi')}>Zakaži pregled</Button>
            <Button kind="secondary" icon="document" onClick={() => go('karton')}>Otvori karton</Button>
            <hr className="sep" />
            {me && <>
              <div className="small muted">Vaš JMBG: <span className="mono">{me.jmbg}</span></div>
              <div className="small muted">Email: <strong style={{color:'var(--ink-2)'}}>{me.email}</strong></div>
              <div className="small muted">Grad: <strong style={{color:'var(--ink-2)'}}>{me.grad || '—'}</strong></div>
            </>}
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:18}}>
        <div className="card-head"><h3>Skorašnji pregledi</h3></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Datum</th><th>Vreme</th><th>Doktor</th><th>Specijalizacija</th><th>Status</th></tr></thead>
            <tbody>
              {pregledi.slice(0,4).map(p => (
                <tr key={p.id}>
                  <td className="mono">{fmtDate(p.datum)}</td>
                  <td className="mono">{fmtTime(p.vreme)}</td>
                  <td>Dr {p.doktorIme} {p.doktorPrezime}</td>
                  <td>{p.specijalizacija}</td>
                  <td><StatusBadge status={STATUS_MAP[p.status] || 'zakazan'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PacijentZakazi = ({ go }) => {
  const [step, setStep] = useState(0);
  const [specijalizacije, setSpecijalizacije] = useState([]);
  const [doktori, setDoktori] = useState([]);
  const [spec, setSpec] = useState(null);   // {sifra, naziv}
  const [dok, setDok] = useState(null);     // DoktorDTO
  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState(null); // DostupniTerminiDTO
  const [time, setTime] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  // Učitaj specijalizacije
  useEffect(() => {
    api.zd.get('/api/specijalizacije').then(setSpecijalizacije).catch(() => {});
  }, []);

  // Kad se izabere specijalizacija, učitaj doktore
  useEffect(() => {
    if (!spec) { setDoktori([]); return; }
    api.zd.get('/api/doktori', { query: { specijalizacija: spec.sifra, size: 50 } })
      .then(p => setDoktori(p.content || []))
      .catch(() => setDoktori([]));
  }, [spec]);

  // Kad se promeni datum ili doktor → učitaj slobodne termine
  useEffect(() => {
    if (!dok || !date) { setSlots(null); return; }
    const iso = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    api.zd.get('/api/pregledi/dostupni-termini', { query: { doktorId: dok.id, datum: iso } })
      .then(setSlots)
      .catch(() => setSlots({ slobodni: [], zauzeti: [] }));
    setTime(null);
  }, [dok, date]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const me = await api.zd.get('/api/pacijenti/me');
      const iso = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      await api.zd.post('/api/pregledi/zakazi', {
        pacijentId: me.id,
        doktorId: dok.id,
        datum: iso,
        vreme: time + ':00',
        razlog: reason || null,
      });
      toast.push({ kind: 'success', title: 'Pregled zakazan', body: `Dr ${dok.ime} ${dok.prezime} · ${iso} u ${time}` });
      go('moji-pregledi');
    } catch (e) {
      toast.push({ kind: 'error', title: 'Zakazivanje neuspešno', body: e.message || 'Greška' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Zakazivanje pregleda" subtitle="Izaberite specijalizaciju, doktora i termin"
        breadcrumbs={['Početna','Zakaži pregled']} />
      <Stepper steps={['Specijalizacija','Doktor','Termin','Potvrda']} current={step} />

      <div className="card">
        <div className="card-body">
          {step === 0 && (
            <div>
              <div className="section-title">Izaberite specijalizaciju</div>
              <div className="grid-3">
                {specijalizacije.map(s => (
                  <button key={s.sifra} className={`role-pick ${spec?.sifra === s.sifra ? 'active' : ''}`}
                    style={{padding:'14px 16px', fontSize:14}}
                    onClick={() => setSpec(s)}>
                    <Icon className="r-icon" name="stethoscope" size={20} />
                    {s.naziv}
                  </button>
                ))}
                {specijalizacije.length === 0 && <div className="muted">Učitavam…</div>}
              </div>
              <div className="row" style={{justifyContent:'flex-end', marginTop:18}}>
                <Button disabled={!spec} onClick={() => setStep(1)}>Dalje <Icon name="arrow" size={13} /></Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="section-title">Izaberite doktora — {spec.naziv}</div>
              <div className="col gap-sm">
                {doktori.map(d => (
                  <button key={d.id} className={`role-pick ${dok?.id === d.id ? 'active' : ''}`}
                    style={{padding:'14px 16px', justifyContent:'flex-start'}}
                    onClick={() => setDok(d)}>
                    <div className="avatar" style={{width:36, height:36, fontSize:13}}>
                      {((d.ime?.[0] || '') + (d.prezime?.[0] || '')).toUpperCase()}
                    </div>
                    <div style={{textAlign:'left', flex:1}}>
                      <div style={{fontWeight:600, fontSize:14}}>Dr {d.ime} {d.prezime}</div>
                      <div className="muted small">{d.bolnica?.naziv} · {d.bolnica?.grad}</div>
                    </div>
                    <Badge kind="success" dot>Slobodno</Badge>
                  </button>
                ))}
                {doktori.length === 0 && <EmptyState title="Nema doktora" body="Trenutno nema dostupnih doktora za izabranu specijalizaciju." />}
              </div>
              <div className="row between" style={{marginTop:18}}>
                <Button kind="secondary" onClick={() => setStep(0)} icon="chevron_l">Nazad</Button>
                <Button disabled={!dok} onClick={() => setStep(2)}>Dalje <Icon name="arrow" size={13} /></Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="section-title">Izaberite datum i vreme</div>
              <div className="grid-2" style={{alignItems:'flex-start'}}>
                <div>
                  <Calendar value={date} onChange={(d) => { setDate(d); setTime(null); }} hasSlots={(d) => d.getDay() !== 0 && d.getDay() !== 6} />
                  <div className="small muted" style={{marginTop:10, display:'flex', alignItems:'center', gap:8}}>
                    <span style={{width:6, height:6, borderRadius:999, background:'var(--primary)', display:'inline-block'}} />
                    Tačka označava dane sa slobodnim terminima
                  </div>
                </div>
                <div>
                  <div className="small muted" style={{marginBottom:6}}>
                    {date ? `Slobodni termini · ${date.getDate().toString().padStart(2,'0')}.${(date.getMonth()+1).toString().padStart(2,'0')}.${date.getFullYear()}` : 'Izaberite datum'}
                  </div>
                  {date && slots ? (
                    <div className="time-grid">
                      {[...(slots.slobodni || []).map(t => ({t: t.slice(0,5), taken: false})),
                        ...(slots.zauzeti  || []).map(t => ({t: t.slice(0,5), taken: true}))]
                        .sort((a,b) => a.t.localeCompare(b.t))
                        .map((s, i) => (
                        <button key={i} type="button" disabled={s.taken}
                          className={`time-slot${s.taken ? ' disabled' : ''}${time === s.t ? ' selected' : ''}`}
                          onClick={() => setTime(s.t)}>{s.t}</button>
                      ))}
                    </div>
                  ) : date ? <div className="muted">Učitavam termine…</div>
                    : <EmptyState title="Izaberite datum" body="Termini će se prikazati nakon izbora datuma." icon="calendar" />}
                </div>
              </div>
              <div className="row between" style={{marginTop:18}}>
                <Button kind="secondary" onClick={() => setStep(1)} icon="chevron_l">Nazad</Button>
                <Button disabled={!date || !time} onClick={() => setStep(3)}>Dalje <Icon name="arrow" size={13} /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="section-title">Pregled i potvrda</div>
              <div className="grid-2" style={{alignItems:'flex-start'}}>
                <div className="col gap-sm" style={{padding:'14px 18px', background:'var(--surface-2)', borderRadius:'var(--radius)', border:'1px solid var(--border)'}}>
                  <div className="row between"><span className="muted small">Specijalizacija</span><strong>{spec.naziv}</strong></div>
                  <div className="row between"><span className="muted small">Doktor</span><strong>Dr {dok.ime} {dok.prezime}</strong></div>
                  <div className="row between"><span className="muted small">Bolnica</span><span>{dok.bolnica?.naziv}</span></div>
                  <div className="row between"><span className="muted small">Datum</span><strong className="mono">{date.getDate().toString().padStart(2,'0')}.{(date.getMonth()+1).toString().padStart(2,'0')}.{date.getFullYear()}</strong></div>
                  <div className="row between"><span className="muted small">Vreme</span><strong className="mono">{time}</strong></div>
                </div>
                <Field label="Razlog dolaska (opciono)">
                  <Textarea rows={5} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Kratak opis simptoma ili razloga konsultacije..." />
                </Field>
              </div>
              <div className="row between" style={{marginTop:18}}>
                <Button kind="secondary" onClick={() => setStep(2)} icon="chevron_l">Nazad</Button>
                <Button kind="primary" loading={submitting} onClick={submit}>Potvrdi zakazivanje <Icon name="check" size={14} /></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mapa enum → frontend kod + helperi za format
const STATUS_MAP = { ZAKAZAN: 'zakazan', ZAVRSEN: 'zavrsen', U_TOKU: 'in-progress', OTKAZAN: 'otkazan' };
function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = String(iso).split('-');
  return `${d}.${m}.${y}`;
}
function fmtTime(iso) {
  if (!iso) return '';
  return String(iso).slice(0, 5);
}

const PacijentMojiPregledi = () => {
  const [filter, setFilter] = useState('svi');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  const [confirm, confirmNode] = useConfirm();

  const load = async () => {
    setError(null);
    try {
      const resp = await api.zd.get('/api/pregledi/moji', { query: { size: 50 } });
      setData(resp.content || []);
    } catch (e) {
      setError(e.message || 'Greška pri učitavanju pregleda');
    }
  };
  useEffect(() => { load(); }, []);

  const otkazi = async (p) => {
    const ok = await confirm({ title: 'Otkazivanje pregleda', message: `Otkazati pregled ${fmtDate(p.datum)} u ${fmtTime(p.vreme)}?`, danger: true, confirmText: 'Otkaži pregled' });
    if (!ok) return;
    try {
      await api.zd.patch(`/api/pregledi/${p.id}/status`, { status: 'OTKAZAN' });
      toast.push({ kind: 'success', title: 'Pregled otkazan' });
      load();
    } catch (e) {
      toast.push({ kind: 'error', title: 'Otkazivanje neuspešno', body: e.message });
    }
  };

  const list = (data || []).filter(p => {
    const s = STATUS_MAP[p.status] || 'svi';
    return filter === 'svi' || s === filter;
  });

  return (
    <div>
      <PageHeader title="Moji pregledi" subtitle="Istorija svih vaših pregleda" />
      <div className="filter-row">
        <span className="filter-label">Status:</span>
        <div className="chip-row">
          {[['svi','Svi'],['zakazan','Zakazani'],['zavrsen','Završeni'],['otkazan','Otkazani']].map(([v,l]) => (
            <button key={v} className={`chip ${filter===v?'active':''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          {error && <div className="empty-body" style={{padding:24, color:'var(--danger)'}}>{error}</div>}
          {!error && data === null && <div className="empty-body" style={{padding:24}}>Učitavam…</div>}
          {data !== null && (
            <table className="table">
              <thead><tr>
                <th>Datum</th><th>Vreme</th><th>Doktor</th><th>Specijalizacija</th>
                <th>Razlog</th><th>Status</th><th style={{textAlign:'right'}}>Akcije</th>
              </tr></thead>
              <tbody>
                {list.map(p => {
                  const s = STATUS_MAP[p.status] || 'zakazan';
                  return (
                    <tr key={p.id}>
                      <td className="mono">{fmtDate(p.datum)}</td>
                      <td className="mono">{fmtTime(p.vreme)}</td>
                      <td>{`Dr ${p.doktorIme || ''} ${p.doktorPrezime || ''}`.trim()}</td>
                      <td>{p.specijalizacija}</td>
                      <td>{p.razlog ? p.razlog : <span className="muted">—</span>}</td>
                      <td><StatusBadge status={s} /></td>
                      <td className="actions">
                        {s === 'zakazan' && <button className="icon-btn danger" title="Otkaži" onClick={() => otkazi(p)}><Icon name="x" size={14} /></button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {data !== null && list.length === 0 && <EmptyState title="Nema pregleda" body="Promenite filter ili zakažite novi pregled." icon="calendar" />}
        </div>
      </div>
      {confirmNode}
    </div>
  );
};

const PacijentKarton = () => {
  const [me, setMe] = useState(null);
  const [karton, setKarton] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const meDto = await api.zd.get('/api/pacijenti/me');
        setMe(meDto);
        const k = await api.zd.get(`/api/karton/${meDto.id}`);
        setKarton(k);
      } catch (e) {
        setError(e.message || 'Greška pri učitavanju kartona');
      }
    })();
  }, []);

  if (error) return (<div><PageHeader title="Moj zdravstveni karton" /><div className="card"><div className="card-body" style={{color:'var(--danger)'}}>{error}</div></div></div>);
  if (!karton || !me) return (<div><PageHeader title="Moj zdravstveni karton" /><div className="card"><div className="card-body">Učitavam…</div></div></div>);

  return (
  <div>
    <PageHeader title="Moj zdravstveni karton" subtitle="Kompletna evidencija dijagnoza, terapije i alergija" />

    <div className="grid-2" style={{alignItems:'flex-start'}}>
      <div className="col gap-md">
        <div className="card">
          <div className="card-head"><h3>Dijagnoze (MKB-10)</h3></div>
          <div className="card-body col gap-md">
            {(karton.dijagnoze || []).length === 0 && <EmptyState title="Nema dijagnoza" icon="document" />}
            {(karton.dijagnoze || []).map((d) => (
              <div key={d.id} style={{padding:'12px 14px', border:'1px solid var(--border)', borderLeft: `3px solid ${d.aktivna ? 'var(--accent)':'var(--border-strong)'}`, borderRadius:'var(--radius)'}}>
                <div className="row between" style={{marginBottom:6}}>
                  <div className="row gap-sm">
                    <span className="mono" style={{fontWeight:700, color:'var(--primary)', fontSize:14}}>{d.mkbSifra}</span>
                    <strong style={{fontSize:13.5}}>{d.mkbNaziv}</strong>
                  </div>
                  <Badge kind={d.aktivna ? 'danger' : 'neutral'} dot>{d.aktivna ? 'Aktivna' : 'Završena'}</Badge>
                </div>
                <div className="small muted">Postavljeno: <span className="mono">{fmtDate(d.datum)}</span> · {`Dr ${d.doktorIme || ''} ${d.doktorPrezime || ''}`.trim()}</div>
                {d.terapija && <div className="small" style={{marginTop:6, color:'var(--ink-2)'}}>
                  <Icon name="pill" size={12} style={{marginRight:6, color:'var(--ink-3)'}} />
                  <strong>Terapija:</strong> {d.terapija}
                </div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col gap-md">
        <div className="card">
          <div className="card-head"><h3>Alergije</h3></div>
          <div className="card-body col gap-sm">
            {(karton.alergije || []).length === 0 && <div className="muted small">Nema evidentiranih alergija.</div>}
            {(karton.alergije || []).map((a) => (
              <div key={a.id} className="row between" style={{padding:'8px 12px', background:'var(--surface-2)', borderRadius:'var(--radius)'}}>
                <span style={{fontWeight:500}}>{a.naziv}</span>
                <Badge kind={a.stepen === 'visok' ? 'danger' : a.stepen === 'srednji' ? 'warning' : 'neutral'}>
                  {a.stepen === 'visok' ? 'Visok rizik' : a.stepen === 'srednji' ? 'Srednji' : 'Nizak'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Lični podaci</h3></div>
          <div className="card-body col gap-sm small">
            <div className="row between"><span className="muted">Ime i prezime</span><strong>{me.ime} {me.prezime}</strong></div>
            <div className="row between"><span className="muted">JMBG</span><span className="mono">{me.jmbg}</span></div>
            <div className="row between"><span className="muted">Email</span><span>{me.email}</span></div>
            <div className="row between"><span className="muted">Telefon</span><span>{me.telefon || '—'}</span></div>
            <div className="row between"><span className="muted">Grad</span><span>{me.grad || '—'}</span></div>
            <div className="row between"><span className="muted">Datum rođenja</span><span className="mono">{me.datumRodjenja ? fmtDate(me.datumRodjenja) : '—'}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

// ---------- DOKTOR ----------
const DoktorHome = ({ go }) => {
  const me = (typeof meFromToken === 'function') ? meFromToken('zdravstvo') : null;
  const [pregledi, setPregledi] = useState([]);
  const [stats, setStats] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const resp = await api.zd.get('/api/pregledi/moji', { query: { size: 100 } });
      setPregledi(resp.content || []);
    } catch (_) {}
    try {
      const s = await api.zd.get('/api/stats');
      setStats(s);
    } catch (_) {}
  };
  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().slice(0, 10);
  const pregledidanas = pregledi.filter(p => p.datum === today);
  const moji = (st) => pregledidanas.filter(p => p.status === st).length;

  const promeni = async (p, novi) => {
    try {
      await api.zd.patch(`/api/pregledi/${p.id}/status`, { status: novi });
      load();
    } catch (e) { toast.push({ kind: 'error', title: 'Greška', body: e.message }); }
  };

  return (
    <div>
      <PageHeader title={me ? `Dobro jutro, Dr ${me.prezime}` : 'Dobrodošli'}
                  subtitle={`${pregledidanas.length} pregleda za danas`} />
      <div className="kpi-grid">
        <KPI icon="calendar" label="Pregledi danas" value={pregledidanas.length}
             hint={`${moji('ZAVRSEN')} završena · ${moji('U_TOKU')} u toku · ${moji('ZAKAZAN')} predstoje`} />
        <KPI icon="users" label="Ukupno pacijenata u sistemu" value={stats ? formatBroj(stats.brojPacijenata) : '…'} />
        <KPI icon="document" label="Postavljene dijagnoze" value={stats ? formatBroj(stats.brojDijagnoza) : '…'} hint="Sistem ukupno" />
        <KPI icon="list" label="Moji pregledi ukupno" value={pregledi.length} />
      </div>

      <div className="card" style={{marginTop:18}}>
        <div className="card-head">
          <h3>Današnji raspored</h3>
          <Button kind="ghost" size="sm" onClick={() => go('moji-pregledi')}>Vidi sve <Icon name="arrow" size={13} /></Button>
        </div>
        <div className="card-body">
          <div className="timeline">
            {pregledidanas.length === 0 && <EmptyState title="Nema pregleda za danas" icon="calendar" />}
            {pregledidanas.map(p => {
              const cls = STATUS_MAP[p.status] === 'in-progress' ? 'in-progress'
                : STATUS_MAP[p.status] === 'zavrsen' ? 'done' : 'upcoming';
              return (
                <div key={p.id} className="tl-item">
                  <div className="tl-time">{fmtTime(p.vreme)}</div>
                  <div className={`tl-card ${cls}`}>
                    <div>
                      <div style={{fontWeight:600, fontSize:14}}>{p.pacijentIme} {p.pacijentPrezime}</div>
                      <div className="small muted">JMBG <span className="mono">{p.pacijentJmbg}</span> · {p.razlog || '—'}</div>
                    </div>
                    <div className="row gap-sm">
                      <StatusBadge status={STATUS_MAP[p.status] || 'zakazan'} />
                      {p.status === 'ZAKAZAN' && <Button size="sm" icon="play" onClick={() => promeni(p, 'U_TOKU')}>Započni</Button>}
                      {p.status === 'U_TOKU' && <Button kind="success" size="sm" icon="check" onClick={() => go('unos-dijagnoze', { pacijent: p })}>Unesi dijagnozu</Button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const DoktorMojiPregledi = ({ go }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();

  const load = async () => {
    setError(null);
    try {
      const resp = await api.zd.get('/api/pregledi/moji', { query: { size: 50 } });
      setData(resp.content || []);
    } catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); }, []);

  const promeni = async (p, novi) => {
    try {
      await api.zd.patch(`/api/pregledi/${p.id}/status`, { status: novi });
      toast.push({ kind: 'success', title: 'Status promenjen', body: novi });
      load();
    } catch (e) {
      toast.push({ kind: 'error', title: 'Greška', body: e.message });
    }
  };

  return (
    <div>
      <PageHeader title="Moji pregledi" subtitle="Pregledi za koje ste lekar" />
      <div className="card">
        <div className="card-head">
          <h3>Svi pregledi</h3>
          <Button kind="ghost" size="sm" icon="refresh" onClick={load}>Osveži</Button>
        </div>
        <div className="table-wrap">
          {error && <div className="empty-body" style={{padding:24, color:'var(--danger)'}}>{error}</div>}
          {!error && data === null && <div className="empty-body" style={{padding:24}}>Učitavam…</div>}
          {data !== null && (
          <table className="table">
            <thead><tr>
              <th>Datum</th><th>Vreme</th><th>Pacijent</th><th>JMBG</th><th>Razlog</th><th>Status</th><th style={{textAlign:'right'}}>Akcija</th>
            </tr></thead>
            <tbody>
              {data.map(p => {
                const s = STATUS_MAP[p.status] || 'zakazan';
                return (
                  <tr key={p.id}>
                    <td className="mono">{fmtDate(p.datum)}</td>
                    <td className="mono">{fmtTime(p.vreme)}</td>
                    <td>{p.pacijentIme} {p.pacijentPrezime}</td>
                    <td className="mono small">{p.pacijentJmbg}</td>
                    <td>{p.razlog || <span className="muted">—</span>}</td>
                    <td><StatusBadge status={s} /></td>
                    <td className="actions">
                      {p.status === 'ZAKAZAN' && <Button size="sm" icon="play" onClick={() => promeni(p, 'U_TOKU')}>Započni</Button>}
                      {p.status === 'U_TOKU' && <Button kind="success" size="sm" icon="check" onClick={() => go('unos-dijagnoze', { pacijent: p })}>Unesi dijagnozu</Button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
          {data && data.length === 0 && <EmptyState title="Nema pregleda" icon="calendar" />}
        </div>
      </div>
    </div>
  );
};

const DoktorUnosDijagnoze = ({ params, go }) => {
  const [mkb, setMkb] = useState(null);
  const [opis, setOpis] = useState('');
  const [terapija, setTerapija] = useState('');
  const [napomena, setNapomena] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const pacObj = params?.pacijent;
  const pacIme = pacObj ? `${pacObj.pacijentIme || ''} ${pacObj.pacijentPrezime || ''}`.trim() || pacObj.pacijent || 'Pacijent' : 'Pacijent';
  const pacJmbg = pacObj?.pacijentJmbg || pacObj?.jmbg || '';
  const pacijentId = pacObj?.pacijentId;

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!mkb) errs.mkb = 'Izaberite MKB-10 kod';
    if (!opis || opis.length < 10) errs.opis = 'Opis je obavezan (min. 10 karaktera)';
    if (!terapija) errs.terapija = 'Terapija je obavezna';
    if (!pacijentId) errs.opis = 'Nedostaje pacijent (vratite se na listu pregleda)';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      const me = await api.zd.get('/api/doktori', { query: { q: '', size: 1 } }); // placeholder; serv ne nudi /me za doktora
      // Pošto nema /me za doktora, čitamo iz JWT-a:
      const myProfile = meFromToken('zdravstvo');
      // Uzmemo doktor.id preko email-a
      const dokSearch = await api.zd.get('/api/doktori', { query: { q: myProfile?.prezime || '', size: 50 } });
      const myDoktor = (dokSearch.content || []).find(d => d.email === myProfile?.email);
      if (!myDoktor) throw new Error('Nije pronađen doktor profil za prijavljenog korisnika');

      await api.zd.post(`/api/karton/${pacijentId}/dijagnoza`, {
        mkbSifra: mkb.code,
        doktorId: myDoktor.id,
        datum: new Date().toISOString().slice(0, 10),
        terapija: terapija + (napomena ? `\nNapomena: ${napomena}` : ''),
        aktivna: true,
      });
      // Ako je pregled u toku, odmah ga zatvori kao ZAVRSEN
      if (pacObj?.id) {
        await api.zd.patch(`/api/pregledi/${pacObj.id}/status`, { status: 'ZAVRSEN' });
      }
      toast.push({ kind: 'success', title: 'Dijagnoza sačuvana', body: `${mkb.code} · ${pacIme}` });
      go('moji-pregledi');
    } catch (e) {
      toast.push({ kind: 'error', title: 'Greška', body: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Unos dijagnoze" subtitle={`Pacijent: ${pacIme} · JMBG ${pacJmbg}`}
        breadcrumbs={['Moji pregledi','Pregled u toku','Unos dijagnoze']} />
      <form onSubmit={submit} className="card">
        <div className="card-body">
          <div className="form-grid">
            <div className="full">
              <Field label="MKB-10 kod" required error={errors.mkb} hint="Počnite kucati kod ili naziv dijagnoze">
                <MkbAutocomplete value={mkb} onChange={setMkb} />
              </Field>
            </div>
            <div className="full">
              <Field label="Opis nalaza" required error={errors.opis}>
                <Textarea rows={4} value={opis} error={errors.opis}
                  onChange={(e) => setOpis(e.target.value)}
                  placeholder="Anamneza, klinički nalaz, fizički pregled..." />
              </Field>
            </div>
            <Field label="Terapija" required error={errors.terapija}>
              <Textarea rows={3} value={terapija} error={errors.terapija}
                onChange={(e) => setTerapija(e.target.value)}
                placeholder="Lek, doza, učestalost, trajanje..." />
            </Field>
            <Field label="Napomena (opciono)">
              <Textarea rows={3} value={napomena}
                onChange={(e) => setNapomena(e.target.value)}
                placeholder="Dodatne preporuke, kontrola, uput..." />
            </Field>
            <div className="full row between" style={{marginTop:6}}>
              <label className="row gap-sm small" style={{cursor:'pointer'}}>
                <input type="checkbox" /> Izdaj recept i pošalji apoteci elektronski
              </label>
              <div className="row gap-sm">
                <Button kind="secondary" type="button" onClick={() => go('moji-pregledi')}>Otkaži</Button>
                <Button kind="primary" loading={submitting}>Sačuvaj dijagnozu <Icon name="check" size={14} /></Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const DoktorPretraga = () => {
  const [q, setQ] = useState('');
  const [jmbg, setJmbg] = useState('');
  const [grad, setGrad] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openedKarton, setOpenedKarton] = useState(null);   // {pacijent, karton}
  const [kartonLoading, setKartonLoading] = useState(false);
  const toast = useToast();

  const reload = async () => {
    setLoading(true);
    try {
      const resp = await api.zd.get('/api/pacijenti', { query: { q, jmbg, grad, size: 50 } });
      setResults(resp.content || []);
    } catch (e) { setResults([]); } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const otvoriKarton = async (p) => {
    setOpenedKarton({ pacijent: p, karton: null });
    setKartonLoading(true);
    try {
      const k = await api.zd.get(`/api/karton/${p.id}`);
      setOpenedKarton({ pacijent: p, karton: k });
    } catch (e) {
      toast.push({ kind: 'error', title: 'Karton nije dostupan', body: e.message });
      setOpenedKarton(null);
    } finally { setKartonLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Pretraga pacijenata" subtitle="Pronađite pacijenta po JMBG, imenu ili gradu" />
      <div className="card" style={{marginBottom:18}}>
        <div className="card-body row gap-sm">
          <Input placeholder="Ime ili prezime…" value={q} onChange={(e) => setQ(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && reload()} style={{maxWidth:240}} />
          <Input placeholder="JMBG (tačan)…" value={jmbg} onChange={(e) => setJmbg(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && reload()} style={{maxWidth:200}} />
          <Input placeholder="Grad…" value={grad} onChange={(e) => setGrad(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && reload()} style={{maxWidth:160}} />
          <Button icon="search" onClick={reload}>Pretraži</Button>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <h3>Rezultati ({loading ? '…' : results.length})</h3>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr>
              <th>Ime i prezime</th><th>JMBG</th><th>Email</th><th>Grad</th><th>Telefon</th><th style={{textAlign:'right'}}>Akcije</th>
            </tr></thead>
            <tbody>
              {results.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="row gap-sm">
                      <div className="avatar">{((p.ime?.[0] || '') + (p.prezime?.[0] || '')).toUpperCase()}</div>
                      <strong>{p.ime} {p.prezime}</strong>
                    </div>
                  </td>
                  <td className="mono">{p.jmbg}</td>
                  <td className="small">{p.email}</td>
                  <td>{p.grad || '—'}</td>
                  <td className="mono small">{p.telefon || '—'}</td>
                  <td className="actions">
                    <Button size="sm" kind="secondary" icon="document" onClick={() => otvoriKarton(p)}>Karton</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {results.length === 0 && <EmptyState title="Nema rezultata" body="Pokušajte sa drugim terminom pretrage." icon="search" />}
        </div>
      </div>

      <Modal open={!!openedKarton} onClose={() => setOpenedKarton(null)}
        title={openedKarton ? `Karton — ${openedKarton.pacijent.ime} ${openedKarton.pacijent.prezime}` : ''}
        footer={<Button kind="secondary" onClick={() => setOpenedKarton(null)}>Zatvori</Button>}>
        {kartonLoading && <div>Učitavam karton…</div>}
        {openedKarton?.karton && (
          <div className="col gap-md">
            <div className="row gap-sm" style={{flexWrap:'wrap'}}>
              <Badge>JMBG: <span className="mono">{openedKarton.pacijent.jmbg}</span></Badge>
              <Badge>{openedKarton.pacijent.grad || '—'}</Badge>
              <Badge>{openedKarton.pacijent.telefon || '—'}</Badge>
            </div>
            <div>
              <div className="section-title">Dijagnoze ({openedKarton.karton.dijagnoze?.length || 0})</div>
              {(openedKarton.karton.dijagnoze || []).length === 0 && <div className="muted small">Nema unetih dijagnoza.</div>}
              <div className="col gap-sm">
                {(openedKarton.karton.dijagnoze || []).map(d => (
                  <div key={d.id} style={{padding:'10px 12px', border:'1px solid var(--border)', borderLeft: `3px solid ${d.aktivna ? 'var(--accent)':'var(--border-strong)'}`, borderRadius:'var(--radius)'}}>
                    <div className="row between">
                      <div><span className="mono" style={{fontWeight:700, color:'var(--primary)'}}>{d.mkbSifra}</span> <strong>{d.mkbNaziv}</strong></div>
                      <Badge kind={d.aktivna ? 'danger' : 'neutral'} dot>{d.aktivna ? 'Aktivna' : 'Završena'}</Badge>
                    </div>
                    <div className="small muted">{fmtDate(d.datum)} · Dr {d.doktorIme} {d.doktorPrezime}</div>
                    {d.terapija && <div className="small" style={{marginTop:4}}><strong>Terapija:</strong> {d.terapija}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="section-title">Alergije ({openedKarton.karton.alergije?.length || 0})</div>
              {(openedKarton.karton.alergije || []).length === 0 && <div className="muted small">Nema unetih alergija.</div>}
              <div className="col gap-sm">
                {(openedKarton.karton.alergije || []).map(a => (
                  <div key={a.id} className="row between" style={{padding:'6px 10px', background:'var(--surface-2)', borderRadius:'var(--radius)'}}>
                    <span>{a.naziv}</span>
                    <Badge kind={a.stepen === 'visok' ? 'danger' : a.stepen === 'srednji' ? 'warning' : 'neutral'}>{a.stepen}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ---------- ADMIN ZDRAVSTVO ----------
const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [poSpec, setPoSpec] = useState([]);
  const [poOpstini, setPoOpstini] = useState([]);

  useEffect(() => {
    api.zd.get('/api/stats').then(setStats).catch(() => {});
    // Top 5 specijalizacija po broju doktora (proxi za "po pregledima" — backend nema spec×pregledi pa idemo na ovo).
    api.zd.get('/api/doktori', { query: { size: 100 } }).then(p => {
      const grupe = {};
      (p.content || []).forEach(d => {
        const k = d.specijalizacija?.naziv || '—';
        grupe[k] = (grupe[k] || 0) + 1;
      });
      const palette = ['#1e3a8a', '#0d4f3c', '#b45309', '#0369a1', '#7c2d12', '#5a6478', '#3f3f46'];
      // Largest remainder method — sume procenata su tačno 100, izbegnut 102%/103% bug.
      const total = (p.content || []).length || 1;
      const items = Object.entries(grupe).map(([k, count], i) => {
        const exact = 100 * count / total;
        return { k, count, exact, floor: Math.floor(exact), rem: exact - Math.floor(exact), c: palette[i % palette.length] };
      });
      let remainder = 100 - items.reduce((s, x) => s + x.floor, 0);
      items.sort((a, b) => b.rem - a.rem).forEach((it) => {
        it.v = it.floor + (remainder-- > 0 ? 1 : 0);
      });
      items.sort((a, b) => b.count - a.count);
      setPoSpec(items.map(it => ({ k: it.k, v: it.v, c: it.c })));
    }).catch(() => {});
    // Pacijenti po gradu
    api.zd.get('/api/pacijenti', { query: { size: 100 } }).then(p => {
      const grupe = {};
      (p.content || []).forEach(x => {
        const k = x.grad || '—';
        grupe[k] = (grupe[k] || 0) + 1;
      });
      setPoOpstini(Object.entries(grupe).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([o, v]) => ({ o, v })));
    }).catch(() => {});
  }, []);

  return (
  <div>
    <PageHeader title="Administrativna kontrolna tabla" subtitle="Pregled stanja zdravstvenog sistema" />
    <div className="kpi-grid">
      <KPI icon="users" label="Ukupno pacijenata" value={stats ? formatBroj(stats.brojPacijenata) : '…'} />
      <KPI icon="stethoscope" label="Aktivnih doktora" value={stats ? formatBroj(stats.brojDoktora) : '…'} />
      <KPI icon="calendar" label="Pregleda danas" value={stats ? formatBroj(stats.pregledaDanas) : '…'} hint={stats ? `${formatBroj(stats.pregledaZakazani)} zakazanih` : ''} />
      <KPI icon="document" label="Pregleda ovog meseca" value={stats ? formatBroj(stats.pregledaOvogMeseca) : '…'} hint={stats ? `${formatBroj(stats.pregledaUkupno)} ukupno u sistemu` : ''} />
    </div>

    <div className="grid-2" style={{marginTop:18, alignItems:'flex-start'}}>
      <div className="card">
        <div className="card-head"><h3>Doktori po specijalizaciji</h3></div>
        <div className="card-body">
          {poSpec.length > 0 ? <PieChart data={poSpec} /> : <div className="muted">Učitavam…</div>}
        </div>
      </div>
      <div className="card">
        <div className="card-head"><h3>Pacijenti po gradu</h3></div>
        <div className="card-body">
          {poOpstini.length > 0 ? <BarChart data={poOpstini} color="#1e3a8a" /> : <div className="muted">Učitavam…</div>}
        </div>
      </div>
    </div>
  </div>
  );
};

const AdminKorisnici = () => {
  const [pacijenti, setPacijenti] = useState([]);
  const [doktori, setDoktori] = useState([]);
  const [filter, setFilter] = useState('svi');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [confirm, confirmNode] = useConfirm();

  const reload = async () => {
    setLoading(true);
    try {
      const [p, d] = await Promise.all([
        api.zd.get('/api/pacijenti', { query: { size: 100 } }),
        api.zd.get('/api/doktori',   { query: { size: 100 } }),
      ]);
      setPacijenti(p.content || []);
      setDoktori(d.content || []);
    } catch (e) {
      toast.push({ kind: 'error', title: 'Greška', body: e.message });
    } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const removePacijent = async (p) => {
    const ok = await confirm({ title: 'Brisanje pacijenta', message: `Trajno obrisati pacijenta ${p.ime} ${p.prezime}?`, danger: true, confirmText: 'Obriši' });
    if (!ok) return;
    try {
      await api.zd.del(`/api/pacijenti/${p.id}`);
      toast.push({ kind: 'success', title: 'Pacijent obrisan' });
      reload();
    } catch (e) { toast.push({ kind: 'error', title: 'Greška', body: e.message }); }
  };
  const removeDoktor = async (d) => {
    const ok = await confirm({ title: 'Brisanje doktora', message: `Trajno obrisati doktora ${d.ime} ${d.prezime}?`, danger: true, confirmText: 'Obriši' });
    if (!ok) return;
    try {
      await api.zd.del(`/api/doktori/${d.id}`);
      toast.push({ kind: 'success', title: 'Doktor obrisan' });
      reload();
    } catch (e) { toast.push({ kind: 'error', title: 'Greška', body: e.message }); }
  };

  const showPacijenti = filter === 'svi' || filter === 'pacijent';
  const showDoktori   = filter === 'svi' || filter === 'doktor';

  return (
    <div>
      <PageHeader title="Upravljanje korisnicima" subtitle={`${pacijenti.length} pacijenata · ${doktori.length} doktora`}
        actions={<Button kind="ghost" size="sm" icon="refresh" onClick={reload}>Osveži</Button>} />

      <div className="filter-row">
        <span className="filter-label">Uloga:</span>
        <div className="chip-row">
          {[['svi','Svi'],['pacijent','Pacijenti'],['doktor','Doktori']].map(([v,l]) => (
            <button key={v} className={`chip ${filter===v?'active':''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      {loading && <div className="card"><div className="card-body">Učitavam…</div></div>}

      {showPacijenti && (
        <div className="card" style={{marginBottom:18}}>
          <div className="card-head"><h3>Pacijenti</h3></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Ime</th><th>Email</th><th>JMBG</th><th>Grad</th><th>Status</th><th style={{textAlign:'right'}}>Akcije</th></tr></thead>
              <tbody>
                {pacijenti.map(p => (
                  <tr key={p.id}>
                    <td><div className="row gap-sm"><div className="avatar">{((p.ime?.[0] || '') + (p.prezime?.[0] || '')).toUpperCase()}</div><strong>{p.ime} {p.prezime}</strong></div></td>
                    <td className="muted small">{p.email}</td>
                    <td className="mono small">{p.jmbg}</td>
                    <td>{p.grad || '—'}</td>
                    <td><StatusBadge status={p.aktivan ? 'aktivan' : 'neaktivan'} /></td>
                    <td className="actions">
                      <button className="icon-btn danger" title="Obriši" onClick={() => removePacijent(p)}><Icon name="trash" size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showDoktori && (
        <div className="card">
          <div className="card-head"><h3>Doktori</h3></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Ime</th><th>Email</th><th>Specijalizacija</th><th>Bolnica</th><th>Status</th><th style={{textAlign:'right'}}>Akcije</th></tr></thead>
              <tbody>
                {doktori.map(d => (
                  <tr key={d.id}>
                    <td><div className="row gap-sm"><div className="avatar">{((d.ime?.[0] || '') + (d.prezime?.[0] || '')).toUpperCase()}</div><strong>Dr {d.ime} {d.prezime}</strong></div></td>
                    <td className="muted small">{d.email}</td>
                    <td>{d.specijalizacija?.naziv}</td>
                    <td>{d.bolnica?.naziv} <span className="muted small">({d.bolnica?.grad})</span></td>
                    <td><StatusBadge status={d.aktivan ? 'aktivan' : 'neaktivan'} /></td>
                    <td className="actions">
                      <button className="icon-btn danger" title="Obriši" onClick={() => removeDoktor(d)}><Icon name="trash" size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {confirmNode}
    </div>
  );
};

const AdminIzvestaji = () => {
  const [period, setPeriod] = useState('mesec');
  const [format, setFormat] = useState('JSON');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const toast = useToast();

  const generate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (format === 'CSV') {
        const blob = await apiCall('zdravstvo', 'GET', `/api/izvestaji/generisi?period=${period}&format=CSV`, { asBlob: true });
        downloadBlob(blob, `izvestaj-${period}.csv`);
        toast.push({ kind: 'success', title: 'Preuzimanje pokrenuto', body: `izvestaj-${period}.csv` });
      } else {
        const data = await api.zd.get('/api/izvestaji/generisi', { query: { period, format: 'JSON' } });
        setPreview(data);
        toast.push({ kind: 'success', title: 'Izveštaj generisan' });
      }
    } catch (e) {
      toast.push({ kind: 'error', title: 'Greška', body: e.message });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Generisanje izveštaja" subtitle="Kreirajte agregirane izveštaje za štampu i analizu" />
      <div className="grid-2" style={{alignItems:'flex-start'}}>
        <form className="card" onSubmit={generate}>
          <div className="card-head"><h3>Parametri izveštaja</h3></div>
          <div className="card-body">
            <div className="form-grid">
              <Field label="Period" required>
                <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option value="nedelja">Poslednjih 7 dana</option>
                  <option value="mesec">Poslednjih 30 dana</option>
                  <option value="godina">Godina</option>
                </Select>
              </Field>
              <Field label="Format" required>
                <div className="chip-row">
                  {['JSON','CSV'].map(f => (
                    <button type="button" key={f} className={`chip ${format===f?'active':''}`} onClick={() => setFormat(f)}>{f}</button>
                  ))}
                </div>
              </Field>
            </div>
            <hr className="sep" />
            <div className="row" style={{justifyContent:'flex-end'}}>
              <Button kind="primary" loading={loading} icon={loading ? null : 'download'}>Generiši izveštaj</Button>
            </div>
          </div>
        </form>

        <div className="card">
          <div className="card-head"><h3>Pregled (JSON format)</h3></div>
          <div className="card-body">
            {!preview && <div className="muted small">Generišite izveštaj u JSON formatu da bi se prikazao ovde.</div>}
            {preview && (
              <div className="col gap-md">
                <div className="kpi-grid" style={{gridTemplateColumns:'repeat(2, 1fr)'}}>
                  <KPI icon="calendar" label="Period" value={preview.period} hint={`${fmtDate(preview.odDatuma)} → ${fmtDate(preview.doDatuma)}`} />
                  <KPI icon="document" label="Pregleda ukupno" value={preview.ukupanBrojPregleda} />
                </div>
                <div>
                  <div className="section-title">Po statusu</div>
                  <div className="row gap-sm" style={{flexWrap:'wrap'}}>
                    {Object.entries(preview.pregledaPoStatusu || {}).map(([k, v]) => (
                      <Badge key={k}>{k}: {v}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="section-title">Po specijalizaciji</div>
                  <div className="col gap-sm small">
                    {Object.entries(preview.pregledaPoSpecijalizaciji || {}).map(([k, v]) => (
                      <div key={k} className="row between"><span>{k}</span><strong className="mono">{v}</strong></div>
                    ))}
                  </div>
                </div>
                {preview.najcesceDijagnoze?.length > 0 && (
                  <div>
                    <div className="section-title">Najčešće dijagnoze</div>
                    <table className="table">
                      <thead><tr><th>MKB</th><th>Naziv</th><th style={{textAlign:'right'}}>Broj</th></tr></thead>
                      <tbody>
                        {preview.najcesceDijagnoze.map((m, i) => (
                          <tr key={i}><td className="mono">{m.mkbSifra}</td><td>{m.mkbNaziv}</td><td className="mono" style={{textAlign:'right'}}>{m.broj}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminObjavi = () => {
  const [period, setPeriod] = useState('mesec');
  const [tip, setTip] = useState('agregat');
  const [publishing, setPublishing] = useState(false);
  const [last, setLast] = useState(null);
  const [istorija, setIstorija] = useState([]);
  const [confirm, confirmNode] = useConfirm();
  const toast = useToast();

  const reloadIstorija = () => {
    // Razmena 2: Zd → OP preko /api/statistika/objavljene (interno zovne OP /pretraga?izvor=MZ RS)
    api.zd.get('/api/statistika/objavljene')
      .then(p => setIstorija(p.content || []))
      .catch(() => setIstorija([]));
  };
  useEffect(() => { reloadIstorija(); }, []);

  const povuci = async (s) => {
    const ok = await confirm({
      title: 'Povlačenje objavljene statistike',
      message: `Trajno povući "${s.naslov}" sa portala Otvorenih Podataka? Sva preuzimanja će biti obrisana.`,
      danger: true,
      confirmText: 'Povuci'
    });
    if (!ok) return;
    try {
      // Razmena 3: Zd → OP DELETE /api/dataset/import/{id}
      await api.zd.del(`/api/statistika/objavljene/${s.id}`);
      toast.push({ kind: 'success', title: 'Skup povučen sa OP-a' });
      reloadIstorija();
    } catch (e) {
      toast.push({ kind: 'error', title: 'Povlačenje neuspešno', body: e.message });
    }
  };

  const publish = async () => {
    const ok = await confirm({
      title: 'Objavi statistiku u Otvorene Podatke',
      message: `Anonimni agregat (${tip} · period: ${period}) će biti poslat servisu Otvoreni Podaci i biće javno dostupan. Nastaviti?`,
      confirmText: 'Da, objavi'
    });
    if (!ok) return;
    setPublishing(true);
    try {
      const resp = await api.zd.post(`/api/statistika/objavi?tip=${tip}&period=${period}`);
      setLast(resp);
      toast.push({ kind: 'success', title: 'Objavljeno!', body: `Skup #${resp.id} · ${resp.brojRedova} redova` });
      reloadIstorija();
    } catch (e) {
      toast.push({ kind: 'error', title: 'Objavljivanje neuspešno', body: e.message });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <PageHeader title="Objavi statistiku u Otvorene Podatke"
        subtitle="Anonimno agregira pregledi/dijagnoze i šalje na javni katalog (FAZA 6 inter-service flow)"
        breadcrumbs={['Admin','Objavi statistiku']} />

      <div className="card" style={{marginBottom:18}}>
        <div className="card-head"><h3>Parametri</h3></div>
        <div className="card-body">
          <div className="form-grid">
            <Field label="Period" required>
              <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="nedelja">Poslednjih 7 dana</option>
                <option value="mesec">Poslednjih 30 dana</option>
                <option value="godina">Godina</option>
              </Select>
            </Field>
            <Field label="Tip agregata" required>
              <Select value={tip} onChange={(e) => setTip(e.target.value)}>
                <option value="agregat">Pregledi po opštini × specijalizaciji</option>
                <option value="top">Top dijagnoze (MKB-10)</option>
              </Select>
            </Field>
          </div>
          <hr className="sep" />
          <div className="row between">
            <Badge kind="success" dot>Anonimizacija primenjena · bez JMBG/imena/adrese</Badge>
            <Button kind="primary" icon="upload" loading={publishing} onClick={publish}>Pošalji u Otvorene Podatke</Button>
          </div>
        </div>
      </div>

      {last && (
        <div className="card" style={{marginBottom:18, borderLeft:'3px solid var(--success)'}}>
          <div className="card-head"><h3>Poslednja objava</h3></div>
          <div className="card-body col gap-sm small">
            <div><strong>{last.naslov}</strong></div>
            <div className="muted">{last.opis}</div>
            <div className="row gap-sm" style={{flexWrap:'wrap'}}>
              <Badge>ID #{last.id}</Badge>
              <Badge>{last.brojRedova} redova</Badge>
              <Badge kind="primary">{last.kategorija?.naziv}</Badge>
              <Badge>{last.izvor?.naziv}</Badge>
              <StatusBadge status="objavljen" />
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <h3>Prethodno objavljene statistike (eUprava izvor)</h3>
          <Button kind="ghost" size="sm" icon="refresh" onClick={reloadIstorija}>Osveži</Button>
        </div>
        <div className="table-wrap">
          {istorija.length === 0 && <div className="empty-body muted" style={{padding:20}}>Nema prethodno objavljenih.</div>}
          {istorija.length > 0 && (
            <table className="table">
              <thead><tr>
                <th>Naslov</th><th>Kategorija</th><th>Godina</th><th className="num">Preuzimanja</th><th>Datum objave</th>
                <th style={{textAlign:'right'}}>Akcija</th>
              </tr></thead>
              <tbody>
                {istorija.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.naslov}</strong></td>
                    <td>{s.kategorija?.naziv}</td>
                    <td className="num">{s.godina}</td>
                    <td className="num mono">{formatBroj(s.brojPreuzimanja || 0)}</td>
                    <td className="mono small">{fmtDate(s.datum)}</td>
                    <td className="actions">
                      <button className="icon-btn danger" title="Povuci sa OP-a" onClick={() => povuci(s)}><Icon name="trash" size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {confirmNode}
    </div>
  );
};

Object.assign(window, {
  PacijentHome, PacijentZakazi, PacijentMojiPregledi, PacijentKarton,
  DoktorHome, DoktorMojiPregledi, DoktorUnosDijagnoze, DoktorPretraga,
  AdminHome, AdminKorisnici, AdminIzvestaji, AdminObjavi,
});
