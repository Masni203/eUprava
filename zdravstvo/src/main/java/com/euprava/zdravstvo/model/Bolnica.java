package com.euprava.zdravstvo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "bolnica")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bolnica {

    @Id
    @Column(length = 16)
    private String sifra;

    @Column(nullable = false, length = 120)
    private String naziv;

    @Column(nullable = false, length = 60)
    private String grad;
}
