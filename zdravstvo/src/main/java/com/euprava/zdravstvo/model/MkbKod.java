package com.euprava.zdravstvo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "mkb_kod")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MkbKod {

    @Id
    @Column(length = 8)
    private String sifra;

    @Column(nullable = false, length = 240)
    private String naziv;
}
