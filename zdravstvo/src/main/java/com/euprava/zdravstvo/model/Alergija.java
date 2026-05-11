package com.euprava.zdravstvo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "alergija")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alergija {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pacijent_id", nullable = false)
    private Pacijent pacijent;

    @Column(nullable = false, length = 80)
    private String naziv;

    @Column(nullable = false, length = 16)
    private String stepen;
}
