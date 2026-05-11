package com.euprava.zdravstvo.service;

import com.euprava.zdravstvo.dto.DoktorCreateDTO;
import com.euprava.zdravstvo.dto.DoktorDTO;
import com.euprava.zdravstvo.dto.DoktorUpdateDTO;
import com.euprava.zdravstvo.exception.ConflictException;
import com.euprava.zdravstvo.exception.NotFoundException;
import com.euprava.zdravstvo.mapper.DoktorMapper;
import com.euprava.zdravstvo.model.Bolnica;
import com.euprava.zdravstvo.model.Doktor;
import com.euprava.zdravstvo.model.Korisnik;
import com.euprava.zdravstvo.model.Specijalizacija;
import com.euprava.zdravstvo.model.Uloga;
import com.euprava.zdravstvo.repository.BolnicaRepository;
import com.euprava.zdravstvo.repository.DijagnozaRepository;
import com.euprava.zdravstvo.repository.DoktorRepository;
import com.euprava.zdravstvo.repository.KorisnikRepository;
import com.euprava.zdravstvo.repository.PregledRepository;
import com.euprava.zdravstvo.repository.SpecijalizacijaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DoktorService {

    private final DoktorRepository doktori;
    private final KorisnikRepository korisnici;
    private final SpecijalizacijaRepository specijalizacije;
    private final BolnicaRepository bolnice;
    private final PregledRepository pregledi;
    private final DijagnozaRepository dijagnoze;
    private final PasswordEncoder encoder;
    private final DoktorMapper mapper;

    @Transactional(readOnly = true)
    public Page<DoktorDTO> pretraga(String specijalizacija, String bolnica, String q, Pageable pageable) {
        return doktori.pretraga(blank(specijalizacija), blank(bolnica), blank(q), pageable)
                .map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public DoktorDTO get(Long id) {
        return mapper.toDto(naci(id));
    }

    @Transactional(readOnly = true)
    public DoktorDTO byEmail(String email) {
        Doktor d = doktori.findByKorisnik_Email(email)
                .orElseThrow(() -> new NotFoundException("Doktor nije pronađen za email: " + email));
        return mapper.toDto(d);
    }

    @Transactional
    public DoktorDTO updateByEmail(String email, DoktorUpdateDTO req) {
        Doktor d = doktori.findByKorisnik_Email(email)
                .orElseThrow(() -> new NotFoundException("Doktor nije pronađen za email: " + email));
        return update(d.getId(), req);
    }

    @Transactional
    public DoktorDTO create(DoktorCreateDTO req) {
        if (korisnici.existsByEmail(req.email())) {
            throw new ConflictException("Email već postoji: " + req.email());
        }
        Specijalizacija s = specijalizacije.findById(req.specijalizacijaSifra())
                .orElseThrow(() -> new NotFoundException("Specijalizacija nije pronađena: " + req.specijalizacijaSifra()));
        Bolnica b = bolnice.findById(req.bolnicaSifra())
                .orElseThrow(() -> new NotFoundException("Bolnica nije pronađena: " + req.bolnicaSifra()));

        Korisnik k = korisnici.save(Korisnik.builder()
                .email(req.email())
                .lozinka(encoder.encode(req.lozinka()))
                .ime(req.ime())
                .prezime(req.prezime())
                .uloga(Uloga.DOKTOR)
                .aktivan(true)
                .kreiran(LocalDateTime.now())
                .build());

        Doktor d = doktori.save(Doktor.builder()
                .korisnik(k)
                .specijalizacija(s)
                .bolnica(b)
                .build());
        return mapper.toDto(d);
    }

    @Transactional
    public DoktorDTO update(Long id, DoktorUpdateDTO req) {
        Doktor d = naci(id);
        Korisnik k = d.getKorisnik();

        if (!k.getEmail().equalsIgnoreCase(req.email()) && korisnici.existsByEmail(req.email())) {
            throw new ConflictException("Email već postoji: " + req.email());
        }
        Specijalizacija s = specijalizacije.findById(req.specijalizacijaSifra())
                .orElseThrow(() -> new NotFoundException("Specijalizacija nije pronađena: " + req.specijalizacijaSifra()));
        Bolnica b = bolnice.findById(req.bolnicaSifra())
                .orElseThrow(() -> new NotFoundException("Bolnica nije pronađena: " + req.bolnicaSifra()));

        k.setIme(req.ime());
        k.setPrezime(req.prezime());
        k.setEmail(req.email());
        k.setAktivan(req.aktivan());
        d.setSpecijalizacija(s);
        d.setBolnica(b);
        return mapper.toDto(d);
    }

    @Transactional
    public void delete(Long id) {
        Doktor d = naci(id);
        // Brisanje zavisnih (pregledi i dijagnoze sa FK na doktor_id).
        pregledi.deleteAll(pregledi.findByDoktor_Id(id));
        dijagnoze.deleteAll(dijagnoze.findByDoktor_Id(id));
        Korisnik k = d.getKorisnik();
        doktori.delete(d);
        korisnici.delete(k);
    }

    private Doktor naci(Long id) {
        return doktori.findById(id)
                .orElseThrow(() -> new NotFoundException("Doktor nije pronađen: " + id));
    }

    private static String blank(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
