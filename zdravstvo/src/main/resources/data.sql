-- ===========================================
-- Seed za Zdravstvo servis
-- Podaci preuzeti iz frontend/mockdata.jsx
-- Lozinka za sve demo korisnike: "demo1234" (BCrypt hash placeholder; FAZA 3 ce postaviti pravu vrednost)
-- ===========================================

-- ----- Specijalizacije -----
INSERT INTO specijalizacija (sifra, naziv) VALUES
  ('opsta',  'Opšta praksa'),
  ('kardio', 'Kardiologija'),
  ('pedi',   'Pedijatrija'),
  ('neuro',  'Neurologija'),
  ('derma',  'Dermatologija'),
  ('ortop',  'Ortopedija')
ON CONFLICT (sifra) DO NOTHING;

-- ----- Bolnice -----
INSERT INTO bolnica (sifra, naziv, grad) VALUES
  ('KCS', 'Klinički centar Srbije',     'Beograd'),
  ('KCV', 'Klinički centar Vojvodine',  'Novi Sad'),
  ('IMD', 'Institut za majku i dete',   'Beograd'),
  ('DZN', 'Dom zdravlja Niš',           'Niš'),
  ('OBK', 'Opšta bolnica Kragujevac',   'Kragujevac'),
  ('DZS', 'Dom zdravlja Subotica',      'Subotica'),
  ('ID',  'Institut Dedinje',           'Beograd')
ON CONFLICT (sifra) DO NOTHING;

-- ----- MKB-10 kodovi -----
INSERT INTO mkb_kod (sifra, naziv) VALUES
  ('J06.9', 'Akutna infekcija gornjih disajnih puteva'),
  ('I10',   'Esencijalna (primarna) hipertenzija'),
  ('E11.9', 'Diabetes mellitus tip 2 bez komplikacija'),
  ('M54.5', 'Bol u donjem delu leđa'),
  ('K29.7', 'Gastritis, neoznačen'),
  ('R51',   'Glavobolja'),
  ('F32.9', 'Depresivna epizoda, neoznačena'),
  ('J45.9', 'Astma, neoznačena'),
  ('L20.9', 'Atopijski dermatitis, neoznačen'),
  ('N39.0', 'Infekcija mokraćnih puteva'),
  ('H10.9', 'Konjunktivitis, neoznačen'),
  ('B34.9', 'Virusna infekcija, neoznačena')
ON CONFLICT (sifra) DO NOTHING;

-- ----- Korisnici (1 admin + 8 doktora + 6 pacijenata) -----
-- BCrypt hash sluzi kao placeholder; FAZA 3 ce ga zameniti.
INSERT INTO korisnik (id, email, lozinka, ime, prezime, uloga, aktivan, kreiran) VALUES
  (1,  'admin@euprava.gov.rs',     '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Admin',      'Sistem',         'ADMIN',    TRUE, '2024-01-01 09:00:00'),
  (2,  'marko.petrovic@kcs.rs',    '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Marko',      'Petrović',       'DOKTOR',   TRUE, '2024-09-11 09:00:00'),
  (3,  'ana.jovanovic@kcs.rs',     '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Ana',        'Jovanović',      'DOKTOR',   TRUE, '2025-02-03 09:00:00'),
  (4,  'stefan.nikolic@imd.rs',    '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Stefan',     'Nikolić',        'DOKTOR',   TRUE, '2024-03-17 09:00:00'),
  (5,  'milica.kovacevic@kcv.rs',  '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Milica',     'Kovačević',      'DOKTOR',   TRUE, '2025-01-12 09:00:00'),
  (6,  'nikola.djordjevic@dzn.rs', '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Nikola',     'Đorđević',       'DOKTOR',   TRUE, '2025-05-20 09:00:00'),
  (7,  'jelena.stankovic@obk.rs',  '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Jelena',     'Stanković',      'DOKTOR',   TRUE, '2024-11-08 09:00:00'),
  (8,  'milos.ilic@dzs.rs',        '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Miloš',      'Ilić',           'DOKTOR',   TRUE, '2025-03-04 09:00:00'),
  (9,  'sanja.markovic@id.rs',     '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Sanja',      'Marković',       'DOKTOR',   TRUE, '2024-06-22 09:00:00'),
  (10, 'jovan.markovic@example.rs','$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Jovan',      'Marković',       'PACIJENT', TRUE, '2026-01-15 09:00:00'),
  (11, 'milena.s@example.rs',      '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Milena',     'Stojanović',     'PACIJENT', TRUE, '2025-07-22 09:00:00'),
  (12, 'dragan.v@example.rs',      '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Dragan',     'Vasiljević',     'PACIJENT', TRUE, '2025-04-10 09:00:00'),
  (13, 'tijana.p@example.rs',      '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Tijana',     'Popović',        'PACIJENT', TRUE, '2025-09-30 09:00:00'),
  (14, 'branko.l@example.rs',      '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Branko',     'Lukić',          'PACIJENT', TRUE, '2025-11-07 09:00:00'),
  (15, 'a.tomic@example.rs',       '$2a$10$placeholderHashReplaceInFaza3ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Aleksandra', 'Tomić',          'PACIJENT', TRUE, '2026-03-04 09:00:00')
ON CONFLICT (id) DO NOTHING;

-- ----- Doktori (linkovani na Korisnike 2..9) -----
INSERT INTO doktor (id, korisnik_id, specijalizacija_sifra, bolnica_sifra) VALUES
  (1, 2, 'opsta',  'KCS'),
  (2, 3, 'kardio', 'KCS'),
  (3, 4, 'pedi',   'IMD'),
  (4, 5, 'neuro',  'KCV'),
  (5, 6, 'derma',  'DZN'),
  (6, 7, 'ortop',  'OBK'),
  (7, 8, 'opsta',  'DZS'),
  (8, 9, 'kardio', 'ID')
ON CONFLICT (id) DO NOTHING;

-- ----- Pacijenti (linkovani na Korisnike 10..15) -----
INSERT INTO pacijent (id, korisnik_id, jmbg, datum_rodjenja, grad, telefon) VALUES
  (1, 10, '0101990710025', '1990-01-01', 'Beograd',     '+381 60 123 4567'),
  (2, 11, '1505198575019', '1985-05-15', 'Novi Sad',    '+381 65 234 5678'),
  (3, 12, '2208196210038', '1962-08-22', 'Niš',         '+381 64 345 6789'),
  (4, 13, '3009199575024', '1995-09-30', 'Beograd',     '+381 63 456 7890'),
  (5, 14, '1107198810017', '1988-07-11', 'Kragujevac',  '+381 62 567 8901'),
  (6, 15, '0403200175036', '2001-04-03', 'Subotica',    '+381 60 678 9012')
ON CONFLICT (id) DO NOTHING;

-- ----- Karton (1:1 sa pacijentom) -----
INSERT INTO karton (id, pacijent_id) VALUES
  (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6)
ON CONFLICT (id) DO NOTHING;

-- ----- Pregledi (istorija + buduci) -----
INSERT INTO pregled (id, pacijent_id, doktor_id, datum, vreme, razlog, status) VALUES
  (1, 1, 2, '2026-05-15', '10:30', 'Kontrola krvnog pritiska',          'ZAKAZAN'),
  (2, 1, 1, '2026-04-02', '09:00', 'Akutna infekcija disajnih puteva',  'ZAVRSEN'),
  (3, 1, 1, '2026-03-18', '14:15', 'Hipertenzija — kontrola',           'ZAVRSEN'),
  (4, 1, 3, '2026-02-21', '11:00', 'Pedijatrijski pregled (otkazano)',  'OTKAZAN'),
  (5, 1, 1, '2026-01-08', '08:30', 'Glavobolja — opsti pregled',        'ZAVRSEN'),
  (6, 2, 1, '2026-05-09', '08:30', 'Kontrola krvnog pritiska',          'ZAVRSEN'),
  (7, 5, 1, '2026-05-09', '09:15', 'Bol u grudima',                     'ZAVRSEN'),
  (8, 1, 1, '2026-05-09', '10:00', 'EKG kontrola',                      'U_TOKU'),
  (9, 6, 1, '2026-05-09', '10:45', 'Prvi pregled',                      'ZAKAZAN'),
  (10,3, 1, '2026-05-09', '11:30', 'Holter rezultati',                  'ZAKAZAN'),
  (11,4, 1, '2026-05-09', '13:00', 'Konsultacija',                      'ZAKAZAN')
ON CONFLICT (id) DO NOTHING;

-- ----- Dijagnoze u kartonu pacijenta 1 (Jovan Marković) -----
INSERT INTO dijagnoza (id, karton_id, mkb_sifra, doktor_id, datum, terapija, aktivna) VALUES
  (1, 1, 'I10',   1, '2026-03-18', 'Concor 5mg, 1x dnevno',                          TRUE),
  (2, 1, 'J06.9', 1, '2026-04-02', 'Paracetamol 500mg, do 3x dnevno; tečnost',       FALSE),
  (3, 1, 'M54.5', 6, '2025-11-12', 'Diklofenak gel 1%, lokalno; kineziterapija',     FALSE)
ON CONFLICT (id) DO NOTHING;

-- ----- Alergije pacijenta 1 -----
INSERT INTO alergija (id, pacijent_id, naziv, stepen) VALUES
  (1, 1, 'Penicilin',  'visok'),
  (2, 1, 'Polen breze','srednji'),
  (3, 1, 'Lateks',     'nizak')
ON CONFLICT (id) DO NOTHING;

-- ----- Resync sequences (PostgreSQL) tako da @GeneratedValue krene od max(id)+1 -----
SELECT setval(pg_get_serial_sequence('korisnik', 'id'),  COALESCE(MAX(id), 1)) FROM korisnik;
SELECT setval(pg_get_serial_sequence('doktor',   'id'),  COALESCE(MAX(id), 1)) FROM doktor;
SELECT setval(pg_get_serial_sequence('pacijent', 'id'),  COALESCE(MAX(id), 1)) FROM pacijent;
SELECT setval(pg_get_serial_sequence('karton',   'id'),  COALESCE(MAX(id), 1)) FROM karton;
SELECT setval(pg_get_serial_sequence('pregled',  'id'),  COALESCE(MAX(id), 1)) FROM pregled;
SELECT setval(pg_get_serial_sequence('dijagnoza','id'),  COALESCE(MAX(id), 1)) FROM dijagnoza;
SELECT setval(pg_get_serial_sequence('alergija', 'id'),  COALESCE(MAX(id), 1)) FROM alergija;
