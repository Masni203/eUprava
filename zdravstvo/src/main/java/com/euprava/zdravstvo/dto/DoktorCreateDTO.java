package com.euprava.zdravstvo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DoktorCreateDTO(
        @NotBlank @Size(max = 80) String ime,
        @NotBlank @Size(max = 80) String prezime,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(min = 6, max = 100) String lozinka,
        @NotBlank @Size(max = 16) String specijalizacijaSifra,
        @NotBlank @Size(max = 16) String bolnicaSifra
) {}
