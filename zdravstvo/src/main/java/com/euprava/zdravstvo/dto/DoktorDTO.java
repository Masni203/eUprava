package com.euprava.zdravstvo.dto;

public record DoktorDTO(
        Long id,
        String ime,
        String prezime,
        String email,
        boolean aktivan,
        SpecijalizacijaDTO specijalizacija,
        BolnicaDTO bolnica
) {}
