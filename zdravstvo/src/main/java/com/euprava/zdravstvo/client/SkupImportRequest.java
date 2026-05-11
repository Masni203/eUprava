package com.euprava.zdravstvo.client;

import java.time.LocalDate;
import java.util.Set;

/**
 * Telo zahteva ka OP-u (POST /api/dataset/import). Mora se poklapati sa
 * SkupImportDTO na strani Otvoreni Podaci servisa.
 */
public record SkupImportRequest(
        String naslov,
        String opis,
        String kategorijaNaziv,
        String izvorNaziv,
        Integer godina,
        String opstina,
        LocalDate datum,
        Long brojRedova,
        Set<String> formati,
        String payload
) {}
