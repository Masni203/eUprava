package com.euprava.zdravstvo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "pregled")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pregled {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pacijent_id", nullable = false)
    private Pacijent pacijent;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doktor_id", nullable = false)
    private Doktor doktor;

    @Column(nullable = false)
    private LocalDate datum;

    @Column(nullable = false)
    private LocalTime vreme;

    @Column(length = 240)
    private String razlog;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private StatusPregleda status;
}
