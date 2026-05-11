package com.euprava.zdravstvo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * SSO: token izdat na bilo kom servisu (Zdravstvo / OP) prolazi ovde — deljeni
 * potpisni ključ + claims-only autentifikacija. Lokalni Korisnik nije obavezan.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final CustomUserDetailsService users;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        String token = header.substring(7);

        String email;
        String uloga;
        try {
            if (!jwt.isValid(token)) { chain.doFilter(request, response); return; }
            var claims = jwt.extractAllClaims(token);
            email = claims.getSubject();
            uloga = claims.get("uloga", String.class);
        } catch (Exception e) {
            chain.doFilter(request, response);
            return;
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails details = null;
            try {
                details = users.loadUserByUsername(email);
            } catch (UsernameNotFoundException ignored) {
                // Korisnik nije lokalan (token izdat na drugom servisu) — gradi UserDetails iz claim-ova.
            }
            if (details == null && uloga != null) {
                details = new User(email, "", true, true, true, true,
                        List.of(new SimpleGrantedAuthority("ROLE_" + uloga)));
            }
            if (details != null) {
                var auth = new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(request, response);
    }
}
