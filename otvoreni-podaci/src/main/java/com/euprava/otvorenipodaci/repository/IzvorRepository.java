package com.euprava.otvorenipodaci.repository;

import com.euprava.otvorenipodaci.model.Izvor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IzvorRepository extends JpaRepository<Izvor, Long> {
    Optional<Izvor> findByNaziv(String naziv);
}
