package com.euprava.zdravstvo.service;

import com.euprava.zdravstvo.dto.DostupniTerminiDTO;
import com.euprava.zdravstvo.dto.PregledCreateDTO;
import com.euprava.zdravstvo.dto.PregledDTO;
import com.euprava.zdravstvo.dto.PregledStatusDTO;
import com.euprava.zdravstvo.dto.PregledUpdateDTO;
import com.euprava.zdravstvo.exception.ConflictException;
import com.euprava.zdravstvo.exception.NotFoundException;
import com.euprava.zdravstvo.mapper.PregledMapper;
import com.euprava.zdravstvo.model.Doktor;
import com.euprava.zdravstvo.model.Pacijent;
import com.euprava.zdravstvo.model.Pregled;
import com.euprava.zdravstvo.model.StatusPregleda;
import com.euprava.zdravstvo.repository.DoktorRepository;
import com.euprava.zdravstvo.repository.PacijentRepository;
import com.euprava.zdravstvo.repository.PregledRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PregledService {

    private static final LocalTime RADNO_OD = LocalTime.of(8, 0);
    private static final LocalTime RADNO_DO = LocalTime.of(16, 0);
    private static final int SLOT_MIN = 30;

    private final PregledRepository pregledi;
    private final PacijentRepository pacijenti;
    private final DoktorRepository doktori;
    private final PregledMapper mapper;

    @Transactional(readOnly = true)
    public Page<PregledDTO> filter(Long pacijentId, Long doktorId, LocalDate datum, StatusPregleda status, Pageable pageable) {
        return pregledi.findAll(PregledRepository.filter(pacijentId, doktorId, datum, status), pageable)
                .map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public PregledDTO get(Long id) {
        return mapper.toDto(naci(id));
    }

    @Transactional(readOnly = true)
    public Page<PregledDTO> zaPacijenta(Long pacijentId, Pageable pageable) {
        return pregledi.findAllByPacijent_Id(pacijentId, pageable).map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<PregledDTO> zaDoktora(Long doktorId, Pageable pageable) {
        return pregledi.findAllByDoktor_Id(doktorId, pageable).map(mapper::toDto);
    }

    @Transactional
    public PregledDTO create(PregledCreateDTO req) {
        return createInterno(req, false);
    }

    @Transactional
    public PregledDTO zakazi(PregledCreateDTO req) {
        return createInterno(req, true);
    }

    private PregledDTO createInterno(PregledCreateDTO req, boolean strogo) {
        Pacijent pacijent = pacijenti.findById(req.pacijentId())
                .orElseThrow(() -> new NotFoundException("Pacijent nije pronađen: " + req.pacijentId()));
        Doktor doktor = doktori.findById(req.doktorId())
                .orElseThrow(() -> new NotFoundException("Doktor nije pronađen: " + req.doktorId()));
        if (strogo) {
            if (req.datum().isBefore(LocalDate.now())) {
                throw new ConflictException("Termin u prošlosti: " + req.datum());
            }
            if (req.vreme().isBefore(RADNO_OD) || !req.vreme().isBefore(RADNO_DO)) {
                throw new ConflictException("Vreme van radnih sati (" + RADNO_OD + "–" + RADNO_DO + "): " + req.vreme());
            }
            if (req.vreme().getMinute() % SLOT_MIN != 0 || req.vreme().getSecond() != 0) {
                throw new ConflictException("Termin mora biti poravnat na " + SLOT_MIN + " min: " + req.vreme());
            }
        }
        if (pregledi.existsByDoktor_IdAndDatumAndVreme(doktor.getId(), req.datum(), req.vreme())) {
            throw new ConflictException("Termin već zauzet kod doktora " + doktor.getId() + " — " + req.datum() + " " + req.vreme());
        }
        Pregled p = pregledi.save(Pregled.builder()
                .pacijent(pacijent)
                .doktor(doktor)
                .datum(req.datum())
                .vreme(req.vreme())
                .razlog(req.razlog())
                .status(StatusPregleda.ZAKAZAN)
                .build());
        return mapper.toDto(p);
    }

    @Transactional(readOnly = true)
    public DostupniTerminiDTO dostupniTermini(Long doktorId, LocalDate datum) {
        if (!doktori.existsById(doktorId)) {
            throw new NotFoundException("Doktor nije pronađen: " + doktorId);
        }
        var zauzeti = pregledi.findAllByDoktor_IdAndDatum(doktorId, datum).stream()
                .filter(p -> p.getStatus() != StatusPregleda.OTKAZAN)
                .map(Pregled::getVreme)
                .toList();
        var slobodni = new ArrayList<LocalTime>();
        for (LocalTime t = RADNO_OD; t.isBefore(RADNO_DO); t = t.plusMinutes(SLOT_MIN)) {
            if (!zauzeti.contains(t)) slobodni.add(t);
        }
        return new DostupniTerminiDTO(doktorId, datum, RADNO_OD, RADNO_DO, SLOT_MIN, slobodni, zauzeti);
    }

    @Transactional
    public PregledDTO update(Long id, PregledUpdateDTO req) {
        Pregled p = naci(id);
        boolean terminPromenjen = !p.getDatum().equals(req.datum()) || !p.getVreme().equals(req.vreme());
        if (terminPromenjen && pregledi.existsByDoktor_IdAndDatumAndVreme(p.getDoktor().getId(), req.datum(), req.vreme())) {
            throw new ConflictException("Termin već zauzet — " + req.datum() + " " + req.vreme());
        }
        p.setDatum(req.datum());
        p.setVreme(req.vreme());
        p.setRazlog(req.razlog());
        p.setStatus(req.status());
        return mapper.toDto(p);
    }

    @Transactional
    public PregledDTO promeniStatus(Long id, PregledStatusDTO req) {
        Pregled p = naci(id);
        p.setStatus(req.status());
        return mapper.toDto(p);
    }

    @Transactional
    public void delete(Long id) {
        Pregled p = naci(id);
        pregledi.delete(p);
    }

    private Pregled naci(Long id) {
        return pregledi.findById(id)
                .orElseThrow(() -> new NotFoundException("Pregled nije pronađen: " + id));
    }
}
