package com.euprava.otvorenipodaci.controller;

import com.euprava.otvorenipodaci.dto.NotifikacijaDTO;
import com.euprava.otvorenipodaci.dto.PageResponse;
import com.euprava.otvorenipodaci.service.NotifikacijaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifikacije")
@RequiredArgsConstructor
@Tag(name = "Notifikacije", description = "In-app notifikacije prijavljenog korisnika")
public class NotifikacijaController {

    private final NotifikacijaService service;

    @GetMapping("/moje")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Paginirana lista notifikacija prijavljenog korisnika (najnovije prve)")
    public ResponseEntity<PageResponse<NotifikacijaDTO>> moje(
            @AuthenticationPrincipal UserDetails me,
            @PageableDefault(size = 30, sort = "datum", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(service.mojeNotifikacije(me.getUsername(), pageable));
    }

    @GetMapping("/broj-neprocitanih")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Broj nepročitanih notifikacija (polling endpoint)")
    public ResponseEntity<Map<String, Long>> brojNeprocitanih(@AuthenticationPrincipal UserDetails me) {
        return ResponseEntity.ok(service.brojNeprocitanih(me.getUsername()));
    }

    @PatchMapping("/{id}/procitana")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Označi pojedinačnu notifikaciju kao pročitanu")
    public ResponseEntity<NotifikacijaDTO> oznaciProcitanu(@AuthenticationPrincipal UserDetails me,
                                                           @PathVariable Long id) {
        return ResponseEntity.ok(service.oznaciProcitanu(me.getUsername(), id));
    }

    @PostMapping("/oznaci-sve-procitane")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Označi sve nepročitane notifikacije korisnika kao pročitane")
    public ResponseEntity<Map<String, Integer>> oznaciSve(@AuthenticationPrincipal UserDetails me) {
        return ResponseEntity.ok(Map.of("oznaceno", service.oznaciSveProcitane(me.getUsername())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Brisanje notifikacije")
    public ResponseEntity<Void> obrisi(@AuthenticationPrincipal UserDetails me, @PathVariable Long id) {
        service.obrisi(me.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
