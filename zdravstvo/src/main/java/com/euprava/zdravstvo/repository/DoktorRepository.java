package com.euprava.zdravstvo.repository;

import com.euprava.zdravstvo.model.Doktor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DoktorRepository extends JpaRepository<Doktor, Long> {
    Optional<Doktor> findByKorisnik_Email(String email);
    List<Doktor> findAllBySpecijalizacija_Sifra(String specijalizacijaSifra);

    @Query("""
        select d from Doktor d
        where (cast(:specijalizacija as string) is null or d.specijalizacija.sifra = cast(:specijalizacija as string))
          and (cast(:bolnica as string) is null or d.bolnica.sifra = cast(:bolnica as string))
          and (cast(:q as string) is null
               or lower(d.korisnik.ime)     like lower(concat('%', cast(:q as string), '%'))
               or lower(d.korisnik.prezime) like lower(concat('%', cast(:q as string), '%')))
    """)
    Page<Doktor> pretraga(@Param("specijalizacija") String specijalizacija,
                          @Param("bolnica") String bolnica,
                          @Param("q") String q,
                          Pageable pageable);
}
