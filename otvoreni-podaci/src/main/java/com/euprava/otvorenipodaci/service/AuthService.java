package com.euprava.otvorenipodaci.service;

import com.euprava.otvorenipodaci.dto.AuthResponse;
import com.euprava.otvorenipodaci.dto.LoginRequest;
import com.euprava.otvorenipodaci.dto.RegisterRequest;
import com.euprava.otvorenipodaci.exception.ConflictException;
import com.euprava.otvorenipodaci.model.Korisnik;
import com.euprava.otvorenipodaci.model.UlogaOP;
import com.euprava.otvorenipodaci.repository.KorisnikRepository;
import com.euprava.otvorenipodaci.security.CustomUserDetailsService;
import com.euprava.otvorenipodaci.security.JwtService;
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
    public AuthResponse registerKorisnik(RegisterRequest req) {
        if (korisnici.existsByEmail(req.email())) {
            throw new ConflictException("Email već postoji: " + req.email());
        }
        Korisnik k = Korisnik.builder()
                .email(req.email())
                .lozinka(encoder.encode(req.lozinka()))
                .ime(req.ime())
                .prezime(req.prezime())
                .uloga(UlogaOP.KORISNIK_OP)
                .aktivan(true)
                .kreiran(LocalDateTime.now())
                .build();
        k = korisnici.save(k);
        return buildResponse(k);
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
