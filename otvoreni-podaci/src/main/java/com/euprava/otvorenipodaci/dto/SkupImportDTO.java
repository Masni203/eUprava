package com.euprava.otvorenipodaci.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Set;

/**
 * DTO za import skupa iz drugog servisa (Zdravstvo). Kategorija i izvor
 * dolaze po nazivu — drugi servis ne zna OP-ov ID prostor.
 */
public record SkupImportDTO(
        @NotBlank @Size(max = 200) String naslov,
        @NotBlank @Size(max = 1000) String opis,
        @NotBlank @Size(max = 60) String kategorijaNaziv,
        @NotBlank @Size(max = 120) String izvorNaziv,
        @NotNull Integer godina,
        @Size(max = 60) String opstina,
        @NotNull LocalDate datum,
        Long brojRedova,
        Set<String> formati,
        @NotBlank String payload
) {}
