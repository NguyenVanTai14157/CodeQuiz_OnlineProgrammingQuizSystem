package com.codequiz.service;

import com.codequiz.dto.QuestionDto;
import java.util.List;

public interface QuestionService {
    QuestionDto createQuestion(QuestionDto questionDto);
    QuestionDto updateQuestion(Long id, QuestionDto questionDto);
    void deleteQuestion(Long id);
    QuestionDto getQuestionById(Long id);
    List<QuestionDto> getQuestionsBySubject(Long subjectId);
    List<QuestionDto> getAllQuestions();
}
