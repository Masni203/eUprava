package com.euprava.zdravstvo.repository;

import com.euprava.zdravstvo.model.Pregled;
import com.euprava.zdravstvo.model.StatusPregleda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;

public interface PregledRepository extends JpaRepository<Pregled, Long>, JpaSpecificationExecutor<Pregled> {
    Page<Pregled> findAllByPacijent_Id(Long pacijentId, Pageable pageable);
    Page<Pregled> findAllByDoktor_Id(Long doktorId, Pageable pageable);
    List<Pregled> findByPacijent_Id(Long pacijentId);
    List<Pregled> findByDoktor_Id(Long doktorId);
    List<Pregled> findAllByDoktor_IdAndDatum(Long doktorId, LocalDate datum);
    boolean existsByDoktor_IdAndDatumAndVreme(Long doktorId, LocalDate datum, java.time.LocalTime vreme);
    long countByStatus(StatusPregleda status);
    List<Pregled> findAllByDatumBetween(LocalDate od, LocalDate doDatuma);

    static Specification<Pregled> filter(Long pacijentId, Long doktorId, LocalDate datum, StatusPregleda status) {
        return (root, query, cb) -> {
            var preds = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (pacijentId != null) preds.add(cb.equal(root.get("pacijent").get("id"), pacijentId));
            if (doktorId   != null) preds.add(cb.equal(root.get("doktor").get("id"),   doktorId));
            if (datum      != null) preds.add(cb.equal(root.get("datum"), datum));
            if (status     != null) preds.add(cb.equal(root.get("status"), status));
            return cb.and(preds.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
