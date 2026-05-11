package com.euprava.zdravstvo.service;

import com.euprava.zdravstvo.dto.IzvestajDTO;
import com.euprava.zdravstvo.exception.ConflictException;
import com.euprava.zdravstvo.repository.DijagnozaRepository;
import com.euprava.zdravstvo.repository.PregledRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IzvestajService {

    private final PregledRepository pregledi;
    private final DijagnozaRepository dijagnoze;

    @Transactional(readOnly = true)
    public IzvestajDTO generisi(String period) {
        LocalDate doDatuma = LocalDate.now();
        LocalDate odDatuma = switch (period == null ? "" : period.toLowerCase()) {
            case "nedelja" -> doDatuma.minusDays(7);
            case "mesec"   -> doDatuma.minusDays(30);
            case "godina"  -> doDatuma.minusDays(365);
            default -> throw new ConflictException("Nepoznat period (nedelja|mesec|godina): " + period);
        };

        var p = pregledi.findAllByDatumBetween(odDatuma, doDatuma);
        Map<String, Long> poStatusu = p.stream()
                .collect(Collectors.groupingBy(x -> x.getStatus().name(), Collectors.counting()));
        Map<String, Long> poSpecijalizaciji = p.stream()
                .collect(Collectors.groupingBy(
                        x -> x.getDoktor().getSpecijalizacija().getNaziv(),
                        LinkedHashMap::new,
                        Collectors.counting()));

        List<IzvestajDTO.MkbStat> top = dijagnoze.findAllByDatumBetween(odDatuma, doDatuma).stream()
                .collect(Collectors.groupingBy(d -> d.getMkbKod(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<com.euprava.zdravstvo.model.MkbKod, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> new IzvestajDTO.MkbStat(e.getKey().getSifra(), e.getKey().getNaziv(), e.getValue()))
                .toList();

        return new IzvestajDTO(period, odDatuma, doDatuma, p.size(), poStatusu, poSpecijalizaciji, top);
    }

    public String toCsv(IzvestajDTO i) {
        StringBuilder sb = new StringBuilder();
        sb.append("# Izveštaj: ").append(i.period()).append(" (").append(i.odDatuma()).append(" → ").append(i.doDatuma()).append(")\n");
        sb.append("# Ukupan broj pregleda: ").append(i.ukupanBrojPregleda()).append("\n\n");

        sb.append("Status,Broj\n");
        i.pregledaPoStatusu().forEach((k, v) -> sb.append(k).append(",").append(v).append("\n"));
        sb.append("\n");

        sb.append("Specijalizacija,Broj\n");
        i.pregledaPoSpecijalizaciji().forEach((k, v) -> sb.append(csvEscape(k)).append(",").append(v).append("\n"));
        sb.append("\n");

        sb.append("MKB,Naziv,Broj\n");
        i.najcesceDijagnoze().forEach(m -> sb.append(m.mkbSifra()).append(",").append(csvEscape(m.mkbNaziv())).append(",").append(m.broj()).append("\n"));
        return sb.toString();
    }

    private static String csvEscape(String v) {
        if (v == null) return "";
        if (v.contains(",") || v.contains("\"") || v.contains("\n")) {
            return "\"" + v.replace("\"", "\"\"") + "\"";
        }
        return v;
    }
}
