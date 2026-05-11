package com.euprava.zdravstvo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "doktor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doktor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "korisnik_id", nullable = false, unique = true)
    private Korisnik korisnik;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specijalizacija_sifra", nullable = false)
    private Specijalizacija specijalizacija;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bolnica_sifra", nullable = false)
    private Bolnica bolnica;
}
