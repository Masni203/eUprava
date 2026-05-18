-- ===========================================
-- Seed za Otvoreni Podaci servis
-- Podaci preuzeti iz frontend/mockdata.jsx (DATASETOVI, KATEGORIJE_OP, izvori)
-- Lozinka za sve demo korisnike: "demo1234" (BCrypt placeholder; FAZA 3 ce postaviti pravu vrednost)
-- ===========================================

-- ----- Kategorije -----
INSERT INTO kategorija (id, naziv) VALUES
  (1, 'Pregledi'),
  (2, 'Dijagnoze'),
  (3, 'Vakcinacija'),
  (4, 'Bolnice'),
  (5, 'Apoteke'),
  (6, 'Mentalno zdravlje'),
  (7, 'Hitna pomoć'),
  (8, 'Statistika')
ON CONFLICT (id) DO NOTHING;

-- ----- Izvori -----
INSERT INTO izvor (id, naziv) VALUES
  (1, 'MZ RS'),
  (2, 'IZJZ Batut'),
  (3, 'RFZO'),
  (4, 'KCS'),
  (5, 'KCV'),
  (6, 'Institut za majku i dete'),
  (7, 'Institut za transfuziju krvi'),
  (8, 'RZS')
ON CONFLICT (id) DO NOTHING;

-- ----- Korisnici (1 admin OP + 1 korisnik OP) -----
INSERT INTO korisnik (id, email, lozinka, ime, prezime, uloga, aktivan, kreiran) VALUES
  (1, 'admin.op@euprava.gov.rs', '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Admin', 'OP',  'ADMIN_OP',    TRUE, '2024-01-01 09:00:00'),
  (2, 'marija.ilic@op.rs',       '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Marija','Ilić','KORISNIK_OP', TRUE, '2026-04-28 09:00:00')
ON CONFLICT (id) DO NOTHING;

-- ----- Skupovi podataka (datasetovi) -----
INSERT INTO skup (id, naslov, opis, kategorija_id, izvor_id, godina, opstina, datum, broj_preuzimanja, broj_redova, status, payload) VALUES
  (1, 'Pregledi po opštinama — Q1 2026',
      'Anonimizovani agregat pregleda po lokaciji i specijalizaciji. Generisano iz sistema eUprava — Zdravstvo.',
      1, 1, 2026, 'Sve', '2026-04-05', 2847, 1240, 'OBJAVLJEN', '{"tip":"agregat","kolone":["opstina","specijalizacija","broj"]}'),
  (2, 'Najčešće dijagnoze (MKB-10) 2025',
      'Top 100 dijagnoza po MKB-10 klasifikaciji za period 2025. Bez ličnih podataka.',
      2, 1, 2025, 'Sve', '2026-01-15', 8214, 100, 'OBJAVLJEN', '{"tip":"top","kolone":["mkb","naziv","broj"]}'),
  (3, 'Vakcinacija po starosnim grupama',
      'Pokrivenost vakcinacije po starosnim grupama i tipu vakcine.',
      3, 2, 2025, 'Sve', '2026-02-02', 4651, 84, 'OBJAVLJEN', '{"tip":"matrica","kolone":["starosna_grupa","tip","procenat"]}'),
  (4, 'Bolničko lečenje — broj ležajeva i hospitalizacija',
      'Statistika bolničkog lečenja po ustanovama, broj ležajeva, hospitalizacija i dužina boravka.',
      4, 2, 2026, 'Sve', '2026-05-01', 3621, 156, 'OBJAVLJEN', '{"tip":"agregat","kolone":["ustanova","lezajevi","hospitalizacije","dani"]}'),
  (5, 'Apoteke — izdati recepti po grupama lekova',
      'Mesečna statistika izdatih recepata po ATC klasifikaciji lekova.',
      5, 3, 2026, 'Sve', '2026-05-08', 2198, 312, 'OBJAVLJEN', '{"tip":"vremenski_niz","kolone":["mesec","atc","broj"]}'),
  (6, 'Mentalno zdravlje — pregledi i hospitalizacije',
      'Anonimizovani podaci o pregledima i hospitalizacijama u oblasti mentalnog zdravlja.',
      6, 2, 2026, 'Sve', '2026-04-20', 1842, 220, 'OBJAVLJEN', '{"tip":"agregat","kolone":["opstina","pregledi","hospitalizacije"]}'),
  (7, 'Smrtnost po uzrocima — MKB-10',
      'Statistika smrtnosti po uzrocima prema MKB-10 klasifikaciji, godišnje.',
      8, 8, 2025, 'Sve', '2026-03-15', 5872, 130, 'OBJAVLJEN', '{"tip":"top","kolone":["mkb","broj"]}'),
  (8, 'Hronične bolesti — registar pacijenata (agregat)',
      'Broj evidentiranih pacijenata sa hroničnim bolestima po opštini i starosnoj grupi.',
      2, 2, 2025, 'Sve', '2026-04-14', 4198, 460, 'OBJAVLJEN', '{"tip":"agregat","kolone":["opstina","starosna_grupa","broj"]}'),
  (9, 'Hitna medicinska pomoć — intervencije po opštinama',
      'Broj intervencija HMP po opštini, vrsti hitnog stanja i prosečnom vremenu odziva.',
      7, 1, 2026, 'Sve', '2026-03-03', 1452, 98, 'NACRT', '{"tip":"agregat","kolone":["opstina","tip","broj","odziv"]}')
ON CONFLICT (id) DO NOTHING;

-- ----- Formati po skupu -----
INSERT INTO skup_format (skup_id, format) VALUES
  (1,'CSV'),(1,'JSON'),(1,'XML'),
  (2,'CSV'),(2,'JSON'),
  (3,'CSV'),(3,'JSON'),
  (4,'CSV'),(4,'JSON'),(4,'XML'),
  (5,'CSV'),(5,'JSON'),
  (6,'CSV'),(6,'JSON'),(6,'XML'),
  (7,'CSV'),(7,'JSON'),
  (8,'CSV'),(8,'JSON'),(8,'XML'),
  (9,'CSV')
ON CONFLICT DO NOTHING;

-- ----- Notifikacije (demo) -----
-- korisnik_id: 1=Admin OP, 2=Marija (KORISNIK_OP)
INSERT INTO notifikacija (id, korisnik_id, tip, naslov, tekst, link_ruta, procitana, datum) VALUES
  (1, 1, 'INFO',     'Novi skup čeka odobrenje',    'Pristigao je novi skup podataka iz Zdravstva. Pregledajte i odobrite/odbijte objavu.', '/op-odobravanje', FALSE, '2026-05-17 10:15:00'),
  (2, 1, 'USPESNO',  'Skup objavljen',              'Skup "Najčešće dijagnoze (MKB-10) 2025" je uspešno objavljen u javnom katalogu.', '/katalog', TRUE,  '2026-01-15 11:00:00'),
  (3, 1, 'UPOZORENJE','Skup povučen',               'Skup "Hitna pomoć — intervencije Q1" je povučen iz kataloga i prebačen u status NACRT.', '/op-sinhronizacija', FALSE, '2026-05-16 14:22:00'),
  (4, 2, 'INFO',     'Novi skup u katalogu',        'Objavljen je novi skup "Bolničko lečenje — broj ležajeva". Pregledajte detalje i preuzmite.', '/katalog', FALSE, '2026-05-01 09:30:00'),
  (5, 2, 'USPESNO',  'Preuzimanje uspešno',         'Vaše preuzimanje skupa "Pregledi po opštinama — Q1 2026" je zabeleženo.', '/katalog', TRUE,  '2026-04-08 16:05:00')
ON CONFLICT (id) DO NOTHING;

-- ----- Resync sequences (PostgreSQL) -----
SELECT setval(pg_get_serial_sequence('korisnik',     'id'), COALESCE(MAX(id), 1)) FROM korisnik;
SELECT setval(pg_get_serial_sequence('kategorija',   'id'), COALESCE(MAX(id), 1)) FROM kategorija;
SELECT setval(pg_get_serial_sequence('izvor',        'id'), COALESCE(MAX(id), 1)) FROM izvor;
SELECT setval(pg_get_serial_sequence('skup',         'id'), COALESCE(MAX(id), 1)) FROM skup;
SELECT setval(pg_get_serial_sequence('preuzimanje',  'id'), COALESCE(MAX(id), 1)) FROM preuzimanje;
SELECT setval(pg_get_serial_sequence('notifikacija', 'id'), COALESCE(MAX(id), 1)) FROM notifikacija;
