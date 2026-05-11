# eUprava — Zdravstvo i Otvoreni Podaci

Fakultetski projekat iz predmeta **eUprava**: dva Spring Boot mikroservisa koji međusobno komuniciraju + React frontend prototip. Sistem omogućava upravljanje zdravstvenim podacima i njihovo anonimizovano objavljivanje na portalu otvorenih podataka.

## Arhitektura

```
┌─────────────────────┐    POST /api/dataset/import     ┌──────────────────────┐
│   ZDRAVSTVO         │  ─────────────────────────────> │   OTVORENI PODACI    │
│   :8080             │   (X-Api-Key, anonimizovano)    │   :8081              │
│                     │                                 │                      │
│   Postgres :5433    │                                 │   Postgres :5434     │
└─────────────────────┘                                 └──────────────────────┘
         ▲                                                       ▲
         │  JWT (Bearer)                              JWT + javni endpointi
         └──────────────────────┐         ┌──────────────────────┘
                                ▼         ▼
                       ┌────────────────────────┐
                       │  Frontend (React 18)   │
                       │  :5500 (file:// OK)    │
                       └────────────────────────┘
```

## Tehnologije

- **Java 21** (LTS), Spring Boot 3.2.5
- Spring Security 6 + **JWT** (jjwt 0.12.5, HS256)
- Spring Data JPA + Hibernate, **PostgreSQL 15** (zasebna baza po servisu)
- **MapStruct** za DTO mapiranje, Lombok za boilerplate
- **springdoc-openapi 2.5** za Swagger UI
- **RestClient** (Spring 6.1) za inter-service komunikaciju
- **Docker + Docker Compose** (multi-stage build, healthcheck-gated startup)
- **React 18** preko Babel-from-CDN (bez Node build-a, čisti `<script type="text/babel">`)

## Pokretanje od nule

```bash
git clone <url>
cd eUprava
docker compose up --build -d
```

Prvi build traje 3–5 minuta (Maven dependencies). Posle:

```
Zdravstvo API:        http://localhost:8080
Swagger Zdravstvo:    http://localhost:8080/swagger-ui.html
Otvoreni Podaci API:  http://localhost:8081
Swagger OP:           http://localhost:8081/swagger-ui.html

Frontend (statički):  cd frontend && python -m http.server 5500
                      → http://localhost:5500/
```

Health check: `GET /actuator/health` na oba servisa.

## Demo nalozi (lozinka: `demo1234`)

| Email | Servis | Uloga |
|---|---|---|
| `admin@euprava.gov.rs` | Zdravstvo | ADMIN |
| `marko.petrovic@kcs.rs` | Zdravstvo | DOKTOR |
| `jovan.markovic@example.rs` | Zdravstvo | PACIJENT |
| `admin.op@euprava.gov.rs` | OP | ADMIN_OP |
| `marija.ilic@op.rs` | OP | KORISNIK_OP |

Lozinke su BCrypt-ovane (`$2a$10$…`, cost 10). U dev/docker profilu, `PasswordSeedRunner` BCrypt-uje placeholder hash-eve iz `data.sql` na svakom startu — `demo1234` se nigde ne čuva u plain tekstu.

## Endpoint inventar

### Zdravstvo (`:8080/api`)
- `POST /auth/login`, `POST /auth/register` (PACIJENT self-service)
- `GET /specijalizacije`, `/bolnice`, `/mkb` (šifarnici)
- `GET /pacijenti` (paged, filteri jmbg/q/grad), `/me`, `/{id}`; `POST/PUT/DELETE` (ADMIN)
- `GET /doktori` (paged, filteri specijalizacija/bolnica/q); `POST/PUT/DELETE` (ADMIN)
- `GET /pregledi` (paged), `/moji`, `/{id}`, `/dostupni-termini?doktorId=&datum=`
- `POST /pregledi` i `POST /pregledi/zakazi` (strožija validacija)
- `PATCH /pregledi/{id}/status`, `DELETE /pregledi/{id}`
- `GET /karton/{pacijentId}`, `POST /karton/{id}/dijagnoza`, `/alergija`
- `GET /izvestaji/generisi?period=&format=` (JSON/CSV)
- `POST /statistika/objavi?tip=&period=` → preko `RestClient`-a šalje na OP
- `GET /stats` — agregatne brojke za dashboard

### Otvoreni Podaci (`:8081/api`)
- `POST /auth/login`, `POST /auth/register` (KORISNIK_OP)
- `GET /kategorije`, `/izvori`, `/stats` (sve **public**)
- `GET /dataset/pretraga` (paged, filteri kategorija/godina/q/status)
- `GET /dataset/{id}` (public, samo OBJAVLJEN; ADMIN_OP vidi NACRT)
- `POST/PUT/DELETE /dataset/{id}` (ADMIN_OP)
- `GET /dataset/{id}/grafikon` — Chart.js JSON
- `GET /dataset/{id}/export?format=csv|json` — file download
- `POST /dataset/{id}/preuzmi?format=` — counter + Preuzimanje log
- `POST /dataset/import` — **X-Api-Key gated** prijem iz Zdravstva

## Sigurnosni model

- **Per-service JWT**: svaki servis potpisuje svoje tokene (HS256, 24h, `euprava.jwt.secret`). Frontend drži oba: `localStorage.auth_zdravstvo` i `auth_op`.
- **Role mapping**: `Uloga` enum → `ROLE_*` authority u `CustomUserDetailsService` → `@PreAuthorize("hasRole('X')")` na controller-u.
- **Vlasnik kartona** (`pacijentSecurity.jeVlasnikKartona`) — SpEL helper, PACIJENT vidi samo svoj karton.
- **API ključ** za inter-service: `euprava.import.api-key` (`demo-shared-api-key-between-services`). Validacija u OP `SkupController.importuj` preko `@RequestHeader("X-Api-Key")`.
- **Anonimizacija**: pre slanja u OP, `StatistikaService` agregira po opštini × specijalizaciji ili po MKB — bez JMBG, imena, adrese.

## Struktura projekta

```
eUprava/
├── zdravstvo/                      # Spring Boot servis
│   ├── src/main/java/com/euprava/zdravstvo/
│   │   ├── config/                 # SecurityConfig, OpenApiConfig, PasswordSeedRunner
│   │   ├── controller/             # 11 REST kontrolera
│   │   ├── service/                # Auth, Pacijent, Doktor, Pregled, Karton, Izvestaj, Statistika
│   │   ├── repository/             # Spring Data JPA
│   │   ├── model/                  # 12 JPA entiteta + 2 enuma
│   │   ├── dto/                    # records (request/response)
│   │   ├── mapper/                 # MapStruct mapperi
│   │   ├── client/                 # OtvoreniPodaciClient (RestClient)
│   │   ├── security/               # JwtService, JwtAuthenticationFilter, CustomUserDetailsService
│   │   └── exception/              # GlobalExceptionHandler + custom exceptions
│   ├── src/main/resources/         # application.yml, data.sql
│   ├── Dockerfile                  # multi-stage temurin-21
│   └── pom.xml
├── otvoreni-podaci/                # Spring Boot servis (parallel struktura)
├── frontend/                       # React 18, Babel-from-CDN
│   ├── api.jsx                     # HTTP klijent + token store
│   ├── components.jsx, charts.jsx  # shared UI
│   ├── pages-auth.jsx              # Login + Register
│   ├── pages-health.jsx            # Pacijent / Doktor / Admin ekrani
│   ├── pages-opendata.jsx          # OP javni katalog + admin CRUD
│   ├── app.jsx                     # rooting, role-based sidebar
│   └── index.html
├── docker-compose.yml              # 4 servisa: 2 PG + 2 Spring
└── postman/eUprava.postman_collection.json
```

## Brzi demo flow

1. Otvori `http://localhost:5500/` → klikni "Otvoreni Podaci (javno)" → katalog se učitava sa `:8081/api/dataset/pretraga`
2. Klikni neki dataset → modal sa **grafikon** + dugmad za **CSV/JSON download**
3. Vrati se → "Prijava" → izaberi **Admin (Zdravstvo)** → `admin@euprava.gov.rs` / `demo1234`
4. Sidebar → **Objavi statistiku** → tip "Pregledi po opštinama × specijalizaciji" → Pošalji
5. Toast: "Objavljeno · Skup #N"
6. Otvori javni OP katalog (anoniman) → vidi novi skup sa pravim agregiranim brojevima iz Zdravstva

## Šta je namerno izvan opsega FAZE 7

- PDF format izveštaja (zahteva OpenPDF dependency; samo CSV+JSON)
- Edit termina pregleda (postoji samo otkaz preko `PATCH /status`)
- Profil edit (backend ima `PUT /pacijenti/{id}`, ne wirovan u UI)
- Pretplate, API ključ za korisnika, 2FA, notifikacije — sklonjeno iz UI-ja kao demo dekoracija

## Reset baze

```bash
docker compose down -v        # briše volume-ove
docker compose up --build -d  # ponovo seed-uje data.sql
```

## Autori

Projekat iz predmeta eUprava — fakultetski rad. Frontend dizajn importovan iz Claude artifacts handoff bundle-a.
