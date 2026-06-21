package com.codequiz.service.impl;

import com.codequiz.dto.AnswerDto;
import com.codequiz.dto.QuestionDto;
import com.codequiz.entity.Answer;
import com.codequiz.entity.Question;
import com.codequiz.entity.Subject;
import com.codequiz.repository.ExamRepository;
import com.codequiz.repository.QuestionRepository;
import com.codequiz.repository.SubjectRepository;
import com.codequiz.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionServiceImpl implements QuestionService {

    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ExamRepository examRepository;

    @Override
    @Transactional
    public QuestionDto createQuestion(QuestionDto questionDto) {
        Subject subject = subjectRepository.findById(questionDto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        Question question = Question.builder()
                .content(questionDto.getContent())
                .subject(subject)
                .difficultyLevel(questionDto.getDifficultyLevel())
                .build();

        if (questionDto.getAnswers() != null) {
            List<Answer> answers = questionDto.getAnswers().stream()
                    .map(aDto -> Answer.builder()
                            .answerContent(aDto.getAnswerContent())
                            .isCorrect(aDto.getIsCorrect())
                            .question(question)
                            .build())
                    .collect(Collectors.toList());
            question.setAnswers(answers);
        }

        Question saved = questionRepository.save(question);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public QuestionDto updateQuestion(Long id, QuestionDto questionDto) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        question.setContent(questionDto.getContent());
        question.setDifficultyLevel(questionDto.getDifficultyLevel());

        if (questionDto.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(questionDto.getSubjectId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            question.setSubject(subject);
        }

        if (questionDto.getAnswers() != null) {
            question.getAnswers().clear();
            List<Answer> newAnswers = questionDto.getAnswers().stream()
                    .map(aDto -> Answer.builder()
                            .answerContent(aDto.getAnswerContent())
                            .isCorrect(aDto.getIsCorrect())
                            .question(question)
                            .build())
                    .collect(Collectors.toList());
            question.getAnswers().addAll(newAnswers);
        }

        Question updated = questionRepository.save(question);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        
        // Clear references in exams (ManyToMany)
        examRepository.findAll().forEach(exam -> {
            if (exam.getQuestions().remove(question)) {
                exam.setTotalQuestions(exam.getQuestions().size());
                examRepository.save(exam);
            }
        });
        
        questionRepository.delete(question);
    }

    @Override
    public QuestionDto getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        return mapToDto(question);
    }

    @Override
    public List<QuestionDto> getQuestionsBySubject(Long subjectId) {
        return questionRepository.findBySubjectId(subjectId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuestionDto> getAllQuestions() {
        return questionRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private QuestionDto mapToDto(Question question) {
        return QuestionDto.builder()
                .id(question.getId())
                .content(question.getContent())
                .subjectId(question.getSubject().getId())
                .difficultyLevel(question.getDifficultyLevel())
                .answers(question.getAnswers().stream()
                        .map(a -> AnswerDto.builder()
                                .id(a.getId())
                                .answerContent(a.getAnswerContent())
                                .isCorrect(a.getIsCorrect())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
