package com.euprava.otvorenipodaci.repository;

import com.euprava.otvorenipodaci.model.Korisnik;
import com.euprava.otvorenipodaci.model.UlogaOP;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KorisnikRepository extends JpaRepository<Korisnik, Long> {
    Optional<Korisnik> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Korisnik> findAllByUloga(UlogaOP uloga);
}
