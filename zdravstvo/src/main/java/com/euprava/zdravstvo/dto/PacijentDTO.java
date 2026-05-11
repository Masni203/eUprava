package com.euprava.zdravstvo.dto;

import java.time.LocalDate;

public record PacijentDTO(
        Long id,
        String ime,
        String prezime,
        String email,
        String jmbg,
        LocalDate datumRodjenja,
        String grad,
        String telefon,
        boolean aktivan
) {}
