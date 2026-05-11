package com.euprava.zdravstvo.repository;

import com.euprava.zdravstvo.model.Alergija;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlergijaRepository extends JpaRepository<Alergija, Long> {
    List<Alergija> findAllByPacijent_Id(Long pacijentId);
}
