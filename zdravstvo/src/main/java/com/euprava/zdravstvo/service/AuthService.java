package com.euprava.zdravstvo.service;

import com.euprava.zdravstvo.dto.AuthResponse;
import com.euprava.zdravstvo.dto.LoginRequest;
import com.euprava.zdravstvo.dto.RegisterRequest;
import com.euprava.zdravstvo.exception.ConflictException;
import com.euprava.zdravstvo.model.Karton;
import com.euprava.zdravstvo.model.Korisnik;
import com.euprava.zdravstvo.model.Pacijent;
import com.euprava.zdravstvo.model.Uloga;
import com.euprava.zdravstvo.repository.KartonRepository;
import com.euprava.zdravstvo.repository.KorisnikRepository;
import com.euprava.zdravstvo.repository.PacijentRepository;
import com.euprava.zdravstvo.security.CustomUserDetailsService;
import com.euprava.zdravstvo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final KorisnikRepository korisnici;
    private final PacijentRepository pacijenti;
    private final KartonRepository kartoni;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final AuthenticationManager authManager;
    private final CustomUserDetailsService userDetails;

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.lozinka())
        );
        Korisnik k = korisnici.findByEmail(req.email()).orElseThrow();
        return buildResponse(k);
    }

    @Transactional
    public AuthResponse registerPacijent(RegisterRequest req) {
        if (korisnici.existsByEmail(req.email())) {
            throw new ConflictException("Email već postoji: " + req.email());
        }
        if (pacijenti.findByJmbg(req.jmbg()).isPresent()) {
            throw new ConflictException("JMBG već postoji: " + req.jmbg());
        }

        Korisnik k = Korisnik.builder()
                .email(req.email())
                .lozinka(encoder.encode(req.lozinka()))
                .ime(req.ime())
                .prezime(req.prezime())
                .uloga(Uloga.PACIJENT)
                .aktivan(true)
                .kreiran(LocalDateTime.now())
                .build();
        k = korisnici.save(k);

        Pacijent p = Pacijent.builder()
                .korisnik(k)
                .jmbg(req.jmbg())
                .datumRodjenja(req.datumRodjenja())
                .grad(req.grad())
                .telefon(req.telefon())
                .build();
        p = pacijenti.save(p);

        kartoni.save(Karton.builder().pacijent(p).build());

        return buildResponse(k);
    }

    /** Generiše svež JWT za zadati Korisnik (koristi se posle profile update-a). */
    public String regenerateTokenFor(String email) {
        Korisnik k = korisnici.findByEmail(email).orElseThrow();
        var details = userDetails.loadUserByUsername(k.getEmail());
        return jwt.generate(details, Map.of(
                "uid", k.getId(),
                "uloga", k.getUloga().name(),
                "ime", k.getIme(),
                "prezime", k.getPrezime()
        ));
    }

    private AuthResponse buildResponse(Korisnik k) {
        var details = userDetails.loadUserByUsername(k.getEmail());
        String token = jwt.generate(details, Map.of(
                "uid", k.getId(),
                "uloga", k.getUloga().name(),
                "ime", k.getIme(),
                "prezime", k.getPrezime()
        ));
        return new AuthResponse(
                token,
                jwt.getExpirationMs(),
                k.getId(),
                k.getEmail(),
                k.getIme(),
                k.getPrezime(),
                k.getUloga().name()
        );
    }
}
