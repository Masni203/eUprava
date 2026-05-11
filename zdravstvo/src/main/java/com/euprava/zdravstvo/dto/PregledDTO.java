package com.euprava.zdravstvo.dto;

import com.euprava.zdravstvo.model.StatusPregleda;

import java.time.LocalDate;
import java.time.LocalTime;

public record PregledDTO(
        Long id,
        Long pacijentId,
        String pacijentIme,
        String pacijentPrezime,
        String pacijentJmbg,
        Long doktorId,
        String doktorIme,
        String doktorPrezime,
        String specijalizacija,
        LocalDate datum,
        LocalTime vreme,
        String razlog,
        StatusPregleda status
) {}
