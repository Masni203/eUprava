package com.euprava.otvorenipodaci.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "skup")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String naslov;

    @Column(nullable = false, length = 1000)
    private String opis;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kategorija_id", nullable = false)
    private Kategorija kategorija;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "izvor_id", nullable = false)
    private Izvor izvor;

    @Column(nullable = false)
    private Integer godina;

    @Column(length = 60)
    private String opstina;

    @Column(nullable = false)
    private LocalDate datum;

    @Column(name = "broj_preuzimanja", nullable = false)
    private long brojPreuzimanja;

    @Column(name = "broj_redova")
    private Long brojRedova;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private StatusSkupa status;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "skup_format",
        joinColumns = @JoinColumn(name = "skup_id"),
        uniqueConstraints = @UniqueConstraint(columnNames = {"skup_id", "format"})
    )
    @Column(name = "format", length = 8, nullable = false)
    @Builder.Default
    private Set<String> formati = new HashSet<>();

    @Column(columnDefinition = "TEXT")
    private String payload;
}
