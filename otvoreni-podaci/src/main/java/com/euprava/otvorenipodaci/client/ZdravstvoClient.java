package com.euprava.otvorenipodaci.client;

import com.euprava.otvorenipodaci.model.TipNotifikacije;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

/**
 * Razmena #4: OP -> Zdravstvo. Posle odobravanja/odbijanja skupa OP
 * obaveštava Zdravstvo da je objavi prošla. Zdravstvo gura in-app
 * notifikaciju autoru (ili svim adminima ako autor nije poznat).
 *
 * Komunikacija je zaštićena deljenim X-Api-Key (isti kao za import #2).
 * Neuspeh poziva se loguje, ali ne propagira — odobravanje na OP-u
 * je autoritativno čak i ako Zdravstvo trenutno nije dostupno.
 */
@Component
public class ZdravstvoClient {

    private static final Logger log = LoggerFactory.getLogger(ZdravstvoClient.class);

    private final RestClient http;
    private final String apiKey;

    public ZdravstvoClient(
            @Value("${euprava.zdravstvo.base-url}") String baseUrl,
            @Value("${euprava.zdravstvo.api-key}") String apiKey
    ) {
        this.http = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    /**
     * Pošalje in-app notifikaciju u Zdravstvo. Ako je email null, Zdravstvo
     * gura notifikaciju svim administratorima.
     */
    public void posaljiNotifikaciju(String email, TipNotifikacije tip, String naslov, String tekst, String linkRuta) {
        Map<String, Object> body = new HashMap<>();
        if (email != null) body.put("email", email);
        body.put("tip", tip.name());
        body.put("naslov", naslov);
        body.put("tekst", tekst);
        if (linkRuta != null) body.put("linkRuta", linkRuta);

        try {
            http.post()
                .uri("/api/notifikacije/in")
                .header("X-Api-Key", apiKey)
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .toBodilessEntity();
            log.info("Razmena #4: notifikacija poslata Zdravstvu ({}, {})", tip, naslov);
        } catch (Exception e) {
            // OP odobravanje je autoritativno — ne rušimo transakciju ako Zd ne odgovara.
            log.warn("Razmena #4 neuspešna ({}): {}", e.getClass().getSimpleName(), e.getMessage());
        }
    }
}
