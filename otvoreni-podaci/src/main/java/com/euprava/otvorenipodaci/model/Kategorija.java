package com.euprava.otvorenipodaci.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "kategorija", uniqueConstraints = @UniqueConstraint(columnNames = "naziv"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Kategorija {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String naziv;
}
