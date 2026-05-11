package com.euprava.zdravstvo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank @Size(max = 80) String ime,
        @NotBlank @Size(max = 80) String prezime,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(min = 6, max = 100) String lozinka,
        @NotBlank @Pattern(regexp = "\\d{13}", message = "JMBG mora imati tačno 13 cifara") String jmbg,
        LocalDate datumRodjenja,
        @Size(max = 60) String grad,
        @Size(max = 30) String telefon
) {}
