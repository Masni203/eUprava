package com.euprava.zdravstvo.controller;

import com.euprava.zdravstvo.model.TipNotifikacije;
import com.euprava.zdravstvo.model.Uloga;
import com.euprava.zdravstvo.service.NotifikacijaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Razmena #4: prijem in-app notifikacija iz drugog servisa (OP).
 * Zaštita ide preko X-Api-Key (isti uzorak kao OP-ov SkupController.importuj).
 * Ako payload ima email — notifikacija ide tom korisniku; inače svim adminima.
 */
@RestController
@RequestMapping("/api/notifikacije")
@RequiredArgsConstructor
@Tag(name = "Notifikacije (in)", description = "Prijem notifikacija iz drugih servisa (X-Api-Key)")
public class NotifikacijaInController {

    private final NotifikacijaService service;

    @Value("${euprava.import.api-key}")
    private String importApiKey;

    public record NotifikacijaInDTO(
            String email,
            @NotNull TipNotifikacije tip,
            @NotBlank String naslov,
            @NotBlank String tekst,
            String linkRuta
    ) {}

    @PostMapping("/in")
    @Operation(summary = "Prijem notifikacije iz drugog servisa (X-Api-Key)")
    public ResponseEntity<?> primi(@RequestHeader(value = "X-Api-Key", required = false) String apiKey,
                                    @RequestBody NotifikacijaInDTO body) {
        if (apiKey == null || !apiKey.equals(importApiKey)) {
            return ResponseEntity.status(401).build();
        }
        if (body == null || body.tip() == null || body.naslov() == null || body.tekst() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "tip, naslov i tekst su obavezni"));
        }
        if (body.email() != null && !body.email().isBlank()) {
            service.pushNaEmail(body.email(), body.tip(), body.naslov(), body.tekst(), body.linkRuta());
            return ResponseEntity.ok(Map.of("dostavljeno", 1, "primalac", body.email()));
        }
        // Bez email-a → svi administratori Zdravstva.
        int n = service.pushSvima(Uloga.ADMIN, body.tip(), body.naslov(), body.tekst(), body.linkRuta());
        return ResponseEntity.ok(Map.of("dostavljeno", n, "primalac", "ADMIN_*"));
    }
}
