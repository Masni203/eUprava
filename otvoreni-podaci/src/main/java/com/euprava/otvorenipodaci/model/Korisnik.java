package com.euprava.otvorenipodaci.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "korisnik", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Korisnik {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(nullable = false)
    private String lozinka;

    @Column(nullable = false, length = 80)
    private String ime;

    @Column(nullable = false, length = 80)
    private String prezime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private UlogaOP uloga;

    @Column(nullable = false)
    private boolean aktivan;

    @Column(name = "kreiran")
    private LocalDateTime kreiran;
}
