package com.euprava.zdravstvo.dto;

import java.time.LocalDate;

public record DijagnozaDTO(
        Long id,
        String mkbSifra,
        String mkbNaziv,
        Long doktorId,
        String doktorIme,
        String doktorPrezime,
        LocalDate datum,
        String terapija,
        boolean aktivna
) {}
