package com.euprava.zdravstvo.service;

import com.euprava.zdravstvo.client.OtvoreniPodaciClient;
import com.euprava.zdravstvo.client.SkupImportRequest;
import com.euprava.zdravstvo.exception.ConflictException;
import com.euprava.zdravstvo.repository.DijagnozaRepository;
import com.euprava.zdravstvo.repository.PregledRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Anonimno agregira podatke iz Zdravstva i objavljuje ih u Otvorene Podatke.
 * Bez JMBG-a, imena, adrese — samo grupisani brojevi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StatistikaService {

    private static final ObjectMapper JSON = new ObjectMapper();

    private final PregledRepository pregledi;
    private final DijagnozaRepository dijagnoze;
    private final OtvoreniPodaciClient client;

    public JsonNode objavljene() {
        return client.pretraziPoIzvoru("MZ RS", 100);
    }

    public void povuciObjavljen(Long opSkupId) {
        client.povuciSkup(opSkupId);
    }

    @Transactional(readOnly = true)
    public JsonNode objavi(String tip, String period) {
        LocalDate doDatuma = LocalDate.now();
        LocalDate odDatuma = pocetakPerioda(period, doDatuma);

        SkupImportRequest req = switch (tip == null ? "" : tip.toLowerCase()) {
            case "agregat" -> agregatPoOpstini(odDatuma, doDatuma, period);
            case "top"     -> topDijagnoze(odDatuma, doDatuma, period);
            default -> throw new ConflictException("Nepoznat tip statistike (agregat|top): " + tip);
        };
        log.info("Šaljem statistiku tipa '{}' za period {}–{} ka OP", tip, odDatuma, doDatuma);
        return client.objaviSkup(req);
    }

    private SkupImportRequest agregatPoOpstini(LocalDate od, LocalDate doDat, String period) {
        var grupe = pregledi.findAllByDatumBetween(od, doDat).stream()
                .collect(Collectors.groupingBy(
                        p -> List.of(
                                opstinaIliNepoznato(p.getPacijent().getGrad()),
                                p.getDoktor().getSpecijalizacija().getNaziv()
                        ),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        List<List<Object>> redovi = grupe.entrySet().stream()
                .sorted(Map.Entry.<List<String>, Long>comparingByValue().reversed())
                .map(e -> List.<Object>of(e.getKey().get(0), e.getKey().get(1), e.getValue()))
                .toList();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("tip", "agregat");
        payload.put("kolone", List.of("opstina", "specijalizacija", "broj"));
        payload.put("redovi", redovi);

        return new SkupImportRequest(
                "Pregledi po opštinama — " + period + " do " + doDat,
                "Anonimizovani agregat broja pregleda po opštini i specijalizaciji za period " + od + " do " + doDat + ". Generisano iz sistema eUprava — Zdravstvo.",
                "Pregledi",
                "MZ RS",
                doDat.getYear(),
                "Sve",
                doDat,
                (long) redovi.size(),
                Set.of("CSV", "JSON"),
                serialize(payload)
        );
    }

    private SkupImportRequest topDijagnoze(LocalDate od, LocalDate doDat, String period) {
        var grupe = dijagnoze.findAllByDatumBetween(od, doDat).stream()
                .collect(Collectors.groupingBy(d -> d.getMkbKod(), Collectors.counting()));

        List<List<Object>> redovi = grupe.entrySet().stream()
                .sorted(Map.Entry.<com.euprava.zdravstvo.model.MkbKod, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> List.<Object>of(e.getKey().getSifra(), e.getKey().getNaziv(), e.getValue()))
                .toList();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("tip", "top");
        payload.put("kolone", List.of("mkb", "naziv", "broj"));
        payload.put("redovi", redovi);

        return new SkupImportRequest(
                "Najčešće dijagnoze (MKB-10) — " + period + " do " + doDat,
                "Top 10 dijagnoza po MKB-10 klasifikaciji za period " + od + " do " + doDat + ". Bez ličnih podataka.",
                "Dijagnoze",
                "MZ RS",
                doDat.getYear(),
                "Sve",
                doDat,
                (long) redovi.size(),
                Set.of("CSV", "JSON"),
                serialize(payload)
        );
    }

    private static String opstinaIliNepoznato(String grad) {
        return (grad == null || grad.isBlank()) ? "Nepoznato" : grad;
    }

    private static LocalDate pocetakPerioda(String period, LocalDate today) {
        return switch (period == null ? "" : period.toLowerCase()) {
            case "nedelja" -> today.minusDays(7);
            case "mesec"   -> today.minusDays(30);
            case "godina"  -> today.minusDays(365);
            default -> throw new ConflictException("Nepoznat period (nedelja|mesec|godina): " + period);
        };
    }

    private static String serialize(Object o) {
        try {
            return JSON.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            throw new ConflictException("Greška pri serijalizaciji payload-a: " + e.getMessage());
        }
    }
}
