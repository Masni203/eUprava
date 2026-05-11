package com.euprava.zdravstvo.mapper;

import com.euprava.zdravstvo.dto.BolnicaDTO;
import com.euprava.zdravstvo.dto.MkbKodDTO;
import com.euprava.zdravstvo.dto.SpecijalizacijaDTO;
import com.euprava.zdravstvo.model.Bolnica;
import com.euprava.zdravstvo.model.MkbKod;
import com.euprava.zdravstvo.model.Specijalizacija;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SifarniciMapper {

    SpecijalizacijaDTO toDto(Specijalizacija e);
    List<SpecijalizacijaDTO> toSpecDtos(List<Specijalizacija> list);

    BolnicaDTO toDto(Bolnica e);
    List<BolnicaDTO> toBolnicaDtos(List<Bolnica> list);

    MkbKodDTO toDto(MkbKod e);
    List<MkbKodDTO> toMkbDtos(List<MkbKod> list);
}
