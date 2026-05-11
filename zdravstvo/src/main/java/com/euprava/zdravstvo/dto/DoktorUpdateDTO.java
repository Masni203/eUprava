package com.euprava.zdravstvo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DoktorUpdateDTO(
        @NotBlank @Size(max = 80) String ime,
        @NotBlank @Size(max = 80) String prezime,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(max = 16) String specijalizacijaSifra,
        @NotBlank @Size(max = 16) String bolnicaSifra,
        boolean aktivan
) {}
