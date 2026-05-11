package com.euprava.otvorenipodaci.controller;

import com.euprava.otvorenipodaci.dto.StatsDTO;
import com.euprava.otvorenipodaci.model.StatusSkupa;
import com.euprava.otvorenipodaci.repository.IzvorRepository;
import com.euprava.otvorenipodaci.repository.KategorijaRepository;
import com.euprava.otvorenipodaci.repository.SkupRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Tag(name = "Statistika", description = "Agregatne brojke kataloga (javno)")
public class StatsController {

    private final SkupRepository skupovi;
    private final IzvorRepository izvori;
    private final KategorijaRepository kategorije;

    @GetMapping
    @Operation(summary = "Public sumarne brojke za OP landing")
    public ResponseEntity<StatsDTO> stats() {
        long brSkupova = skupovi.countByStatus(StatusSkupa.OBJAVLJEN);
        long brIzvora = izvori.count();
        long brKat = kategorije.count();
        long brPreuzimanja = skupovi.findAll().stream()
                .filter(s -> s.getStatus() == StatusSkupa.OBJAVLJEN)
                .mapToLong(s -> s.getBrojPreuzimanja())
                .sum();
        return ResponseEntity.ok(new StatsDTO(brSkupova, brIzvora, brKat, brPreuzimanja));
    }
}
