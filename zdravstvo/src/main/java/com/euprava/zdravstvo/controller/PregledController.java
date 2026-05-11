package com.euprava.zdravstvo.controller;

import com.euprava.zdravstvo.dto.DostupniTerminiDTO;
import com.euprava.zdravstvo.dto.PageResponse;
import com.euprava.zdravstvo.dto.PregledCreateDTO;
import com.euprava.zdravstvo.dto.PregledDTO;
import com.euprava.zdravstvo.dto.PregledStatusDTO;
import com.euprava.zdravstvo.dto.PregledUpdateDTO;
import com.euprava.zdravstvo.exception.NotFoundException;
import com.euprava.zdravstvo.model.StatusPregleda;
import com.euprava.zdravstvo.repository.DoktorRepository;
import com.euprava.zdravstvo.repository.PacijentRepository;
import com.euprava.zdravstvo.service.PregledService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/pregledi")
@RequiredArgsConstructor
@Tag(name = "Pregledi", description = "CRUD pregleda + promena statusa")
public class PregledController {

    private final PregledService service;
    private final PacijentRepository pacijenti;
    private final DoktorRepository doktori;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Lista pregleda — paginirana, filteri pacijent/doktor/datum/status")
    public ResponseEntity<PageResponse<PregledDTO>> list(
            @RequestParam(required = false) Long pacijentId,
            @RequestParam(required = false) Long doktorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datum,
            @RequestParam(required = false) StatusPregleda status,
            @PageableDefault(size = 20, sort = {"datum", "vreme"}, direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(PageResponse.of(service.filter(pacijentId, doktorId, datum, status, pageable)));
    }

    @GetMapping("/moji")
    @Operation(summary = "Pregledi tekućeg korisnika (PACIJENT vidi svoje, DOKTOR vidi svoje)")
    public ResponseEntity<PageResponse<PregledDTO>> moji(
            @AuthenticationPrincipal UserDetails me,
            @PageableDefault(size = 20, sort = {"datum", "vreme"}, direction = Sort.Direction.DESC) Pageable pageable
    ) {
        boolean jeDoktor = me.getAuthorities().stream().anyMatch(a -> "ROLE_DOKTOR".equals(a.getAuthority()));
        boolean jePacijent = me.getAuthorities().stream().anyMatch(a -> "ROLE_PACIJENT".equals(a.getAuthority()));
        if (jeDoktor) {
            Long id = doktori.findByKorisnik_Email(me.getUsername())
                    .orElseThrow(() -> new NotFoundException("Doktor profil ne postoji za: " + me.getUsername()))
                    .getId();
            return ResponseEntity.ok(PageResponse.of(service.zaDoktora(id, pageable)));
        }
        if (jePacijent) {
            Long id = pacijenti.findByKorisnik_Email(me.getUsername())
                    .orElseThrow(() -> new NotFoundException("Pacijent profil ne postoji za: " + me.getUsername()))
                    .getId();
            return ResponseEntity.ok(PageResponse.of(service.zaPacijenta(id, pageable)));
        }
        return ResponseEntity.ok(PageResponse.of(org.springframework.data.domain.Page.empty(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalj pregleda")
    public ResponseEntity<PregledDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Kreiranje pregleda (osnovni — samo provera konflikta termina)")
    public ResponseEntity<PregledDTO> create(@Valid @RequestBody PregledCreateDTO req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PostMapping("/zakazi")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR','PACIJENT')")
    @Operation(summary = "Zakazivanje pregleda sa proverom dostupnosti (radni sati 08–16, 30-min slotovi, ne u prošlost)")
    public ResponseEntity<PregledDTO> zakazi(@Valid @RequestBody PregledCreateDTO req) {
        return ResponseEntity.ok(service.zakazi(req));
    }

    @GetMapping("/dostupni-termini")
    @Operation(summary = "Slobodni i zauzeti termini doktora za dati datum")
    public ResponseEntity<DostupniTerminiDTO> dostupni(
            @RequestParam Long doktorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datum
    ) {
        return ResponseEntity.ok(service.dostupniTermini(doktorId, datum));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Izmena pregleda")
    public ResponseEntity<PregledDTO> update(@PathVariable Long id, @Valid @RequestBody PregledUpdateDTO req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR','PACIJENT')")
    @Operation(summary = "Promena statusa pregleda (npr. PACIJENT otkazuje, DOKTOR završava)")
    public ResponseEntity<PregledDTO> changeStatus(@PathVariable Long id, @Valid @RequestBody PregledStatusDTO req) {
        return ResponseEntity.ok(service.promeniStatus(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Brisanje pregleda (ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
