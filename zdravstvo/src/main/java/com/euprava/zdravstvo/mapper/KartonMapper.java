package com.euprava.zdravstvo.mapper;

import com.euprava.zdravstvo.dto.AlergijaDTO;
import com.euprava.zdravstvo.dto.DijagnozaDTO;
import com.euprava.zdravstvo.model.Alergija;
import com.euprava.zdravstvo.model.Dijagnoza;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface KartonMapper {

    AlergijaDTO toDto(Alergija a);
    List<AlergijaDTO> toAlergijaDtos(List<Alergija> list);

    @Mapping(target = "mkbSifra",      source = "mkbKod.sifra")
    @Mapping(target = "mkbNaziv",      source = "mkbKod.naziv")
    @Mapping(target = "doktorId",      source = "doktor.id")
    @Mapping(target = "doktorIme",     source = "doktor.korisnik.ime")
    @Mapping(target = "doktorPrezime", source = "doktor.korisnik.prezime")
    DijagnozaDTO toDto(Dijagnoza d);
    List<DijagnozaDTO> toDijagnozaDtos(List<Dijagnoza> list);
}
