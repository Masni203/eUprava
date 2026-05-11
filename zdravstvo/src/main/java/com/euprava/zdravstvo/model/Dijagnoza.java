package com.euprava.zdravstvo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "dijagnoza")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dijagnoza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "karton_id", nullable = false)
    private Karton karton;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mkb_sifra", nullable = false)
    private MkbKod mkbKod;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doktor_id", nullable = false)
    private Doktor doktor;

    @Column(nullable = false)
    private LocalDate datum;

    @Column(length = 500)
    private String terapija;

    @Column(nullable = false)
    private boolean aktivna;
}
