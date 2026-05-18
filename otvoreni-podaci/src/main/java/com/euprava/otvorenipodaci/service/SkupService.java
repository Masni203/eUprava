package com.euprava.otvorenipodaci.service;

import com.euprava.otvorenipodaci.client.ZdravstvoClient;
import com.euprava.otvorenipodaci.dto.SkupCreateDTO;
import com.euprava.otvorenipodaci.dto.SkupDTO;
import com.euprava.otvorenipodaci.dto.SkupImportDTO;
import com.euprava.otvorenipodaci.dto.SkupUpdateDTO;
import com.euprava.otvorenipodaci.exception.ConflictException;
import com.euprava.otvorenipodaci.exception.NotFoundException;
import com.euprava.otvorenipodaci.mapper.SkupMapper;
import com.euprava.otvorenipodaci.model.Izvor;
import com.euprava.otvorenipodaci.model.Kategorija;
import com.euprava.otvorenipodaci.model.Korisnik;
import com.euprava.otvorenipodaci.model.Preuzimanje;
import com.euprava.otvorenipodaci.model.Skup;
import com.euprava.otvorenipodaci.model.StatusSkupa;
import com.euprava.otvorenipodaci.model.TipNotifikacije;
import com.euprava.otvorenipodaci.model.UlogaOP;
import com.euprava.otvorenipodaci.repository.IzvorRepository;
import com.euprava.otvorenipodaci.repository.KategorijaRepository;
import com.euprava.otvorenipodaci.repository.KorisnikRepository;
import com.euprava.otvorenipodaci.repository.PreuzimanjeRepository;
import com.euprava.otvorenipodaci.repository.SkupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class SkupService {

    private final SkupRepository skupovi;
    private final KategorijaRepository kategorije;
    private final IzvorRepository izvori;
    private final KorisnikRepository korisnici;
    private final PreuzimanjeRepository preuzimanja;
    private final SkupMapper mapper;
    private final NotifikacijaService notifikacije;
    private final ZdravstvoClient zdravstvo;

    @Transactional(readOnly = true)
    public Page<SkupDTO> pretraga(StatusSkupa status, String kategorija, String opstina, Integer godina, String q, String izvor, Pageable pageable) {
        return skupovi.findAll(SkupRepository.pretraga(status, kategorija, opstina, godina, q, izvor), pageable)
                .map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public SkupDTO get(Long id, boolean adminPogled) {
        Skup s = naci(id);
        if (!adminPogled && s.getStatus() != StatusSkupa.OBJAVLJEN) {
            throw new NotFoundException("Skup nije pronađen: " + id);
        }
        return mapper.toDto(s);
    }

    @Transactional
    public SkupDTO create(SkupCreateDTO req) {
        Kategorija k = kategorije.findById(req.kategorijaId())
                .orElseThrow(() -> new NotFoundException("Kategorija nije pronađena: " + req.kategorijaId()));
        Izvor i = izvori.findById(req.izvorId())
                .orElseThrow(() -> new NotFoundException("Izvor nije pronađen: " + req.izvorId()));
        Skup s = skupovi.save(Skup.builder()
                .naslov(req.naslov())
                .opis(req.opis())
                .kategorija(k)
                .izvor(i)
                .godina(req.godina())
                .opstina(req.opstina())
                .datum(req.datum())
                .brojPreuzimanja(0L)
                .brojRedova(req.brojRedova())
                .status(req.status())
                .formati(req.formati() == null ? new HashSet<>() : new HashSet<>(req.formati()))
                .payload(req.payload())
                .build());
        return mapper.toDto(s);
    }

    @Transactional
    public SkupDTO update(Long id, SkupUpdateDTO req) {
        Skup s = naci(id);
        Kategorija k = kategorije.findById(req.kategorijaId())
                .orElseThrow(() -> new NotFoundException("Kategorija nije pronađena: " + req.kategorijaId()));
        Izvor i = izvori.findById(req.izvorId())
                .orElseThrow(() -> new NotFoundException("Izvor nije pronađen: " + req.izvorId()));
        s.setNaslov(req.naslov());
        s.setOpis(req.opis());
        s.setKategorija(k);
        s.setIzvor(i);
        s.setGodina(req.godina());
        s.setOpstina(req.opstina());
        s.setDatum(req.datum());
        s.setBrojRedova(req.brojRedova());
        s.setStatus(req.status());
        s.getFormati().clear();
        if (req.formati() != null) s.getFormati().addAll(req.formati());
        s.setPayload(req.payload());
        return mapper.toDto(s);
    }

    @Transactional
    public void delete(Long id) {
        Skup s = naci(id);
        // Preuzimanja imaju FK na skup_id — moramo prvo njih obrisati.
        preuzimanja.deleteAll(preuzimanja.findBySkup_Id(s.getId()));
        skupovi.delete(s);
    }

    @Transactional
    public SkupDTO importuj(SkupImportDTO req) {
        Kategorija k = kategorije.findByNaziv(req.kategorijaNaziv())
                .orElseGet(() -> kategorije.save(Kategorija.builder().naziv(req.kategorijaNaziv()).build()));
        Izvor i = izvori.findByNaziv(req.izvorNaziv())
                .orElseGet(() -> izvori.save(Izvor.builder().naziv(req.izvorNaziv()).build()));
        Skup s = skupovi.save(Skup.builder()
                .naslov(req.naslov())
                .opis(req.opis())
                .kategorija(k)
                .izvor(i)
                .godina(req.godina())
                .opstina(req.opstina())
                .datum(req.datum())
                .brojPreuzimanja(0L)
                .brojRedova(req.brojRedova())
                .status(StatusSkupa.NA_ODOBRENJU)
                .formati(req.formati() == null ? new HashSet<>() : new HashSet<>(req.formati()))
                .payload(req.payload())
                .build());
        // Notifikacija ADMIN_OP — novi skup čeka odobrenje.
        notifikacije.pushSvima(UlogaOP.ADMIN_OP, TipNotifikacije.INFO,
                "Novi skup čeka odobrenje",
                "Stigao je skup \"" + s.getNaslov() + "\" (" + req.izvorNaziv() + ") i čeka pregled.",
                "/op-odobravanje");
        return mapper.toDto(s);
    }

    @Transactional
    public SkupDTO odobri(Long id) {
        Skup s = naci(id);
        if (s.getStatus() != StatusSkupa.NA_ODOBRENJU) {
            throw new ConflictException("Skup nije u statusu NA_ODOBRENJU: " + id);
        }
        s.setStatus(StatusSkupa.OBJAVLJEN);
        // Interna OP notifikacija za audit trag — svi admini OP-a vide odluku.
        notifikacije.pushSvima(UlogaOP.ADMIN_OP, TipNotifikacije.USPESNO,
                "Skup odobren",
                "Skup \"" + s.getNaslov() + "\" je odobren i objavljen u javnom katalogu.",
                "/katalog");
        // Razmena #4 — obavesti Zdravstvo (autor objave je tamo).
        zdravstvo.posaljiNotifikaciju(null, TipNotifikacije.USPESNO,
                "Skup objavljen na OP",
                "Vaša objava \"" + s.getNaslov() + "\" je odobrena i dostupna u javnom katalogu.",
                "/op-sinhronizacija");
        return mapper.toDto(s);
    }

    @Transactional
    public SkupDTO odbij(Long id, String razlog) {
        Skup s = naci(id);
        if (s.getStatus() != StatusSkupa.NA_ODOBRENJU) {
            throw new ConflictException("Skup nije u statusu NA_ODOBRENJU: " + id);
        }
        s.setStatus(StatusSkupa.ODBIJEN);
        String r = (razlog == null || razlog.isBlank()) ? "Bez navedenog razloga." : razlog.trim();
        notifikacije.pushSvima(UlogaOP.ADMIN_OP, TipNotifikacije.UPOZORENJE,
                "Skup odbijen",
                "Skup \"" + s.getNaslov() + "\" je odbijen. Razlog: " + r,
                "/op-odobravanje");
        zdravstvo.posaljiNotifikaciju(null, TipNotifikacije.UPOZORENJE,
                "Objava odbijena",
                "Vaša objava \"" + s.getNaslov() + "\" nije odobrena. Razlog: " + r,
                "/op-sinhronizacija");
        return mapper.toDto(s);
    }

    @Transactional
    public long preuzmi(Long id, String format, String emailIliNull) {
        Skup s = naci(id);
        if (s.getStatus() != StatusSkupa.OBJAVLJEN) {
            throw new ConflictException("Skup nije objavljen: " + id);
        }
        if (format == null || format.isBlank()) {
            throw new ConflictException("Format je obavezan");
        }
        String fmt = format.toUpperCase();
        if (!s.getFormati().contains(fmt)) {
            throw new ConflictException("Format '" + fmt + "' nije podržan za skup " + id + " (podržano: " + s.getFormati() + ")");
        }
        s.setBrojPreuzimanja(s.getBrojPreuzimanja() + 1);

        Korisnik k = (emailIliNull == null) ? null : korisnici.findByEmail(emailIliNull).orElse(null);
        preuzimanja.save(Preuzimanje.builder()
                .skup(s)
                .korisnik(k)
                .format(fmt)
                .datum(LocalDateTime.now())
                .build());
        return s.getBrojPreuzimanja();
    }

    @Transactional(readOnly = true)
    public Skup naciObjavljen(Long id) {
        Skup s = naci(id);
        if (s.getStatus() != StatusSkupa.OBJAVLJEN) {
            throw new NotFoundException("Skup nije pronađen: " + id);
        }
        return s;
    }

    private Skup naci(Long id) {
        return skupovi.findById(id)
                .orElseThrow(() -> new NotFoundException("Skup nije pronađen: " + id));
    }

    private static String blank(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
