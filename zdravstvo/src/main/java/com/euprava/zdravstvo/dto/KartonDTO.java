package com.euprava.zdravstvo.dto;

import java.util.List;

public record KartonDTO(
        Long id,
        Long pacijentId,
        String pacijentIme,
        String pacijentPrezime,
        String pacijentJmbg,
        List<DijagnozaDTO> dijagnoze,
        List<AlergijaDTO> alergije
) {}
