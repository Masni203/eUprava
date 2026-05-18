package com.euprava.zdravstvo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifikacija", indexes = {
        @Index(name = "idx_notif_korisnik_procitana", columnList = "korisnik_id,procitana"),
        @Index(name = "idx_notif_datum", columnList = "datum")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notifikacija {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "korisnik_id", nullable = false)
    private Korisnik korisnik;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TipNotifikacije tip;

    @Column(nullable = false, length = 160)
    private String naslov;

    @Column(nullable = false, length = 600)
    private String tekst;

    @Column(name = "link_ruta", length = 120)
    private String linkRuta;

    @Column(nullable = false)
    private boolean procitana;

    @Column(nullable = false)
    private LocalDateTime datum;
}
