package com.spring.service;

import java.util.ArrayList;
import java.util.List;

import com.spring.dto.StaffDto;

public interface StaffService {
	public ArrayList<StaffDto> getList();

	public StaffDto read(long bno);

	public void remove(Long bno);

	public void restore(Long bno);

	public List<StaffDto> getDeletedList();

	public StaffDto login(String staffId, String password);

	public void update(StaffDto staffDto);

}
