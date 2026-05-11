package com.euprava.otvorenipodaci.controller;

import com.euprava.otvorenipodaci.dto.IzvorDTO;
import com.euprava.otvorenipodaci.dto.KategorijaDTO;
import com.euprava.otvorenipodaci.mapper.SifarniciMapper;
import com.euprava.otvorenipodaci.repository.IzvorRepository;
import com.euprava.otvorenipodaci.repository.KategorijaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Šifarnici", description = "Kategorije i izvori (javno dostupno)")
public class SifarniciController {

    private final KategorijaRepository kategorije;
    private final IzvorRepository izvori;
    private final SifarniciMapper mapper;

    @GetMapping("/kategorije")
    @Operation(summary = "Lista svih kategorija (javno)")
    public ResponseEntity<List<KategorijaDTO>> listKategorije() {
        return ResponseEntity.ok(mapper.toKategorijaDtos(kategorije.findAll()));
    }

    @GetMapping("/izvori")
    @Operation(summary = "Lista svih izvora (javno)")
    public ResponseEntity<List<IzvorDTO>> listIzvori() {
        return ResponseEntity.ok(mapper.toIzvorDtos(izvori.findAll()));
    }
}
