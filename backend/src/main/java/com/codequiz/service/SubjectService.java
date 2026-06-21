package com.codequiz.service;

import com.codequiz.dto.SubjectDto;
import java.util.List;

public interface SubjectService {
    SubjectDto createSubject(SubjectDto subjectDto);
    List<SubjectDto> createSubjects(List<SubjectDto> subjectDtos);
    SubjectDto updateSubject(Long id, SubjectDto subjectDto);
    void deleteSubject(Long id);
    SubjectDto getSubjectById(Long id);
    List<SubjectDto> getAllSubjects();
}
