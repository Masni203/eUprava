// ============ MOCK DATA ============
const SPECIJALIZACIJE = [
  { id: 'opsta', name: 'Opšta praksa', icon: 'stethoscope' },
  { id: 'kardio', name: 'Kardiologija', icon: 'heart' },
  { id: 'pedi', name: 'Pedijatrija', icon: 'baby' },
  { id: 'neuro', name: 'Neurologija', icon: 'brain' },
  { id: 'derma', name: 'Dermatologija', icon: 'shield' },
  { id: 'ortop', name: 'Ortopedija', icon: 'bone' },
];

const DOKTORI = [
  { id: 'd1', ime: 'Dr Marko Petrović', spec: 'opsta', bolnica: 'Klinički centar Srbije', sl: 'KCS', grad: 'Beograd' },
  { id: 'd2', ime: 'Dr Ana Jovanović', spec: 'kardio', bolnica: 'Klinički centar Srbije', sl: 'KCS', grad: 'Beograd' },
  { id: 'd3', ime: 'Dr Stefan Nikolić', spec: 'pedi', bolnica: 'Institut za majku i dete', sl: 'IMD', grad: 'Beograd' },
  { id: 'd4', ime: 'Dr Milica Kovačević', spec: 'neuro', bolnica: 'Klinički centar Vojvodine', sl: 'KCV', grad: 'Novi Sad' },
  { id: 'd5', ime: 'Dr Nikola Đorđević', spec: 'derma', bolnica: 'Dom zdravlja Niš', sl: 'DZN', grad: 'Niš' },
  { id: 'd6', ime: 'Dr Jelena Stanković', spec: 'ortop', bolnica: 'Opšta bolnica Kragujevac', sl: 'OBK', grad: 'Kragujevac' },
  { id: 'd7', ime: 'Dr Miloš Ilić', spec: 'opsta', bolnica: 'Dom zdravlja Subotica', sl: 'DZS', grad: 'Subotica' },
  { id: 'd8', ime: 'Dr Sanja Marković', spec: 'kardio', bolnica: 'Institut Dedinje', sl: 'ID', grad: 'Beograd' },
];

const MKB_KODOVI = [
  { code: 'J06.9', name: 'Akutna infekcija gornjih disajnih puteva' },
  { code: 'I10', name: 'Esencijalna (primarna) hipertenzija' },
  { code: 'E11.9', name: 'Diabetes mellitus tip 2 bez komplikacija' },
  { code: 'M54.5', name: 'Bol u donjem delu leđa' },
  { code: 'K29.7', name: 'Gastritis, neoznačen' },
  { code: 'R51', name: 'Glavobolja' },
  { code: 'F32.9', name: 'Depresivna epizoda, neoznačena' },
  { code: 'J45.9', name: 'Astma, neoznačena' },
  { code: 'L20.9', name: 'Atopijski dermatitis, neoznačen' },
  { code: 'N39.0', name: 'Infekcija mokraćnih puteva' },
  { code: 'H10.9', name: 'Konjunktivitis, neoznačen' },
  { code: 'B34.9', name: 'Virusna infekcija, neoznačena' },
];

const PACIJENTI_MOCK = [
  { id: 'p1', ime: 'Jovan Marković', jmbg: '0101990710025', grad: 'Beograd', god: 36, tel: '+381 60 123 4567' },
  { id: 'p2', ime: 'Milena Stojanović', jmbg: '1505198575019', grad: 'Novi Sad', god: 41, tel: '+381 65 234 5678' },
  { id: 'p3', ime: 'Dragan Vasiljević', jmbg: '2208196210038', grad: 'Niš', god: 63, tel: '+381 64 345 6789' },
  { id: 'p4', ime: 'Tijana Popović', jmbg: '3009199575024', grad: 'Beograd', god: 30, tel: '+381 63 456 7890' },
  { id: 'p5', ime: 'Branko Lukić', jmbg: '1107198810017', grad: 'Kragujevac', god: 38, tel: '+381 62 567 8901' },
  { id: 'p6', ime: 'Aleksandra Tomić', jmbg: '0403200175036', grad: 'Subotica', god: 25, tel: '+381 60 678 9012' },
];

const PREGLEDI_PACIJENT = [
  { id: 'pr1', datum: '15.05.2026', vreme: '10:30', doktor: 'Dr Ana Jovanović', spec: 'Kardiologija', status: 'zakazan', dijagnoza: null },
  { id: 'pr2', datum: '02.04.2026', vreme: '09:00', doktor: 'Dr Marko Petrović', spec: 'Opšta praksa', status: 'zavrsen', dijagnoza: 'J06.9' },
  { id: 'pr3', datum: '18.03.2026', vreme: '14:15', doktor: 'Dr Marko Petrović', spec: 'Opšta praksa', status: 'zavrsen', dijagnoza: 'I10' },
  { id: 'pr4', datum: '21.02.2026', vreme: '11:00', doktor: 'Dr Stefan Nikolić', spec: 'Pedijatrija', status: 'otkazan', dijagnoza: null },
  { id: 'pr5', datum: '08.01.2026', vreme: '08:30', doktor: 'Dr Marko Petrović', spec: 'Opšta praksa', status: 'zavrsen', dijagnoza: 'R51' },
];

const MOJE_DIJAGNOZE = [
  { mkb: 'I10', naziv: 'Esencijalna hipertenzija', datum: '18.03.2026', doktor: 'Dr Marko Petrović', terapija: 'Concor 5mg, 1x dnevno', aktivna: true },
  { mkb: 'J06.9', naziv: 'Akutna infekcija gornjih disajnih puteva', datum: '02.04.2026', doktor: 'Dr Marko Petrović', terapija: 'Paracetamol 500mg, do 3x dnevno; tečnost', aktivna: false },
  { mkb: 'M54.5', naziv: 'Bol u donjem delu leđa', datum: '12.11.2025', doktor: 'Dr Jelena Stanković', terapija: 'Diklofenak gel 1%, lokalno; kineziterapija', aktivna: false },
];

const ALERGIJE = [
  { naziv: 'Penicilin', stepen: 'visok' },
  { naziv: 'Polen breze', stepen: 'srednji' },
  { naziv: 'Lateks', stepen: 'nizak' },
];

const DOKTOR_PREGLEDI_DANAS = [
  { id: 't1', vreme: '08:30', pacijent: 'Milena Stojanović', jmbg: '1505198575019', razlog: 'Kontrola krvnog pritiska', status: 'done' },
  { id: 't2', vreme: '09:15', pacijent: 'Branko Lukić', jmbg: '1107198810017', razlog: 'Bol u grudima', status: 'done' },
  { id: 't3', vreme: '10:00', pacijent: 'Jovan Marković', jmbg: '0101990710025', razlog: 'EKG kontrola', status: 'in-progress' },
  { id: 't4', vreme: '10:45', pacijent: 'Aleksandra Tomić', jmbg: '0403200175036', razlog: 'Prvi pregled', status: 'upcoming' },
  { id: 't5', vreme: '11:30', pacijent: 'Dragan Vasiljević', jmbg: '2208196210038', razlog: 'Holter rezultati', status: 'upcoming' },
  { id: 't6', vreme: '13:00', pacijent: 'Tijana Popović', jmbg: '3009199575024', razlog: 'Konsultacija', status: 'upcoming' },
];

const KORISNICI_ADMIN = [
  { id: 'k1', ime: 'Jovan Marković', email: 'jovan.markovic@example.rs', uloga: 'pacijent', status: 'aktivan', kreiran: '15.01.2026' },
  { id: 'k2', ime: 'Dr Ana Jovanović', email: 'ana.jovanovic@kcs.rs', uloga: 'doktor', status: 'aktivan', kreiran: '03.02.2025' },
  { id: 'k3', ime: 'Milena Stojanović', email: 'milena.s@example.rs', uloga: 'pacijent', status: 'aktivan', kreiran: '22.07.2025' },
  { id: 'k4', ime: 'Dr Marko Petrović', email: 'marko.p@kcs.rs', uloga: 'doktor', status: 'aktivan', kreiran: '11.09.2024' },
  { id: 'k5', ime: 'Stefan Marić', email: 's.maric@example.rs', uloga: 'pacijent', status: 'neaktivan', kreiran: '04.06.2025' },
  { id: 'k6', ime: 'Dr Stefan Nikolić', email: 'stefan.n@imd.rs', uloga: 'doktor', status: 'aktivan', kreiran: '17.03.2024' },
  { id: 'k7', ime: 'Marija Ilić', email: 'marija.ilic@op.rs', uloga: 'op-korisnik', status: 'aktivan', kreiran: '28.04.2026' },
];

const OBJAVLJENE_STATISTIKE = [
  { id: 's1', naslov: 'Pregledi po opštinama — Q1 2026', period: '01.01 — 31.03.2026', kategorija: 'Zdravstvo', preuzimanja: 2847, datum: '05.04.2026', status: 'objavljen' },
  { id: 's2', naslov: 'Najčešće dijagnoze 2025', period: '01.01 — 31.12.2025', kategorija: 'Zdravstvo', preuzimanja: 8214, datum: '15.01.2026', status: 'objavljen' },
  { id: 's3', naslov: 'Vakcinacija po starosnim grupama', period: '01.01 — 31.12.2025', kategorija: 'Zdravstvo', preuzimanja: 4651, datum: '02.02.2026', status: 'objavljen' },
  { id: 's4', naslov: 'Specijalizacije — broj pregleda', period: '01.10 — 31.12.2025', kategorija: 'Zdravstvo', preuzimanja: 1923, datum: '11.01.2026', status: 'objavljen' },
];

const DATASETOVI = [
  { id: 'ds1', naslov: 'Pregledi po opštinama — Q1 2026', kategorija: 'Pregledi', opis: 'Anonimizovani agregat pregleda po lokaciji i specijalizaciji. Generisano iz sistema eUprava — Zdravstvo.', datum: '05.04.2026', preuzimanja: 2847, opstina: 'Sve', godina: 2026, izvor: 'MZ RS', formati: ['CSV','JSON','XML'], status: 'objavljen' },
  { id: 'ds2', naslov: 'Najčešće dijagnoze (MKB-10) 2025', kategorija: 'Dijagnoze', opis: 'Top 100 dijagnoza po MKB-10 klasifikaciji za period 2025. Bez ličnih podataka.', datum: '15.01.2026', preuzimanja: 8214, opstina: 'Sve', godina: 2025, izvor: 'MZ RS', formati: ['CSV','JSON'], status: 'objavljen' },
  { id: 'ds3', naslov: 'Vakcinacija po starosnim grupama', kategorija: 'Vakcinacija', opis: 'Pokrivenost vakcinacije po starosnim grupama i tipu vakcine.', datum: '02.02.2026', preuzimanja: 4651, opstina: 'Sve', godina: 2025, izvor: 'IZJZ Batut', formati: ['CSV','JSON'], status: 'objavljen' },
  { id: 'ds4', naslov: 'Bolničko lečenje — broj ležajeva i hospitalizacija', kategorija: 'Bolnice', opis: 'Statistika bolničkog lečenja po ustanovama, broj ležajeva, hospitalizacija i dužina boravka.', datum: '01.05.2026', preuzimanja: 3621, opstina: 'Sve', godina: 2026, izvor: 'IZJZ Batut', formati: ['CSV','JSON','XML'], status: 'objavljen' },
  { id: 'ds5', naslov: 'Apoteke — izdati recepti po grupama lekova', kategorija: 'Apoteke', opis: 'Mesečna statistika izdatih recepata po ATC klasifikaciji lekova.', datum: '08.05.2026', preuzimanja: 2198, opstina: 'Sve', godina: 2026, izvor: 'RFZO', formati: ['CSV','JSON'], status: 'objavljen' },
  { id: 'ds6', naslov: 'Mentalno zdravlje — pregledi i hospitalizacije', kategorija: 'Mentalno zdravlje', opis: 'Anonimizovani podaci o pregledima i hospitalizacijama u oblasti mentalnog zdravlja.', datum: '20.04.2026', preuzimanja: 1842, opstina: 'Sve', godina: 2026, izvor: 'IZJZ Batut', formati: ['CSV','JSON','XML'], status: 'objavljen' },
  { id: 'ds7', naslov: 'Smrtnost po uzrocima — MKB-10', kategorija: 'Statistika', opis: 'Statistika smrtnosti po uzrocima prema MKB-10 klasifikaciji, godišnje.', datum: '15.03.2026', preuzimanja: 5872, opstina: 'Sve', godina: 2025, izvor: 'RZS', formati: ['CSV','JSON'], status: 'objavljen' },
  { id: 'ds8', naslov: 'Hronične bolesti — registar pacijenata (agregat)', kategorija: 'Dijagnoze', opis: 'Broj evidentiranih pacijenata sa hroničnim bolestima po opštini i starosnoj grupi.', datum: '14.04.2026', preuzimanja: 4198, opstina: 'Sve', godina: 2025, izvor: 'IZJZ Batut', formati: ['CSV','JSON','XML'], status: 'objavljen' },
  { id: 'ds9', naslov: 'Hitna medicinska pomoć — intervencije po opštinama', kategorija: 'Hitna pomoć', opis: 'Broj intervencija HMP po opštini, vrsti hitnog stanja i prosečnom vremenu odziva.', datum: '03.03.2026', preuzimanja: 1452, opstina: 'Sve', godina: 2026, izvor: 'MZ RS', formati: ['CSV'], status: 'nacrt' },
];

const DATASET_NACRTI = [
  { id: 'dn1', naslov: 'Skrining karcinoma dojke — rezultati 2025', kategorija: 'Statistika', podnosilac: 'IZJZ Batut', datum: '05.05.2026', velicina: '2.4 MB' },
  { id: 'dn2', naslov: 'Stomatološke usluge — pregledi i intervencije', kategorija: 'Pregledi', podnosilac: 'RFZO', datum: '02.05.2026', velicina: '8.1 MB' },
  { id: 'dn3', naslov: 'Donirana krv i transfuzije po centrima', kategorija: 'Bolnice', podnosilac: 'Institut za transfuziju krvi', datum: '28.04.2026', velicina: '6.2 MB' },
];

const KATEGORIJE_OP = ['Sve','Pregledi','Dijagnoze','Vakcinacija','Bolnice','Apoteke','Mentalno zdravlje','Hitna pomoć','Statistika'];
const OPSTINE = ['Sve','Beograd','Novi Sad','Niš','Kragujevac','Subotica','Čačak','Pančevo','Užice','Zrenjanin','Leskovac'];
const GODINE_OP = ['Sve','2026','2025','2024','2023','2022'];

// Helper data for charts
const TREND_PREUZIMANJA = [
  { m: 'Jan', v: 12450 }, { m: 'Feb', v: 14820 }, { m: 'Mar', v: 13905 },
  { m: 'Apr', v: 17234 }, { m: 'Maj', v: 19842 }, { m: 'Jun', v: 18560 },
  { m: 'Jul', v: 16730 }, { m: 'Avg', v: 15120 }, { m: 'Sep', v: 21340 },
  { m: 'Okt', v: 24856 }, { m: 'Nov', v: 23110 }, { m: 'Dec', v: 26420 },
];

const PREUZIMANJA_OPSTINE = [
  { o: 'Beograd', v: 41284 },
  { o: 'Novi Sad', v: 18420 },
  { o: 'Niš', v: 11250 },
  { o: 'Kragujevac', v: 7840 },
  { o: 'Subotica', v: 4920 },
  { o: 'Pančevo', v: 3650 },
  { o: 'Čačak', v: 2810 },
];

const KATEGORIJE_RASPODELA = [
  { k: 'Pregledi', v: 28, c: '#1e3a8a' },
  { k: 'Dijagnoze', v: 22, c: '#0d4f3c' },
  { k: 'Vakcinacija', v: 14, c: '#b45309' },
  { k: 'Bolnice', v: 12, c: '#0369a1' },
  { k: 'Apoteke', v: 10, c: '#7c2d12' },
  { k: 'Statistika', v: 8, c: '#3f3f46' },
  { k: 'Ostalo', v: 6, c: '#5a6478' },
];

const TOP_DATASETOVI = [
  { n: 'Najčešće dijagnoze (MKB-10) 2025', v: 8214 },
  { n: 'Smrtnost po uzrocima — MKB-10', v: 5872 },
  { n: 'Vakcinacija po starosnim grupama', v: 4651 },
  { n: 'Hronične bolesti — registar pacijenata', v: 4198 },
  { n: 'Bolničko lečenje — ležajevi i hospitalizacije', v: 3621 },
  { n: 'Pregledi po opštinama — Q1 2026', v: 2847 },
  { n: 'Apoteke — izdati recepti', v: 2198 },
  { n: 'Mentalno zdravlje — pregledi', v: 1842 },
  { n: 'Hitna medicinska pomoć — intervencije', v: 1452 },
  { n: 'Stomatološke usluge', v: 982 },
];

// Helpers
function formatBroj(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function findSpec(id) { return SPECIJALIZACIJE.find(s => s.id === id); }
function findDoktor(id) { return DOKTORI.find(d => d.id === id); }

Object.assign(window, {
  SPECIJALIZACIJE, DOKTORI, MKB_KODOVI, PACIJENTI_MOCK, PREGLEDI_PACIJENT,
  MOJE_DIJAGNOZE, ALERGIJE, DOKTOR_PREGLEDI_DANAS, KORISNICI_ADMIN,
  OBJAVLJENE_STATISTIKE, DATASETOVI, DATASET_NACRTI, KATEGORIJE_OP, OPSTINE, GODINE_OP,
  TREND_PREUZIMANJA, PREUZIMANJA_OPSTINE, KATEGORIJE_RASPODELA, TOP_DATASETOVI,
  formatBroj, findSpec, findDoktor,
});
