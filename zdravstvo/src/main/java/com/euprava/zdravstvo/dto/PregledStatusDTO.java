package com.euprava.zdravstvo.dto;

import com.euprava.zdravstvo.model.StatusPregleda;
import jakarta.validation.constraints.NotNull;

public record PregledStatusDTO(
        @NotNull StatusPregleda status
) {}
