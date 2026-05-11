package com.euprava.zdravstvo.repository;

import com.euprava.zdravstvo.model.Dijagnoza;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DijagnozaRepository extends JpaRepository<Dijagnoza, Long> {
    List<Dijagnoza> findAllByKarton_Id(Long kartonId);
    List<Dijagnoza> findAllByKarton_IdAndAktivnaTrue(Long kartonId);
    List<Dijagnoza> findByDoktor_Id(Long doktorId);
    long countByMkbKod_Sifra(String mkbSifra);
    List<Dijagnoza> findAllByDatumBetween(LocalDate od, LocalDate doDatuma);
}
