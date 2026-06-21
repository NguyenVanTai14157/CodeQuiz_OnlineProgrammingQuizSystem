package com.codequiz.service.impl;

import com.codequiz.dto.SubjectDto;
import com.codequiz.entity.Subject;
import com.codequiz.repository.SubjectRepository;
import com.codequiz.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubjectServiceImpl implements SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private com.codequiz.repository.ExamRepository examRepository;

    @Override
    public SubjectDto createSubject(SubjectDto subjectDto) {
        Subject subject = Subject.builder()
                .subjectName(subjectDto.getSubjectName())
                .description(subjectDto.getDescription())
                .build();
        Subject saved = subjectRepository.save(subject);
        return mapToDto(saved);
    }

    @Override
    public List<SubjectDto> createSubjects(List<SubjectDto> subjectDtos) {
        List<Subject> subjects = subjectDtos.stream()
                .map(dto -> Subject.builder()
                        .subjectName(dto.getSubjectName())
                        .description(dto.getDescription())
                        .build())
                .collect(Collectors.toList());
        
        List<Subject> savedSubjects = subjectRepository.saveAll(subjects);
        return savedSubjects.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public SubjectDto updateSubject(Long id, SubjectDto subjectDto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        subject.setSubjectName(subjectDto.getSubjectName());
        subject.setDescription(subjectDto.getDescription());
        Subject updated = subjectRepository.save(subject);
        return mapToDto(updated);
    }

    @Override
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        
        // Before deleting subject, we must remove all its questions from any exams (ManyToMany)
        if (subject.getQuestions() != null) {
            subject.getQuestions().forEach(question -> {
                examRepository.findAll().forEach(exam -> {
                    if (exam.getQuestions().remove(question)) {
                        exam.setTotalQuestions(exam.getQuestions().size());
                        examRepository.save(exam);
                    }
                });
            });
        }
        
        subjectRepository.delete(subject);
    }

    @Override
    public SubjectDto getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        return mapToDto(subject);
    }

    @Override
    public List<SubjectDto> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private SubjectDto mapToDto(Subject subject) {
        return SubjectDto.builder()
                .id(subject.getId())
                .subjectName(subject.getSubjectName())
                .description(subject.getDescription())
                .build();
    }
}
