package com.euprava.otvorenipodaci.repository;

import com.euprava.otvorenipodaci.model.Skup;
import com.euprava.otvorenipodaci.model.StatusSkupa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface SkupRepository extends JpaRepository<Skup, Long>, JpaSpecificationExecutor<Skup> {

    List<Skup> findTop10ByStatusOrderByBrojPreuzimanjaDesc(StatusSkupa status);
    long countByStatus(StatusSkupa status);

    static Specification<Skup> pretraga(StatusSkupa status, String kategorija, String opstina, Integer godina, String q, String izvor) {
        return (root, query, cb) -> {
            var preds = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (status     != null) preds.add(cb.equal(root.get("status"), status));
            if (kategorija != null && !kategorija.isBlank()) preds.add(cb.equal(root.get("kategorija").get("naziv"), kategorija));
            if (opstina    != null && !opstina.isBlank())    preds.add(cb.equal(root.get("opstina"), opstina));
            if (izvor      != null && !izvor.isBlank())      preds.add(cb.equal(root.get("izvor").get("naziv"), izvor));
            if (godina     != null) preds.add(cb.equal(root.get("godina"), godina));
            if (q          != null && !q.isBlank()) {
                String like = "%" + q.toLowerCase() + "%";
                preds.add(cb.or(
                        cb.like(cb.lower(root.get("naslov")), like),
                        cb.like(cb.lower(root.get("opis")),   like)
                ));
            }
            return cb.and(preds.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
