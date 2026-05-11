package com.euprava.zdravstvo.dto;

import com.euprava.zdravstvo.model.StatusPregleda;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record PregledUpdateDTO(
        @NotNull LocalDate datum,
        @NotNull LocalTime vreme,
        @Size(max = 240) String razlog,
        @NotNull StatusPregleda status
) {}
