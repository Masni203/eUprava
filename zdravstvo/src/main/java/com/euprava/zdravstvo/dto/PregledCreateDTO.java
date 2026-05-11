package com.euprava.zdravstvo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record PregledCreateDTO(
        @NotNull Long pacijentId,
        @NotNull Long doktorId,
        @NotNull LocalDate datum,
        @NotNull LocalTime vreme,
        @Size(max = 240) String razlog
) {}
