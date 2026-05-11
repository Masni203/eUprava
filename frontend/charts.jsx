// ============ Charts (custom SVG) ============

const LineChart = ({ data, height = 220, color = '#0d4f3c', label = '' }) => {
  const w = 720, h = height, pad = { l: 50, r: 16, t: 18, b: 30 };
  const max = Math.max(...data.map(d => d.v)) * 1.1;
  const min = 0;
  const xStep = (w - pad.l - pad.r) / (data.length - 1);
  const points = data.map((d, i) => {
    const x = pad.l + i * xStep;
    const y = pad.t + (h - pad.t - pad.b) * (1 - (d.v - min) / (max - min));
    return [x, y, d];
  });
  const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ');
  const areaD = pathD + ` L${points[points.length-1][0]},${h - pad.b} L${points[0][0]},${h - pad.b} Z`;
  const yTicks = 4;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%', height: 'auto'}}>
      <defs>
        <linearGradient id="lc-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[...Array(yTicks + 1)].map((_, i) => {
        const y = pad.t + (h - pad.t - pad.b) * (i / yTicks);
        const v = max - (max - min) * (i / yTicks);
        return (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#e3e5ea" strokeDasharray={i === yTicks ? '' : '2 4'} />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#8b94a6" fontFamily="IBM Plex Mono">{Math.round(v).toLocaleString('sr-RS').replace(/,/g,'.')}</text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#lc-grad)" />
      <path d={pathD} stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3" fill="#fff" stroke={color} strokeWidth="2" />
          <text x={p[0]} y={h - 10} textAnchor="middle" fontSize="11" fill="#5a6478">{p[2].m}</text>
        </g>
      ))}
    </svg>
  );
};

const BarChart = ({ data, height = 240, color = '#1e3a8a', xKey = 'o', yKey = 'v' }) => {
  // Širina label-zone se računa dinamički iz najduže labele — SVG nema ellipsis
  // pa truncation izgleda kao bug ("ze (MKB-10...").
  const longest = Math.max(8, ...data.map(d => String(d[xKey] ?? '').length));
  const labelPx = Math.min(420, Math.max(96, longest * 7.2 + 12));
  const w = Math.max(720, labelPx + 480);
  const h = height, pad = { l: labelPx, r: 64, t: 14, b: 14 };
  const max = Math.max(...data.map(d => d[yKey])) * 1.1;
  const rowH = (h - pad.t - pad.b) / data.length;
  const barH = Math.min(22, rowH - 8);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%', height:'auto'}}>
      {data.map((d, i) => {
        const y = pad.t + i * rowH + (rowH - barH)/2;
        const barW = (w - pad.l - pad.r) * (d[yKey] / max);
        return (
          <g key={i}>
            <text x={4} y={y + barH/2 + 4} textAnchor="start" fontSize="12" fill="#2b3445">{d[xKey]}</text>
            <rect x={pad.l} y={y} width={barW} height={barH} rx="2" fill={color} opacity={0.85 - i*0.06} />
            <text x={pad.l + barW + 6} y={y + barH/2 + 4} fontSize="11" fill="#5a6478" fontFamily="IBM Plex Mono">
              {d[yKey].toLocaleString('sr-RS').replace(/,/g,'.')}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const PieChart = ({ data, size = 220 }) => {
  const total = data.reduce((s, d) => s + d.v, 0);
  let acc = 0;
  const cx = size/2, cy = size/2, r = size/2 - 6, ir = r * 0.55;
  const slices = data.map((d) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI/2;
    acc += d.v;
    const end = (acc / total) * Math.PI * 2 - Math.PI/2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
    const x3 = cx + ir * Math.cos(end), y3 = cy + ir * Math.sin(end);
    const x4 = cx + ir * Math.cos(start), y4 = cy + ir * Math.sin(start);
    return { d: `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${ir},${ir} 0 ${large} 0 ${x4},${y4} Z`, c: d.c, k: d.k, v: d.v };
  });
  return (
    <div className="row gap-lg" style={{alignItems:'center'}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.c} />)}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fill="#5a6478">Ukupno</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="18" fontWeight="600" fill="#0e1729">{total}%</text>
      </svg>
      <div className="col gap-sm" style={{flex: 1}}>
        {data.map((d, i) => (
          <div key={i} className="row between" style={{padding:'4px 0', fontSize: 13}}>
            <span><span className="lg-dot" style={{background: d.c, width:10, height:10, borderRadius:2, display:'inline-block', marginRight:8}} />{d.k}</span>
            <span className="tnum mono" style={{color:'#5a6478'}}>{d.v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ DatasetChart — renderuje GrafikonDTO iz OP backenda ============
// chart = { tip: 'bar'|'line', naslov, labels: [...], series: [{name, data:[...]}] }
const COLORS = ['#0d4f3c', '#1e3a8a', '#b45309', '#7c2d12', '#3f3f46', '#0369a1', '#5a6478'];

const DatasetChart = ({ chart, height = 280 }) => {
  if (!chart || !chart.labels?.length || !chart.series?.length) {
    return <div className="muted small">Nema podataka za prikaz.</div>;
  }
  const { tip, labels, series } = chart;

  if (tip === 'line') {
    const data = labels.map((l, i) => ({ m: l, v: series[0].data[i] || 0 }));
    return <LineChart data={data} height={height} color={COLORS[0]} />;
  }

  // Bar — single ili multi-series (grupisani vertikalni stubovi)
  const w = 720, h = height, pad = { l: 50, r: 16, t: 18, b: 60 };
  const flat = series.flatMap(s => s.data || []);
  const max = Math.max(1, ...flat.map(v => Number(v) || 0)) * 1.1;
  const groupW = (w - pad.l - pad.r) / labels.length;
  const barW = Math.max(6, (groupW - 8) / series.length);

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%', height:'auto'}}>
        {[0,1,2,3,4].map(i => {
          const y = pad.t + (h - pad.t - pad.b) * (i / 4);
          const v = max - max * (i / 4);
          return (
            <g key={i}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#e3e5ea" strokeDasharray={i === 4 ? '' : '2 4'} />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#8b94a6" fontFamily="IBM Plex Mono">
                {Math.round(v).toLocaleString('sr-RS').replace(/,/g,'.')}
              </text>
            </g>
          );
        })}
        {labels.map((label, gi) => {
          const gx = pad.l + gi * groupW + 4;
          return (
            <g key={gi}>
              {series.map((s, si) => {
                const v = Number(s.data[gi]) || 0;
                const bh = (h - pad.t - pad.b) * (v / max);
                const x = gx + si * barW;
                const y = h - pad.b - bh;
                return <rect key={si} x={x} y={y} width={Math.max(2, barW - 2)} height={bh} rx="2" fill={COLORS[si % COLORS.length]} opacity={0.9} />;
              })}
              <text x={gx + (groupW - 8) / 2} y={h - pad.b + 14} textAnchor="middle" fontSize="10" fill="#5a6478">
                {String(label).length > 12 ? String(label).slice(0, 12) + '…' : label}
              </text>
            </g>
          );
        })}
      </svg>
      {series.length > 1 && (
        <div className="row gap-md" style={{flexWrap:'wrap', marginTop:8, fontSize:12}}>
          {series.map((s, si) => (
            <span key={si} className="row gap-sm">
              <span style={{width:10, height:10, borderRadius:2, background: COLORS[si % COLORS.length], display:'inline-block'}} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { LineChart, BarChart, PieChart, DatasetChart });
