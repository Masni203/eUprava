package com.euprava.otvorenipodaci.controller;

import com.euprava.otvorenipodaci.dto.AuthResponse;
import com.euprava.otvorenipodaci.dto.LoginRequest;
import com.euprava.otvorenipodaci.dto.RegisterRequest;
import com.euprava.otvorenipodaci.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Prijava i registracija OP korisnika")
public class AuthController {

    private final AuthService auth;

    @PostMapping("/login")
    @Operation(summary = "Prijava korisnika")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(auth.login(req));
    }

    @PostMapping("/register")
    @Operation(summary = "Registracija korisnika OP (samo KORISNIK_OP uloga je samouslužna)")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(auth.registerKorisnik(req));
    }
}
