package com.euprava.otvorenipodaci.dto;

public record AuthResponse(
        String token,
        long expiresInMs,
        Long korisnikId,
        String email,
        String ime,
        String prezime,
        String uloga
) {}
