package com.euprava.zdravstvo.service;

import com.euprava.zdravstvo.dto.AlergijaCreateDTO;
import com.euprava.zdravstvo.dto.AlergijaDTO;
import com.euprava.zdravstvo.dto.DijagnozaCreateDTO;
import com.euprava.zdravstvo.dto.DijagnozaDTO;
import com.euprava.zdravstvo.dto.KartonDTO;
import com.euprava.zdravstvo.exception.NotFoundException;
import com.euprava.zdravstvo.mapper.KartonMapper;
import com.euprava.zdravstvo.model.Alergija;
import com.euprava.zdravstvo.model.Dijagnoza;
import com.euprava.zdravstvo.model.Doktor;
import com.euprava.zdravstvo.model.Karton;
import com.euprava.zdravstvo.model.MkbKod;
import com.euprava.zdravstvo.model.Pacijent;
import com.euprava.zdravstvo.repository.AlergijaRepository;
import com.euprava.zdravstvo.repository.DijagnozaRepository;
import com.euprava.zdravstvo.repository.DoktorRepository;
import com.euprava.zdravstvo.repository.KartonRepository;
import com.euprava.zdravstvo.repository.MkbKodRepository;
import com.euprava.zdravstvo.repository.PacijentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class KartonService {

    private final KartonRepository kartoni;
    private final PacijentRepository pacijenti;
    private final DoktorRepository doktori;
    private final MkbKodRepository mkb;
    private final DijagnozaRepository dijagnoze;
    private final AlergijaRepository alergije;
    private final KartonMapper mapper;

    @Transactional(readOnly = true)
    public KartonDTO zaPacijenta(Long pacijentId) {
        Pacijent p = pacijenti.findById(pacijentId)
                .orElseThrow(() -> new NotFoundException("Pacijent nije pronađen: " + pacijentId));
        Karton k = kartoni.findByPacijent_Id(pacijentId)
                .orElseThrow(() -> new NotFoundException("Karton ne postoji za pacijenta: " + pacijentId));
        return new KartonDTO(
                k.getId(),
                p.getId(),
                p.getKorisnik().getIme(),
                p.getKorisnik().getPrezime(),
                p.getJmbg(),
                mapper.toDijagnozaDtos(dijagnoze.findAllByKarton_Id(k.getId())),
                mapper.toAlergijaDtos(alergije.findAllByPacijent_Id(p.getId()))
        );
    }

    @Transactional
    public DijagnozaDTO dodajDijagnozu(Long pacijentId, DijagnozaCreateDTO req) {
        Karton karton = kartoni.findByPacijent_Id(pacijentId)
                .orElseThrow(() -> new NotFoundException("Karton ne postoji za pacijenta: " + pacijentId));
        MkbKod kod = mkb.findById(req.mkbSifra())
                .orElseThrow(() -> new NotFoundException("MKB kod nije pronađen: " + req.mkbSifra()));
        Doktor doktor = doktori.findById(req.doktorId())
                .orElseThrow(() -> new NotFoundException("Doktor nije pronađen: " + req.doktorId()));
        Dijagnoza d = dijagnoze.save(Dijagnoza.builder()
                .karton(karton)
                .mkbKod(kod)
                .doktor(doktor)
                .datum(req.datum())
                .terapija(req.terapija())
                .aktivna(req.aktivna())
                .build());
        return mapper.toDto(d);
    }

    @Transactional
    public void obrisiDijagnozu(Long dijagnozaId) {
        Dijagnoza d = dijagnoze.findById(dijagnozaId)
                .orElseThrow(() -> new NotFoundException("Dijagnoza nije pronađena: " + dijagnozaId));
        dijagnoze.delete(d);
    }

    @Transactional
    public AlergijaDTO dodajAlergiju(Long pacijentId, AlergijaCreateDTO req) {
        Pacijent pacijent = pacijenti.findById(pacijentId)
                .orElseThrow(() -> new NotFoundException("Pacijent nije pronađen: " + pacijentId));
        Alergija a = alergije.save(Alergija.builder()
                .pacijent(pacijent)
                .naziv(req.naziv())
                .stepen(req.stepen())
                .build());
        return mapper.toDto(a);
    }

    @Transactional
    public void obrisiAlergiju(Long alergijaId) {
        Alergija a = alergije.findById(alergijaId)
                .orElseThrow(() -> new NotFoundException("Alergija nije pronađena: " + alergijaId));
        alergije.delete(a);
    }
}
