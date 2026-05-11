package com.euprava.otvorenipodaci.dto;

import com.euprava.otvorenipodaci.model.StatusSkupa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Set;

public record SkupCreateDTO(
        @NotBlank @Size(max = 200) String naslov,
        @NotBlank @Size(max = 1000) String opis,
        @NotNull Long kategorijaId,
        @NotNull Long izvorId,
        @NotNull Integer godina,
        @Size(max = 60) String opstina,
        @NotNull LocalDate datum,
        Long brojRedova,
        @NotNull StatusSkupa status,
        Set<String> formati,
        String payload
) {}
