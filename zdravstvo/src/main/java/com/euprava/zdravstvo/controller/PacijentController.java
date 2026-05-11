package com.euprava.zdravstvo.controller;

import com.euprava.zdravstvo.dto.PacijentCreateDTO;
import com.euprava.zdravstvo.dto.PacijentDTO;
import com.euprava.zdravstvo.dto.PacijentUpdateDTO;
import com.euprava.zdravstvo.dto.PageResponse;
import com.euprava.zdravstvo.service.AuthService;
import com.euprava.zdravstvo.service.PacijentService;
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
@RequestMapping("/api/pacijenti")
@RequiredArgsConstructor
@Tag(name = "Pacijenti", description = "CRUD pacijenata + pretraga")
public class PacijentController {

    private final PacijentService service;
    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Lista pacijenata — paginirana, filteri jmbg/q/grad")
    public ResponseEntity<PageResponse<PacijentDTO>> list(
            @RequestParam(required = false) String jmbg,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String grad,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(PageResponse.of(service.filter(jmbg, q, grad, pageable)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PACIJENT')")
    @Operation(summary = "Profil tekućeg PACIJENT korisnika")
    public ResponseEntity<PacijentDTO> me(@AuthenticationPrincipal UserDetails me) {
        return ResponseEntity.ok(service.byEmail(me.getUsername()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PACIJENT')")
    @Operation(summary = "Izmena profila tekućeg pacijenta. Vraća svež JWT u X-New-Token header-u (claims se osvežavaju).")
    public ResponseEntity<PacijentDTO> updateMe(@AuthenticationPrincipal UserDetails me,
                                                @Valid @RequestBody PacijentUpdateDTO req) {
        PacijentDTO dto = service.updateByEmail(me.getUsername(), req);
        String newToken = authService.regenerateTokenFor(dto.email());
        return ResponseEntity.ok().header("X-New-Token", newToken).body(dto);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Detalj pacijenta")
    public ResponseEntity<PacijentDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kreiranje pacijenta (ADMIN; PACIJENT se registruje preko /api/auth/register)")
    public ResponseEntity<PacijentDTO> create(@Valid @RequestBody PacijentCreateDTO req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Izmena pacijenta")
    public ResponseEntity<PacijentDTO> update(@PathVariable Long id, @Valid @RequestBody PacijentUpdateDTO req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Brisanje pacijenta (ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
