package com.codequiz.service;

import com.codequiz.dto.ExamDto;
import com.codequiz.dto.ExamSummaryDto;
import com.codequiz.dto.ExamSubmissionDto;
import com.codequiz.dto.ExamResultDto;
import java.util.List;

public interface ExamService {
    ExamDto createExam(ExamDto examDto);
    ExamDto updateExam(Long id, ExamDto examDto);
    void deleteExam(Long id);
    ExamDto getExamById(Long id);
    List<ExamSummaryDto> getAllExams();
    List<ExamSummaryDto> getPublishedExams();
    
    ExamResultDto submitExam(Long userId, ExamSubmissionDto submission);
    List<ExamResultDto> getUserHistory(Long userId);
}
