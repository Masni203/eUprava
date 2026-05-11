package com.euprava.zdravstvo.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record IzvestajDTO(
        String period,
        LocalDate odDatuma,
        LocalDate doDatuma,
        long ukupanBrojPregleda,
        Map<String, Long> pregledaPoStatusu,
        Map<String, Long> pregledaPoSpecijalizaciji,
        List<MkbStat> najcesceDijagnoze
) {
    public record MkbStat(String mkbSifra, String mkbNaziv, long broj) {}
}
