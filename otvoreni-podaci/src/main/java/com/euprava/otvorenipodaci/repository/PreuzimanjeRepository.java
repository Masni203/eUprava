package com.euprava.otvorenipodaci.repository;

import com.euprava.otvorenipodaci.model.Preuzimanje;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PreuzimanjeRepository extends JpaRepository<Preuzimanje, Long> {
    Page<Preuzimanje> findAllByKorisnik_Id(Long korisnikId, Pageable pageable);
    Page<Preuzimanje> findAllBySkup_Id(Long skupId, Pageable pageable);
    java.util.List<Preuzimanje> findBySkup_Id(Long skupId);
    long countBySkup_Id(Long skupId);
}
