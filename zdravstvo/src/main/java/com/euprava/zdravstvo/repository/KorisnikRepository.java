package com.euprava.zdravstvo.repository;

import com.euprava.zdravstvo.model.Korisnik;
import com.euprava.zdravstvo.model.Uloga;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KorisnikRepository extends JpaRepository<Korisnik, Long> {
    Optional<Korisnik> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Korisnik> findAllByUloga(Uloga uloga);
}
