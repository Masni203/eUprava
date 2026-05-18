package com.euprava.otvorenipodaci.dto;

import com.euprava.otvorenipodaci.model.TipNotifikacije;

import java.time.LocalDateTime;

public record NotifikacijaDTO(
        Long id,
        TipNotifikacije tip,
        String naslov,
        String tekst,
        String linkRuta,
        boolean procitana,
        LocalDateTime datum
) {
}
