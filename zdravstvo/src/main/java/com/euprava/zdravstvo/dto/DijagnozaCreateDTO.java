package com.euprava.zdravstvo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record DijagnozaCreateDTO(
        @NotBlank @Size(max = 8) String mkbSifra,
        @NotNull Long doktorId,
        @NotNull LocalDate datum,
        @Size(max = 500) String terapija,
        boolean aktivna
) {}
