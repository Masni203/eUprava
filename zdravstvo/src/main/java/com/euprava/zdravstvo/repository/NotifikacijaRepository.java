package com.euprava.zdravstvo.repository;

import com.euprava.zdravstvo.model.Notifikacija;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotifikacijaRepository extends JpaRepository<Notifikacija, Long> {

    Page<Notifikacija> findAllByKorisnikIdOrderByDatumDesc(Long korisnikId, Pageable pageable);

    long countByKorisnikIdAndProcitanaFalse(Long korisnikId);

    @Modifying
    @Query("update Notifikacija n set n.procitana = true where n.korisnik.id = :korisnikId and n.procitana = false")
    int oznaciSveProcitane(@Param("korisnikId") Long korisnikId);
}
