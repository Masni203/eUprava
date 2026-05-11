package com.euprava.zdravstvo.service;

import com.euprava.zdravstvo.dto.PacijentCreateDTO;
import com.euprava.zdravstvo.dto.PacijentDTO;
import com.euprava.zdravstvo.dto.PacijentUpdateDTO;
import com.euprava.zdravstvo.exception.ConflictException;
import com.euprava.zdravstvo.exception.NotFoundException;
import com.euprava.zdravstvo.mapper.PacijentMapper;
import com.euprava.zdravstvo.model.Karton;
import com.euprava.zdravstvo.model.Korisnik;
import com.euprava.zdravstvo.model.Pacijent;
import com.euprava.zdravstvo.model.Uloga;
import com.euprava.zdravstvo.repository.AlergijaRepository;
import com.euprava.zdravstvo.repository.DijagnozaRepository;
import com.euprava.zdravstvo.repository.KartonRepository;
import com.euprava.zdravstvo.repository.KorisnikRepository;
import com.euprava.zdravstvo.repository.PacijentRepository;
import com.euprava.zdravstvo.repository.PregledRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PacijentService {

    private final PacijentRepository pacijenti;
    private final KorisnikRepository korisnici;
    private final KartonRepository kartoni;
    private final PregledRepository pregledi;
    private final AlergijaRepository alergije;
    private final DijagnozaRepository dijagnoze;
    private final PasswordEncoder encoder;
    private final PacijentMapper mapper;

    @Transactional(readOnly = true)
    public Page<PacijentDTO> filter(String jmbg, String q, String grad, Pageable pageable) {
        return pacijenti.filter(blank(jmbg), blank(q), blank(grad), pageable).map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public PacijentDTO get(Long id) {
        return mapper.toDto(naci(id));
    }

    @Transactional(readOnly = true)
    public PacijentDTO byEmail(String email) {
        Pacijent p = pacijenti.findByKorisnik_Email(email)
                .orElseThrow(() -> new NotFoundException("Pacijent nije pronađen za email: " + email));
        return mapper.toDto(p);
    }

    @Transactional
    public PacijentDTO updateByEmail(String email, PacijentUpdateDTO req) {
        Pacijent p = pacijenti.findByKorisnik_Email(email)
                .orElseThrow(() -> new NotFoundException("Pacijent nije pronađen za email: " + email));
        return update(p.getId(), req);
    }

    @Transactional
    public PacijentDTO create(PacijentCreateDTO req) {
        if (korisnici.existsByEmail(req.email())) {
            throw new ConflictException("Email već postoji: " + req.email());
        }
        if (pacijenti.findByJmbg(req.jmbg()).isPresent()) {
            throw new ConflictException("JMBG već postoji: " + req.jmbg());
        }
        Korisnik k = korisnici.save(Korisnik.builder()
                .email(req.email())
                .lozinka(encoder.encode(req.lozinka()))
                .ime(req.ime())
                .prezime(req.prezime())
                .uloga(Uloga.PACIJENT)
                .aktivan(true)
                .kreiran(LocalDateTime.now())
                .build());
        Pacijent p = pacijenti.save(Pacijent.builder()
                .korisnik(k)
                .jmbg(req.jmbg())
                .datumRodjenja(req.datumRodjenja())
                .grad(req.grad())
                .telefon(req.telefon())
                .build());
        kartoni.save(Karton.builder().pacijent(p).build());
        return mapper.toDto(p);
    }

    @Transactional
    public PacijentDTO update(Long id, PacijentUpdateDTO req) {
        Pacijent p = naci(id);
        Korisnik k = p.getKorisnik();

        if (!k.getEmail().equalsIgnoreCase(req.email()) && korisnici.existsByEmail(req.email())) {
            throw new ConflictException("Email već postoji: " + req.email());
        }
        if (!p.getJmbg().equals(req.jmbg())) {
            pacijenti.findByJmbg(req.jmbg()).ifPresent(other -> {
                throw new ConflictException("JMBG već postoji: " + req.jmbg());
            });
        }
        k.setIme(req.ime());
        k.setPrezime(req.prezime());
        k.setEmail(req.email());
        k.setAktivan(req.aktivan());
        p.setJmbg(req.jmbg());
        p.setDatumRodjenja(req.datumRodjenja());
        p.setGrad(req.grad());
        p.setTelefon(req.telefon());
        return mapper.toDto(p);
    }

    @Transactional
    public void delete(Long id) {
        Pacijent p = naci(id);
        // Brisanje zavisnih entiteta pre samog pacijenta (Postgres FK constraints).
        pregledi.deleteAll(pregledi.findByPacijent_Id(id));
        alergije.deleteAll(alergije.findAllByPacijent_Id(id));
        kartoni.findByPacijent_Id(id).ifPresent(k -> {
            dijagnoze.deleteAll(dijagnoze.findAllByKarton_Id(k.getId()));
            kartoni.delete(k);
        });
        Korisnik korisnik = p.getKorisnik();
        pacijenti.delete(p);
        korisnici.delete(korisnik);
    }

    private Pacijent naci(Long id) {
        return pacijenti.findById(id)
                .orElseThrow(() -> new NotFoundException("Pacijent nije pronađen: " + id));
    }

    private static String blank(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
