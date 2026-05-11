package com.euprava.otvorenipodaci.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "preuzimanje")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Preuzimanje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skup_id", nullable = false)
    private Skup skup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "korisnik_id")
    private Korisnik korisnik;

    @Column(nullable = false, length = 8)
    private String format;

    @Column(nullable = false)
    private LocalDateTime datum;
}
