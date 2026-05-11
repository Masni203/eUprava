package com.euprava.zdravstvo.controller;

import com.euprava.zdravstvo.dto.BolnicaDTO;
import com.euprava.zdravstvo.dto.MkbKodDTO;
import com.euprava.zdravstvo.dto.SpecijalizacijaDTO;
import com.euprava.zdravstvo.mapper.SifarniciMapper;
import com.euprava.zdravstvo.repository.BolnicaRepository;
import com.euprava.zdravstvo.repository.MkbKodRepository;
import com.euprava.zdravstvo.repository.SpecijalizacijaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Šifarnici", description = "Specijalizacije, bolnice, MKB-10")
public class SifarniciController {

    private final SpecijalizacijaRepository spec;
    private final BolnicaRepository bolnice;
    private final MkbKodRepository mkb;
    private final SifarniciMapper mapper;

    @GetMapping("/specijalizacije")
    @Operation(summary = "Lista svih specijalizacija")
    public ResponseEntity<List<SpecijalizacijaDTO>> listSpecijalizacije() {
        return ResponseEntity.ok(mapper.toSpecDtos(spec.findAll()));
    }

    @GetMapping("/bolnice")
    @Operation(summary = "Lista svih bolnica")
    public ResponseEntity<List<BolnicaDTO>> listBolnice() {
        return ResponseEntity.ok(mapper.toBolnicaDtos(bolnice.findAll()));
    }

    @GetMapping("/mkb")
    @Operation(summary = "Lista MKB-10 kodova; opcioni parametar q traži po šifri ili nazivu")
    public ResponseEntity<List<MkbKodDTO>> listMkb(@RequestParam(required = false) String q) {
        var lista = (q == null || q.isBlank())
                ? mkb.findAll()
                : mkb.findTop10BySifraStartingWithIgnoreCaseOrNazivContainingIgnoreCase(q.trim(), q.trim());
        return ResponseEntity.ok(mapper.toMkbDtos(lista));
    }
}
