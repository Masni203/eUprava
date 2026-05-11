package com.euprava.zdravstvo.repository;

import com.euprava.zdravstvo.model.Bolnica;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BolnicaRepository extends JpaRepository<Bolnica, String> {
}
