package com.euprava.zdravstvo.repository;

import com.euprava.zdravstvo.model.Pacijent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PacijentRepository extends JpaRepository<Pacijent, Long> {
    Optional<Pacijent> findByJmbg(String jmbg);
    Optional<Pacijent> findByKorisnik_Email(String email);

    @Query("""
        select p from Pacijent p
        where (cast(:jmbg as string) is null or p.jmbg = cast(:jmbg as string))
          and (cast(:ime  as string) is null
               or lower(p.korisnik.ime)     like lower(concat('%', cast(:ime as string), '%'))
               or lower(p.korisnik.prezime) like lower(concat('%', cast(:ime as string), '%')))
    """)
    Page<Pacijent> pretraga(@Param("jmbg") String jmbg, @Param("ime") String ime, Pageable pageable);

    @Query("""
        select p from Pacijent p
        where (cast(:jmbg as string) is null or p.jmbg = cast(:jmbg as string))
          and (cast(:q    as string) is null
               or lower(p.korisnik.ime)     like lower(concat('%', cast(:q as string), '%'))
               or lower(p.korisnik.prezime) like lower(concat('%', cast(:q as string), '%')))
          and (cast(:grad as string) is null or lower(p.grad) = lower(cast(:grad as string)))
    """)
    Page<Pacijent> filter(@Param("jmbg") String jmbg,
                          @Param("q") String q,
                          @Param("grad") String grad,
                          Pageable pageable);
}
