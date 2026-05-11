package com.euprava.otvorenipodaci.config;

import com.euprava.otvorenipodaci.repository.KorisnikRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Zameni placeholder hash-eve iz data.sql sa pravim BCrypt(demo1234) pri startu.
 * Tako prototip iz frontend/ moze da se loguje sa "demo1234" lozinkom u dev/docker okruzenju.
 */
@Component
@Profile({"dev", "docker"})
@RequiredArgsConstructor
@Slf4j
public class PasswordSeedRunner implements ApplicationRunner {

    private static final String PLACEHOLDER_PREFIX = "$2a$10$placeholderHash";
    private static final String DEMO_PASSWORD = "demo1234";

    private final KorisnikRepository korisnici;
    private final PasswordEncoder encoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String hash = encoder.encode(DEMO_PASSWORD);
        long updated = korisnici.findAll().stream()
                .filter(k -> k.getLozinka() != null && k.getLozinka().startsWith(PLACEHOLDER_PREFIX))
                .peek(k -> k.setLozinka(hash))
                .map(korisnici::save)
                .count();
        if (updated > 0) {
            log.info("PasswordSeedRunner: postavljeno demo1234 za {} korisnika", updated);
        }
    }
}
