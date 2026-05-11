package com.euprava.otvorenipodaci.mapper;

import com.euprava.otvorenipodaci.dto.SkupDTO;
import com.euprava.otvorenipodaci.model.Skup;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = SifarniciMapper.class)
public interface SkupMapper {

    SkupDTO toDto(Skup s);
}
