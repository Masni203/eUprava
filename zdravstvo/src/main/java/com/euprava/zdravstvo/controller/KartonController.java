package com.euprava.zdravstvo.controller;

import com.euprava.zdravstvo.dto.AlergijaCreateDTO;
import com.euprava.zdravstvo.dto.AlergijaDTO;
import com.euprava.zdravstvo.dto.DijagnozaCreateDTO;
import com.euprava.zdravstvo.dto.DijagnozaDTO;
import com.euprava.zdravstvo.dto.KartonDTO;
import com.euprava.zdravstvo.service.KartonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/karton")
@RequiredArgsConstructor
@Tag(name = "Karton", description = "Zdravstveni karton — dijagnoze i alergije")
public class KartonController {

    private final KartonService service;

    @GetMapping("/{pacijentId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR') or (hasRole('PACIJENT') and @pacijentSecurity.jeVlasnikKartona(#pacijentId, principal.username))")
    @Operation(summary = "Karton pacijenta sa dijagnozama i alergijama")
    public ResponseEntity<KartonDTO> get(@PathVariable Long pacijentId) {
        return ResponseEntity.ok(service.zaPacijenta(pacijentId));
    }

    @PostMapping("/{pacijentId}/dijagnoza")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Dodavanje dijagnoze u karton (DOKTOR/ADMIN)")
    public ResponseEntity<DijagnozaDTO> dodajDijagnozu(@PathVariable Long pacijentId,
                                                       @Valid @RequestBody DijagnozaCreateDTO req) {
        return ResponseEntity.ok(service.dodajDijagnozu(pacijentId, req));
    }

    @DeleteMapping("/dijagnoza/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Brisanje dijagnoze")
    public ResponseEntity<Void> obrisiDijagnozu(@PathVariable Long id) {
        service.obrisiDijagnozu(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{pacijentId}/alergija")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Dodavanje alergije pacijentu")
    public ResponseEntity<AlergijaDTO> dodajAlergiju(@PathVariable Long pacijentId,
                                                     @Valid @RequestBody AlergijaCreateDTO req) {
        return ResponseEntity.ok(service.dodajAlergiju(pacijentId, req));
    }

    @DeleteMapping("/alergija/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Brisanje alergije")
    public ResponseEntity<Void> obrisiAlergiju(@PathVariable Long id) {
        service.obrisiAlergiju(id);
        return ResponseEntity.noContent().build();
    }
}
