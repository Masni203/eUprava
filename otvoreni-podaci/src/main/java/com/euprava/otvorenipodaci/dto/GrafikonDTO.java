package com.euprava.otvorenipodaci.dto;

import java.util.List;

public record GrafikonDTO(
        String tip,
        String naslov,
        List<String> labels,
        List<Series> series
) {
    public record Series(String name, List<Number> data) {}
}
