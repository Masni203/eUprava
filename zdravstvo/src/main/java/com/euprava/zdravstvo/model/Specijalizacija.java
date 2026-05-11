package com.euprava.zdravstvo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "specijalizacija")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Specijalizacija {

    @Id
    @Column(length = 16)
    private String sifra;

    @Column(nullable = false, length = 80)
    private String naziv;
}
