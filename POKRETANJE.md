# Pokretanje aplikacije

Konzistentan postupak — uvek se izvršava istim redosledom, na istim portovima.

## Preduslovi (jednokratno)

- Docker Desktop pokrenut
- Python 3 na PATH-u (proveri sa `python --version`)
- Slobodni portovi: **5433, 5434, 8080, 8081, 5173**

---

## Pokretanje (5 koraka)

Otvori PowerShell i pozicioniraj se u root projekta:

```powershell
cd C:\Users\aca\Desktop\eUprava
```

### 1. Skini sve stare kontejnere i volume-e

```powershell
docker compose down -v
```

> `-v` je obavezan — briše Postgres volume da seed iz `data.sql` može da se primeni na svežu šemu (JPA `ddl-auto: update` doda nove tabele kao `notifikacija`).

### 2. Build + start oba servisa

```powershell
docker compose up --build -d
```

Sačekati ~15 sekundi dok Spring Boot ne digne oba servisa.

### 3. Provera da su backend-i zdravi

```powershell
(Invoke-WebRequest http://localhost:8080/actuator/health -UseBasicParsing).StatusCode
(Invoke-WebRequest http://localhost:8081/actuator/health -UseBasicParsing).StatusCode
```

Oba treba da vrate `200`. Ako vraćaju grešku — pričekaj još 10 sekundi i probaj opet.

### 4. Pokreni frontend (Python HTTP server na 5173)

```powershell
cd C:\Users\aca\Desktop\eUprava\frontend
python -m http.server 5173
```

Ostavi ovaj terminal otvoren — server radi dok ga ne zatvoriš sa `Ctrl+C`.

### 5. Otvori aplikaciju u browser-u

```
http://localhost:5173/
```

> Frontend mora biti na portu **5173** — Docker CORS pravila dozvoljavaju `http://localhost:*`, ali smo se dogovorili na ovaj port da bi sesije i tokeni ostali konzistentni između pokretanja.

---

## Demo nalozi (lozinka za sve: `demo1234`)

### Zdravstvo (`:8080`)

| Email                          | Uloga    |
|--------------------------------|----------|
| `admin@euprava.gov.rs`         | ADMIN    |
| `marko.petrovic@kcs.rs`        | DOKTOR   |
| `jovan.markovic@example.rs`    | PACIJENT |

### Otvoreni Podaci (`:8081`)

| Email                          | Uloga       |
|--------------------------------|-------------|
| `admin.op@euprava.gov.rs`      | ADMIN_OP    |
| `marija.ilic@op.rs`            | KORISNIK_OP |

---

## Gašenje (kad završiš)

U terminalu sa Python serverom: `Ctrl+C`.

```powershell
cd C:\Users\aca\Desktop\eUprava
docker compose down
```

> Bez `-v` — sledeći put kreni od **koraka 2** (`up --build -d`) ako želiš da zadržiš podatke koje si uneo kroz UI. Ako želiš svež seed, koristi `down -v` kao u koraku 1.

---

## Brzi smoke test (opciono)

Po pokretanju, ovaj jedan-liner u PowerShell-u potvrđuje da inter-service razmena #4 radi:

```powershell
$zd = (Invoke-RestMethod -Uri http://localhost:8080/api/auth/login -Method POST -ContentType 'application/json' -Body (@{email='admin@euprava.gov.rs';lozinka='demo1234'} | ConvertTo-Json)).token
$op = (Invoke-RestMethod -Uri http://localhost:8081/api/auth/login -Method POST -ContentType 'application/json' -Body (@{email='admin.op@euprava.gov.rs';lozinka='demo1234'} | ConvertTo-Json)).token
$pub = Invoke-RestMethod -Uri 'http://localhost:8080/api/statistika/objavi?tip=top&period=mesec' -Method POST -Headers @{Authorization=('Bearer ' + $zd)}
$id = (Invoke-RestMethod -Uri 'http://localhost:8081/api/dataset/pretraga?status=NA_ODOBRENJU&size=1' -Headers @{Authorization=('Bearer ' + $op)}).content[0].id
Invoke-RestMethod -Uri ('http://localhost:8081/api/dataset/' + $id + '/odobri') -Method POST -Headers @{Authorization=('Bearer ' + $op)} | Out-Null
Start-Sleep -Seconds 2
(Invoke-RestMethod -Uri 'http://localhost:8080/api/notifikacije/broj-neprocitanih' -Headers @{Authorization=('Bearer ' + $zd)}).neprocitano
```

Treba da odštampa broj (npr `2`) — to znači da je Zd admin dobio in-app notifikaciju "Skup objavljen na OP".

---

## Troubleshooting

| Simptom | Rešenje |
|---------|---------|
| `ERR_CONNECTION_REFUSED` na `.jsx` fajlove | Python server pao — vrati se u korak 4 |
| `403 Forbidden` na `/api/dataset/{id}/odobri` | Ulogovan si kao Zd admin pa si prešao na OP — odjavi se i prijavi kao `admin.op@euprava.gov.rs` |
| Bell pokazuje "2 h" za skoro stiglu notifikaciju | Hard refresh (`Ctrl+F5`) — Babel nije pokupio najnoviji `components.jsx` |
| Port 5173 zauzet | `Get-NetTCPConnection -LocalPort 5173` pa `Stop-Process -Id <pid>` |
| `docker compose up` zaglavi na `Waiting` | Postgres healthcheck nije prošao — `docker compose logs zdravstvo-db op-db` |
