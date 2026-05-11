package com.euprava.zdravstvo.controller;

import com.euprava.zdravstvo.dto.StatsDTO;
import com.euprava.zdravstvo.model.StatusPregleda;
import com.euprava.zdravstvo.repository.DijagnozaRepository;
import com.euprava.zdravstvo.repository.DoktorRepository;
import com.euprava.zdravstvo.repository.PacijentRepository;
import com.euprava.zdravstvo.repository.PregledRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Tag(name = "Statistika", description = "Agregatne brojke zdravstvenog sistema")
public class StatsController {

    private final PacijentRepository pacijenti;
    private final DoktorRepository doktori;
    private final PregledRepository pregledi;
    private final DijagnozaRepository dijagnoze;

    @GetMapping
    @Operation(summary = "Sumarne brojke za dashboard")
    public ResponseEntity<StatsDTO> stats() {
        LocalDate today = LocalDate.now();
        LocalDate prviUMesecu = today.withDayOfMonth(1);

        long brPac = pacijenti.count();
        long brDok = doktori.count();
        long brDij = dijagnoze.count();
        long brPregUk = pregledi.count();
        long brZak = pregledi.countByStatus(StatusPregleda.ZAKAZAN);
        long brZav = pregledi.countByStatus(StatusPregleda.ZAVRSEN);
        long brDanas = pregledi.findAllByDatumBetween(today, today).size();
        long brMesec = pregledi.findAllByDatumBetween(prviUMesecu, today).size();

        return ResponseEntity.ok(new StatsDTO(brPac, brDok, brDij, brPregUk, brDanas, brMesec, brZak, brZav));
    }
}
