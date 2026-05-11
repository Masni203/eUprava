package com.euprava.zdravstvo.mapper;

import com.euprava.zdravstvo.dto.DoktorDTO;
import com.euprava.zdravstvo.model.Doktor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = SifarniciMapper.class)
public interface DoktorMapper {

    @Mapping(target = "ime",     source = "korisnik.ime")
    @Mapping(target = "prezime", source = "korisnik.prezime")
    @Mapping(target = "email",   source = "korisnik.email")
    @Mapping(target = "aktivan", source = "korisnik.aktivan")
    DoktorDTO toDto(Doktor d);
}
