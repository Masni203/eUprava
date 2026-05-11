package com.euprava.zdravstvo.security;

import com.euprava.zdravstvo.repository.KorisnikRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final KorisnikRepository repo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var k = repo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Korisnik nije pronađen: " + email));
        return new User(
                k.getEmail(),
                k.getLozinka(),
                k.isAktivan(), true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_" + k.getUloga().name()))
        );
    }
}
