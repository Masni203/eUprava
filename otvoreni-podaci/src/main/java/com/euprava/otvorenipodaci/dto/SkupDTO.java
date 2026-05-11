package com.euprava.otvorenipodaci.dto;

import com.euprava.otvorenipodaci.model.StatusSkupa;

import java.time.LocalDate;
import java.util.Set;

public record SkupDTO(
        Long id,
        String naslov,
        String opis,
        KategorijaDTO kategorija,
        IzvorDTO izvor,
        Integer godina,
        String opstina,
        LocalDate datum,
        long brojPreuzimanja,
        Long brojRedova,
        StatusSkupa status,
        Set<String> formati,
        String payload
) {}
