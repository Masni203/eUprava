package com.euprava.zdravstvo.service;

import com.euprava.zdravstvo.dto.NotifikacijaDTO;
import com.euprava.zdravstvo.dto.PageResponse;
import com.euprava.zdravstvo.exception.NotFoundException;
import com.euprava.zdravstvo.model.Korisnik;
import com.euprava.zdravstvo.model.Notifikacija;
import com.euprava.zdravstvo.model.TipNotifikacije;
import com.euprava.zdravstvo.repository.KorisnikRepository;
import com.euprava.zdravstvo.repository.NotifikacijaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotifikacijaService {

    private final NotifikacijaRepository repo;
    private final KorisnikRepository korisnici;

    @Transactional(readOnly = true)
    public PageResponse<NotifikacijaDTO> mojeNotifikacije(String email, Pageable pageable) {
        Korisnik k = korisnici.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Korisnik nije pronađen: " + email));
        return PageResponse.of(repo.findAllByKorisnikIdOrderByDatumDesc(k.getId(), pageable)
                .map(this::toDto));
    }

    @Transactional(readOnly = true)
    public Map<String, Long> brojNeprocitanih(String email) {
        Korisnik k = korisnici.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Korisnik nije pronađen: " + email));
        return Map.of("neprocitano", repo.countByKorisnikIdAndProcitanaFalse(k.getId()));
    }

    @Transactional
    public NotifikacijaDTO oznaciProcitanu(String email, Long id) {
        Notifikacija n = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Notifikacija nije pronađena: " + id));
        if (!n.getKorisnik().getEmail().equalsIgnoreCase(email)) {
            throw new NotFoundException("Notifikacija nije pronađena: " + id);
        }
        n.setProcitana(true);
        return toDto(repo.save(n));
    }

    @Transactional
    public int oznaciSveProcitane(String email) {
        Korisnik k = korisnici.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Korisnik nije pronađen: " + email));
        return repo.oznaciSveProcitane(k.getId());
    }

    @Transactional
    public void obrisi(String email, Long id) {
        Notifikacija n = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Notifikacija nije pronađena: " + id));
        if (!n.getKorisnik().getEmail().equalsIgnoreCase(email)) {
            throw new NotFoundException("Notifikacija nije pronađena: " + id);
        }
        repo.delete(n);
    }

    @Transactional
    public Notifikacija push(Long korisnikId, TipNotifikacije tip, String naslov, String tekst, String linkRuta) {
        Korisnik k = korisnici.findById(korisnikId)
                .orElseThrow(() -> new NotFoundException("Korisnik nije pronađen: " + korisnikId));
        Notifikacija n = Notifikacija.builder()
                .korisnik(k)
                .tip(tip)
                .naslov(naslov)
                .tekst(tekst)
                .linkRuta(linkRuta)
                .procitana(false)
                .datum(LocalDateTime.now())
                .build();
        return repo.save(n);
    }

    @Transactional
    public Notifikacija pushNaEmail(String email, TipNotifikacije tip, String naslov, String tekst, String linkRuta) {
        Korisnik k = korisnici.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Korisnik nije pronađen: " + email));
        return push(k.getId(), tip, naslov, tekst, linkRuta);
    }

    @Transactional
    public int pushSvima(com.euprava.zdravstvo.model.Uloga uloga, TipNotifikacije tip,
                         String naslov, String tekst, String linkRuta) {
        var primaoci = korisnici.findAllByUloga(uloga);
        LocalDateTime sada = LocalDateTime.now();
        primaoci.forEach(k -> repo.save(Notifikacija.builder()
                .korisnik(k).tip(tip).naslov(naslov).tekst(tekst)
                .linkRuta(linkRuta).procitana(false).datum(sada).build()));
        return primaoci.size();
    }

    private NotifikacijaDTO toDto(Notifikacija n) {
        return new NotifikacijaDTO(n.getId(), n.getTip(), n.getNaslov(), n.getTekst(),
                n.getLinkRuta(), n.isProcitana(), n.getDatum());
    }
}
