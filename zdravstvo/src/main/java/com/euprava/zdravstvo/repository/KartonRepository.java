package com.euprava.zdravstvo.repository;

import com.euprava.zdravstvo.model.Karton;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KartonRepository extends JpaRepository<Karton, Long> {
    Optional<Karton> findByPacijent_Id(Long pacijentId);
}
