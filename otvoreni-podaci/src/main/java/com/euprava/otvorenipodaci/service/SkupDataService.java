package com.euprava.otvorenipodaci.service;

import com.euprava.otvorenipodaci.dto.GrafikonDTO;
import com.euprava.otvorenipodaci.exception.NotFoundException;
import com.euprava.otvorenipodaci.model.Skup;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Sintetizuje redove podataka iz Skup.payload metadata-e (tip + kolone).
 * Random je seedovan id-om skupa pa su rezultati stabilni.
 */
@Service
@RequiredArgsConstructor
public class SkupDataService {

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final List<String> OPSTINE = List.of("Beograd", "Novi Sad", "Niš", "Kragujevac", "Subotica", "Zrenjanin", "Pančevo", "Čačak");
    private static final List<String> SPECIJALIZACIJE = List.of("Opšta praksa", "Kardiologija", "Pedijatrija", "Neurologija", "Dermatologija", "Ortopedija");
    private static final List<String[]> MKB = List.of(
            new String[]{"I10", "Hipertenzija"},
            new String[]{"J06.9", "Akutna respiratorna infekcija"},
            new String[]{"E11.9", "Diabetes mellitus tip 2"},
            new String[]{"M54.5", "Lumbalgija"},
            new String[]{"K29.7", "Gastritis"},
            new String[]{"R51", "Glavobolja"},
            new String[]{"F32.9", "Depresivna epizoda"},
            new String[]{"J45.9", "Astma"}
    );
    private static final List<String> STAROSNE = List.of("0-18", "19-35", "36-50", "51-65", "65+");
    private static final List<String> ATC = List.of("A — Digestivni sistem", "C — Kardiovaskularni", "J — Antibiotici", "N — Nervni sistem", "R — Respiratorni");
    private static final List<String> MESECI = List.of("Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec");

    public Meta meta(Skup s) {
        try {
            if (s.getPayload() == null || s.getPayload().isBlank()) {
                return new Meta("agregat", List.of("kategorija", "broj"));
            }
            JsonNode root = JSON.readTree(s.getPayload());
            String tip = root.path("tip").asText("agregat");
            JsonNode kolone = root.path("kolone");
            List<String> cols = new ArrayList<>();
            if (kolone.isArray()) kolone.forEach(n -> cols.add(n.asText()));
            return new Meta(tip, cols.isEmpty() ? List.of("kategorija", "broj") : cols);
        } catch (Exception e) {
            return new Meta("agregat", List.of("kategorija", "broj"));
        }
    }

    public List<Map<String, Object>> sintetisiRedove(Skup s, int max) {
        Meta m = meta(s);
        var prave = redoviIzPayloada(s, m);
        if (!prave.isEmpty()) {
            return prave.size() > max ? prave.subList(0, max) : prave;
        }

        Random rnd = new Random(s.getId() == null ? 0 : s.getId());
        int rows = Math.min(max, s.getBrojRedova() == null ? 12 : s.getBrojRedova().intValue());
        if (rows <= 0) rows = 12;

        List<Map<String, Object>> out = new ArrayList<>();
        for (int i = 0; i < rows; i++) {
            Map<String, Object> r = new LinkedHashMap<>();
            for (String col : m.kolone()) {
                r.put(col, vrednostZaKolonu(col, m.tip(), i, rnd));
            }
            out.add(r);
        }
        return out;
    }

    /** Ako payload ima "redovi" — koristi ih (podaci uvezeni iz drugog servisa). */
    private List<Map<String, Object>> redoviIzPayloada(Skup s, Meta m) {
        try {
            if (s.getPayload() == null || s.getPayload().isBlank()) return List.of();
            JsonNode root = JSON.readTree(s.getPayload());
            JsonNode redovi = root.path("redovi");
            if (!redovi.isArray() || redovi.isEmpty()) return List.of();

            List<Map<String, Object>> out = new ArrayList<>();
            for (JsonNode r : redovi) {
                Map<String, Object> row = new LinkedHashMap<>();
                if (r.isArray()) {
                    for (int i = 0; i < m.kolone().size() && i < r.size(); i++) {
                        row.put(m.kolone().get(i), JSON.treeToValue(r.get(i), Object.class));
                    }
                } else if (r.isObject()) {
                    for (String col : m.kolone()) {
                        row.put(col, JSON.treeToValue(r.path(col), Object.class));
                    }
                }
                out.add(row);
            }
            return out;
        } catch (Exception e) {
            return List.of();
        }
    }

    public GrafikonDTO grafikon(Skup s) {
        if (s == null) throw new NotFoundException("Skup je null");
        Meta m = meta(s);
        List<Map<String, Object>> redovi = sintetisiRedove(s, 12);
        if (redovi.isEmpty() || m.kolone().size() < 2) {
            return new GrafikonDTO("bar", s.getNaslov(), List.of(), List.of());
        }
        String labelKol = m.kolone().get(0);
        String dataKol  = m.kolone().get(m.kolone().size() - 1);
        List<String> labels = redovi.stream().map(r -> String.valueOf(r.get(labelKol))).distinct().toList();

        // 3+ kolone → grupiši po srednjoj koloni kao seriju (matrica i 3-kolonski agregat)
        if (m.kolone().size() >= 3 && !"vremenski_niz".equals(m.tip())) {
            String groupKol = m.kolone().get(1);
            List<String> grupe = redovi.stream().map(r -> String.valueOf(r.get(groupKol))).distinct().toList();
            List<GrafikonDTO.Series> series = new ArrayList<>();
            for (String g : grupe) {
                List<Number> data = new ArrayList<>();
                for (String l : labels) {
                    Number v = redovi.stream()
                            .filter(r -> g.equals(r.get(groupKol)) && l.equals(r.get(labelKol)))
                            .map(r -> (Number) r.get(dataKol))
                            .findFirst().orElse(0);
                    data.add(v);
                }
                series.add(new GrafikonDTO.Series(g, data));
            }
            return new GrafikonDTO("bar", s.getNaslov(), labels, series);
        }

        String chartTip = "vremenski_niz".equals(m.tip()) ? "line" : "bar";
        List<Number> data = redovi.stream().map(r -> (Number) r.get(dataKol)).toList();
        return new GrafikonDTO(chartTip, s.getNaslov(), labels, List.of(new GrafikonDTO.Series(dataKol, data)));
    }

    public String toCsv(List<Map<String, Object>> redovi, List<String> kolone) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.join(",", kolone)).append("\n");
        for (var r : redovi) {
            for (int i = 0; i < kolone.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(csvEsc(String.valueOf(r.get(kolone.get(i)))));
            }
            sb.append("\n");
        }
        return sb.toString();
    }

    public String toJson(List<Map<String, Object>> redovi) {
        try {
            return JSON.writerWithDefaultPrettyPrinter().with(SerializationFeature.INDENT_OUTPUT).writeValueAsString(redovi);
        } catch (Exception e) {
            return "[]";
        }
    }

    private Object vrednostZaKolonu(String col, String tip, int i, Random rnd) {
        return switch (col.toLowerCase()) {
            case "opstina" -> OPSTINE.get(i % OPSTINE.size());
            case "specijalizacija" -> SPECIJALIZACIJE.get(rnd.nextInt(SPECIJALIZACIJE.size()));
            case "mkb" -> MKB.get(i % MKB.size())[0];
            case "naziv" -> "top".equals(tip) ? MKB.get(i % MKB.size())[1] : "Stavka " + (i + 1);
            case "starosna_grupa" -> STAROSNE.get(i % STAROSNE.size());
            case "tip" -> "kontrolni|hitan|redovan".split("\\|")[i % 3];
            case "atc" -> ATC.get(i % ATC.size());
            case "mesec" -> MESECI.get(i % MESECI.size()) + " '26";
            case "ustanova" -> "Bolnica " + (char)('A' + (i % 8));
            case "broj", "lezajevi", "hospitalizacije", "dani" -> "top".equals(tip) ? 5000 - i * 350 + rnd.nextInt(300) : 100 + rnd.nextInt(4900);
            case "procenat", "odziv" -> Math.round((10 + rnd.nextDouble() * 80) * 10.0) / 10.0;
            default -> "v" + (i + 1);
        };
    }

    private static String csvEsc(String v) {
        if (v == null) return "";
        if (v.contains(",") || v.contains("\"") || v.contains("\n")) {
            return "\"" + v.replace("\"", "\"\"") + "\"";
        }
        return v;
    }

    public record Meta(String tip, List<String> kolone) {}
}
