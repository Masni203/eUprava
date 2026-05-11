package com.euprava.otvorenipodaci.repository;

import com.euprava.otvorenipodaci.model.Kategorija;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KategorijaRepository extends JpaRepository<Kategorija, Long> {
    Optional<Kategorija> findByNaziv(String naziv);
}
