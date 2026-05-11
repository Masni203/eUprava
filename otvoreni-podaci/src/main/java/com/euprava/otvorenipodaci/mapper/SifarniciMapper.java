package com.euprava.otvorenipodaci.mapper;

import com.euprava.otvorenipodaci.dto.IzvorDTO;
import com.euprava.otvorenipodaci.dto.KategorijaDTO;
import com.euprava.otvorenipodaci.model.Izvor;
import com.euprava.otvorenipodaci.model.Kategorija;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SifarniciMapper {

    KategorijaDTO toDto(Kategorija e);
    List<KategorijaDTO> toKategorijaDtos(List<Kategorija> list);

    IzvorDTO toDto(Izvor e);
    List<IzvorDTO> toIzvorDtos(List<Izvor> list);
}
