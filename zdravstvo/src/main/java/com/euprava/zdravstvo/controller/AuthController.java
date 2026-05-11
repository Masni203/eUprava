package com.euprava.zdravstvo.controller;

import com.euprava.zdravstvo.dto.AuthResponse;
import com.euprava.zdravstvo.dto.LoginRequest;
import com.euprava.zdravstvo.dto.RegisterRequest;
import com.euprava.zdravstvo.service.AuthService;
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
@Tag(name = "Auth", description = "Prijava i registracija pacijenata")
public class AuthController {

    private final AuthService auth;

    @PostMapping("/login")
    @Operation(summary = "Prijava korisnika (svih uloga)")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(auth.login(req));
    }

    @PostMapping("/register")
    @Operation(summary = "Registracija pacijenta (samo PACIJENT uloga je samouslužna)")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(auth.registerPacijent(req));
    }
}
