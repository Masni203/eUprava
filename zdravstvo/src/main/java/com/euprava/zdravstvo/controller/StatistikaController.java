package com.euprava.zdravstvo.controller;

import com.euprava.zdravstvo.service.StatistikaService;
import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistika")
@RequiredArgsConstructor
@Tag(name = "Statistika", description = "Anonimna agregacija i objavljivanje u Otvorene Podatke (3 inter-service razmene)")
public class StatistikaController {

    private final StatistikaService service;

    @PostMapping("/objavi")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Razmena 1: Zd → OP — agregira pregledi/dijagnoze i šalje POST /api/dataset/import. tip=agregat|top, period=nedelja|mesec|godina")
    public ResponseEntity<JsonNode> objavi(
            @RequestParam(defaultValue = "agregat") String tip,
            @RequestParam(defaultValue = "mesec") String period
    ) {
        return ResponseEntity.ok(service.objavi(tip, period));
    }

    @GetMapping("/objavljene")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Razmena 2: Zd → OP — GET /api/dataset/pretraga?izvor=MZ RS, vraća sve skupove koje smo prethodno objavili.")
    public ResponseEntity<JsonNode> objavljene() {
        return ResponseEntity.ok(service.objavljene());
    }

    @DeleteMapping("/objavljene/{opSkupId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Razmena 3: Zd → OP — DELETE /api/dataset/import/{id}, povlači prethodno objavljen skup.")
    public ResponseEntity<Void> povuci(@PathVariable Long opSkupId) {
        service.povuciObjavljen(opSkupId);
        return ResponseEntity.noContent().build();
    }
}
