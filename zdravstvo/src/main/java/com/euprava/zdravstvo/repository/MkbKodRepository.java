package com.euprava.zdravstvo.repository;

import com.euprava.zdravstvo.model.MkbKod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MkbKodRepository extends JpaRepository<MkbKod, String> {
    List<MkbKod> findTop10BySifraStartingWithIgnoreCaseOrNazivContainingIgnoreCase(String sifraPrefix, String nazivPart);
}
