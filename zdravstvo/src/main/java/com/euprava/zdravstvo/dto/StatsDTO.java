package com.euprava.zdravstvo.dto;

public record StatsDTO(
        long brojPacijenata,
        long brojDoktora,
        long brojDijagnoza,
        long pregledaUkupno,
        long pregledaDanas,
        long pregledaOvogMeseca,
        long pregledaZakazani,
        long pregledaZavrseni
) {}
