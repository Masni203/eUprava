package com.euprava.zdravstvo.controller;

import com.euprava.zdravstvo.dto.DoktorCreateDTO;
import com.euprava.zdravstvo.dto.DoktorDTO;
import com.euprava.zdravstvo.dto.DoktorUpdateDTO;
import com.euprava.zdravstvo.dto.PageResponse;
import com.euprava.zdravstvo.service.AuthService;
import com.euprava.zdravstvo.service.DoktorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doktori")
@RequiredArgsConstructor
@Tag(name = "Doktori", description = "CRUD nad doktorima i pretraga po specijalizaciji/bolnici")
public class DoktorController {

    private final DoktorService service;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Lista doktora — paginirana, filteri specijalizacija/bolnica/q")
    public ResponseEntity<PageResponse<DoktorDTO>> list(
            @RequestParam(required = false) String specijalizacija,
            @RequestParam(required = false) String bolnica,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(PageResponse.of(service.pretraga(specijalizacija, bolnica, q, pageable)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOKTOR')")
    @Operation(summary = "Profil tekućeg DOKTOR korisnika")
    public ResponseEntity<DoktorDTO> me(@AuthenticationPrincipal UserDetails me) {
        return ResponseEntity.ok(service.byEmail(me.getUsername()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('DOKTOR')")
    @Operation(summary = "Izmena profila tekućeg doktora. Vraća svež JWT u X-New-Token header-u.")
    public ResponseEntity<DoktorDTO> updateMe(@AuthenticationPrincipal UserDetails me,
                                              @Valid @RequestBody DoktorUpdateDTO req) {
        DoktorDTO dto = service.updateByEmail(me.getUsername(), req);
        String newToken = authService.regenerateTokenFor(dto.email());
        return ResponseEntity.ok().header("X-New-Token", newToken).body(dto);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalj doktora")
    public ResponseEntity<DoktorDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kreiranje doktora (ADMIN)")
    public ResponseEntity<DoktorDTO> create(@Valid @RequestBody DoktorCreateDTO req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Izmena doktora (ADMIN)")
    public ResponseEntity<DoktorDTO> update(@PathVariable Long id, @Valid @RequestBody DoktorUpdateDTO req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Brisanje doktora (ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
