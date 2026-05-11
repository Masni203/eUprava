package com.euprava.zdravstvo.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record DostupniTerminiDTO(
        Long doktorId,
        LocalDate datum,
        LocalTime radnoOd,
        LocalTime radnoDo,
        int trajanjeMinuta,
        List<LocalTime> slobodni,
        List<LocalTime> zauzeti
) {}
