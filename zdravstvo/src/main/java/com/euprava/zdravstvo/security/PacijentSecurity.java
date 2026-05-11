package com.euprava.zdravstvo.security;

import com.euprava.zdravstvo.repository.PacijentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component("pacijentSecurity")
@RequiredArgsConstructor
public class PacijentSecurity {

    private final PacijentRepository pacijenti;

    @Transactional(readOnly = true)
    public boolean jeVlasnikKartona(Long pacijentId, String email) {
        return pacijenti.findById(pacijentId)
                .map(p -> p.getKorisnik().getEmail().equalsIgnoreCase(email))
                .orElse(false);
    }
}
