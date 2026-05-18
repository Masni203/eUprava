package com.euprava.otvorenipodaci.controller;

import com.euprava.otvorenipodaci.dto.GrafikonDTO;
import com.euprava.otvorenipodaci.dto.PageResponse;
import com.euprava.otvorenipodaci.dto.SkupCreateDTO;
import com.euprava.otvorenipodaci.dto.SkupDTO;
import com.euprava.otvorenipodaci.dto.SkupImportDTO;
import com.euprava.otvorenipodaci.dto.SkupUpdateDTO;
import org.springframework.beans.factory.annotation.Value;
import com.euprava.otvorenipodaci.model.Skup;
import com.euprava.otvorenipodaci.model.StatusSkupa;
import com.euprava.otvorenipodaci.service.SkupDataService;
import com.euprava.otvorenipodaci.service.SkupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dataset")
@RequiredArgsConstructor
@Tag(name = "Skupovi podataka", description = "Javni katalog otvorenih podataka + admin CRUD")
public class SkupController {

    private final SkupService service;
    private final SkupDataService data;

    @Value("${euprava.import.api-key}")
    private String importApiKey;

    @GetMapping("/pretraga")
    @Operation(summary = "Javna pretraga skupova (anonimno: vidi samo OBJAVLJEN; ADMIN_OP: sve)")
    public ResponseEntity<PageResponse<SkupDTO>> pretraga(
            @RequestParam(required = false) StatusSkupa status,
            @RequestParam(required = false) String kategorija,
            @RequestParam(required = false) String opstina,
            @RequestParam(required = false) Integer godina,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String izvor,
            @PageableDefault(size = 20, sort = "datum", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication auth
    ) {
        StatusSkupa effectiveStatus = (status != null && jeAdminOP(auth)) ? status : StatusSkupa.OBJAVLJEN;
        return ResponseEntity.ok(PageResponse.of(service.pretraga(effectiveStatus, kategorija, opstina, godina, q, izvor, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalj skupa (anonimno: samo OBJAVLJEN; ADMIN_OP: i NACRT)")
    public ResponseEntity<SkupDTO> get(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(service.get(id, jeAdminOP(auth)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN_OP')")
    @Operation(summary = "Kreiranje skupa (ADMIN_OP)")
    public ResponseEntity<SkupDTO> create(@Valid @RequestBody SkupCreateDTO req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_OP')")
    @Operation(summary = "Izmena skupa (ADMIN_OP)")
    public ResponseEntity<SkupDTO> update(@PathVariable Long id, @Valid @RequestBody SkupUpdateDTO req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_OP')")
    @Operation(summary = "Brisanje skupa (ADMIN_OP)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/odobri")
    @PreAuthorize("hasRole('ADMIN_OP')")
    @Operation(summary = "Odobravanje skupa u statusu NA_ODOBRENJU → OBJAVLJEN")
    public ResponseEntity<SkupDTO> odobri(@PathVariable Long id) {
        return ResponseEntity.ok(service.odobri(id));
    }

    @PostMapping("/{id}/odbij")
    @PreAuthorize("hasRole('ADMIN_OP')")
    @Operation(summary = "Odbijanje skupa u statusu NA_ODOBRENJU → ODBIJEN")
    public ResponseEntity<SkupDTO> odbij(@PathVariable Long id,
                                          @RequestBody(required = false) Map<String, String> body) {
        String razlog = body == null ? null : body.get("razlog");
        return ResponseEntity.ok(service.odbij(id, razlog));
    }

    @GetMapping("/{id}/grafikon")
    @Operation(summary = "Chart-ready JSON za vizualizaciju (Chart.js / ApexCharts)")
    public ResponseEntity<GrafikonDTO> grafikon(@PathVariable Long id) {
        Skup s = service.naciObjavljen(id);
        return ResponseEntity.ok(data.grafikon(s));
    }

    @GetMapping("/{id}/export")
    @Operation(summary = "Preuzimanje sadržaja skupa kao CSV ili JSON")
    public ResponseEntity<?> export(@PathVariable Long id,
                                    @RequestParam(defaultValue = "csv") String format) {
        Skup s = service.naciObjavljen(id);
        var redovi = data.sintetisiRedove(s, 200);
        var meta = data.meta(s);
        String filename = "skup-" + id + "-" + s.getNaslov().replaceAll("[^a-zA-Z0-9]+", "-").toLowerCase();

        if ("json".equalsIgnoreCase(format)) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + ".json\"")
                    .body(data.toJson(redovi));
        }
        if ("csv".equalsIgnoreCase(format)) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + ".csv\"")
                    .body(data.toCsv(redovi, meta.kolone()));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Nepoznat format: " + format + " (csv|json)"));
    }

    @GetMapping("/po-izvoru")
    @Operation(summary = "Lista svih skupova (svi statusi) po nazivu izvora — X-Api-Key zaštita")
    public ResponseEntity<PageResponse<SkupDTO>> poIzvoru(
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestParam String izvor,
            @PageableDefault(size = 100, sort = "datum", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        if (apiKey == null || !apiKey.equals(importApiKey)) {
            return ResponseEntity.status(401).build();
        }
        // status=null vraća sve (NACRT, NA_ODOBRENJU, OBJAVLJEN, ODBIJEN) za dati izvor.
        return ResponseEntity.ok(PageResponse.of(
                service.pretraga(null, null, null, null, null, izvor, pageable)));
    }

    @PostMapping("/import")
    @Operation(summary = "Prijem skupa iz drugog servisa (X-Api-Key zaštita)")
    public ResponseEntity<SkupDTO> importuj(@RequestHeader(value = "X-Api-Key", required = false) String apiKey,
                                            @Valid @RequestBody SkupImportDTO body) {
        if (apiKey == null || !apiKey.equals(importApiKey)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(service.importuj(body));
    }

    @DeleteMapping("/import/{id}")
    @Operation(summary = "Povlačenje prethodno importovanog skupa (X-Api-Key zaštita)")
    public ResponseEntity<Void> importDelete(@PathVariable Long id,
                                             @RequestHeader(value = "X-Api-Key", required = false) String apiKey) {
        if (apiKey == null || !apiKey.equals(importApiKey)) {
            return ResponseEntity.status(401).build();
        }
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/preuzmi")
    @Operation(summary = "Inkrementuje brojač preuzimanja i loguje preuzimanje (anonimno OK)")
    public ResponseEntity<Map<String, Object>> preuzmi(@PathVariable Long id,
                                                        @RequestParam String format,
                                                        Authentication auth) {
        String email = (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName()))
                ? auth.getName() : null;
        long noviBroj = service.preuzmi(id, format, email);
        return ResponseEntity.ok(Map.of(
                "skupId", id,
                "format", format.toUpperCase(),
                "brojPreuzimanja", noviBroj
        ));
    }

    private static boolean jeAdminOP(Authentication auth) {
        return auth != null && auth.isAuthenticated()
                && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN_OP".equals(a.getAuthority()));
    }
}
