package com.euprava.zdravstvo.mapper;

import com.euprava.zdravstvo.dto.PregledDTO;
import com.euprava.zdravstvo.model.Pregled;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PregledMapper {

    @Mapping(target = "pacijentId",      source = "pacijent.id")
    @Mapping(target = "pacijentIme",     source = "pacijent.korisnik.ime")
    @Mapping(target = "pacijentPrezime", source = "pacijent.korisnik.prezime")
    @Mapping(target = "pacijentJmbg",    source = "pacijent.jmbg")
    @Mapping(target = "doktorId",        source = "doktor.id")
    @Mapping(target = "doktorIme",       source = "doktor.korisnik.ime")
    @Mapping(target = "doktorPrezime",   source = "doktor.korisnik.prezime")
    @Mapping(target = "specijalizacija", source = "doktor.specijalizacija.naziv")
    PregledDTO toDto(Pregled p);
}
