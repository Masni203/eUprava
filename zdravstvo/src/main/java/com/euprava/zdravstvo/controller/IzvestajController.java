package com.euprava.zdravstvo.controller;

import com.euprava.zdravstvo.dto.IzvestajDTO;
import com.euprava.zdravstvo.service.IzvestajService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/izvestaji")
@RequiredArgsConstructor
@Tag(name = "Izveštaji", description = "Agregirani izveštaji o pregledima i dijagnozama")
public class IzvestajController {

    private final IzvestajService service;

    @GetMapping("/generisi")
    @PreAuthorize("hasAnyRole('ADMIN','DOKTOR')")
    @Operation(summary = "Generisanje izveštaja po periodu (nedelja|mesec|godina) i formatu (JSON|CSV)")
    public ResponseEntity<?> generisi(
            @RequestParam(defaultValue = "mesec") String period,
            @RequestParam(defaultValue = "JSON") String format
    ) {
        IzvestajDTO izv = service.generisi(period);
        if ("CSV".equalsIgnoreCase(format)) {
            String csv = service.toCsv(izv);
            String filename = "izvestaj-" + period + "-" + izv.doDatuma() + ".csv";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(csv);
        }
        return ResponseEntity.ok(izv);
    }
}
