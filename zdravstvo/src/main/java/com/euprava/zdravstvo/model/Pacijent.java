package com.euprava.zdravstvo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "pacijent", uniqueConstraints = @UniqueConstraint(columnNames = "jmbg"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pacijent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "korisnik_id", nullable = false, unique = true)
    private Korisnik korisnik;

    @Column(nullable = false, length = 13)
    private String jmbg;

    @Column(name = "datum_rodjenja")
    private LocalDate datumRodjenja;

    @Column(length = 60)
    private String grad;

    @Column(length = 30)
    private String telefon;
}
