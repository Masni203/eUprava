package com.euprava.zdravstvo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlergijaCreateDTO(
        @NotBlank @Size(max = 80) String naziv,
        @NotBlank @Size(max = 16) String stepen
) {}
