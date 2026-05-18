package com.euprava.zdravstvo.client;

import com.euprava.zdravstvo.exception.ConflictException;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class OtvoreniPodaciClient {

    private final String baseUrl;
    private final String apiKey;
    private RestClient http;

    public OtvoreniPodaciClient(@Value("${euprava.otvoreni-podaci.base-url}") String baseUrl,
                                @Value("${euprava.otvoreni-podaci.api-key}") String apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    @PostConstruct
    void init() {
        this.http = RestClient.builder().baseUrl(baseUrl).build();
        log.info("OtvoreniPodaciClient inicijalizovan za base-url={}", baseUrl);
    }

    public JsonNode objaviSkup(SkupImportRequest req) {
        try {
            return http.post()
                    .uri("/api/dataset/import")
                    .header("X-Api-Key", apiKey)
                    .header("Content-Type", "application/json")
                    .body(req)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new ConflictException("Otvoreni Podaci servis odbio zahtev (neispravan API ključ)");
        } catch (HttpClientErrorException e) {
            throw new ConflictException("Otvoreni Podaci servis odbio zahtev: " + e.getStatusCode() + " — " + e.getResponseBodyAsString());
        } catch (HttpServerErrorException | ResourceAccessException e) {
            throw new OtvoreniPodaciNedostupanException("Otvoreni Podaci servis trenutno nije dostupan (" + baseUrl + "): " + e.getMessage());
        }
    }

    /**
     * Razmena 2: vraća listu skupova po izvoru sa SVIM statusima (NACRT, NA_ODOBRENJU, OBJAVLJEN, ODBIJEN).
     * Koristi X-Api-Key zaštićen endpoint /api/dataset/po-izvoru (javni /pretraga vraća samo OBJAVLJEN anonimcima).
     */
    public JsonNode pretraziPoIzvoru(String izvor, int size) {
        try {
            return http.get()
                    .uri(uri -> uri.path("/api/dataset/po-izvoru")
                            .queryParam("izvor", izvor)
                            .queryParam("size", size)
                            .build())
                    .header("X-Api-Key", apiKey)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (HttpServerErrorException | ResourceAccessException e) {
            throw new OtvoreniPodaciNedostupanException("Otvoreni Podaci servis trenutno nije dostupan (" + baseUrl + "): " + e.getMessage());
        }
    }

    /** Razmena 3: povlači (briše) prethodno objavljen skup. */
    public void povuciSkup(Long opSkupId) {
        try {
            http.delete()
                    .uri("/api/dataset/import/{id}", opSkupId)
                    .header("X-Api-Key", apiKey)
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException.NotFound e) {
            throw new ConflictException("Skup #" + opSkupId + " ne postoji na OP servisu");
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new ConflictException("OP servis odbio povlačenje (neispravan API ključ)");
        } catch (HttpServerErrorException | ResourceAccessException e) {
            throw new OtvoreniPodaciNedostupanException("Otvoreni Podaci servis trenutno nije dostupan (" + baseUrl + "): " + e.getMessage());
        }
    }
}
