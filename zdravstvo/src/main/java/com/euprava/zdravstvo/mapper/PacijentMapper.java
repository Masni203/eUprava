package com.euprava.zdravstvo.mapper;

import com.euprava.zdravstvo.dto.PacijentDTO;
import com.euprava.zdravstvo.model.Pacijent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PacijentMapper {

    @Mapping(target = "ime",     source = "korisnik.ime")
    @Mapping(target = "prezime", source = "korisnik.prezime")
    @Mapping(target = "email",   source = "korisnik.email")
    @Mapping(target = "aktivan", source = "korisnik.aktivan")
    PacijentDTO toDto(Pacijent p);
}
