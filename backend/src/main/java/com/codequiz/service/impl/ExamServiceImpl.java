package com.codequiz.service.impl;

import com.codequiz.dto.*;
import com.codequiz.entity.*;
import com.codequiz.repository.*;
import com.codequiz.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ExamServiceImpl implements ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ExamAttemptRepository attemptRepository;

    @Autowired
    private ExamAttemptAnswerRepository attemptAnswerRepository;


    @Override
    @Transactional
    public ExamDto createExam(ExamDto examDto) {
        Exam exam = Exam.builder()
                .title(examDto.getTitle())
                .description(examDto.getDescription())
                .duration(examDto.getDuration())
                .totalQuestions(examDto.getTotalQuestions())
                .status(examDto.getStatus())
                .build();

        if (examDto.getQuestionIds() != null) {
            List<Question> questions = questionRepository.findAllById(examDto.getQuestionIds());
            exam.setQuestions(new HashSet<>(questions));
        }

        Exam saved = examRepository.save(exam);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ExamDto updateExam(Long id, ExamDto examDto) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        exam.setTitle(examDto.getTitle());
        exam.setDescription(examDto.getDescription());
        exam.setDuration(examDto.getDuration());
        exam.setTotalQuestions(examDto.getTotalQuestions());
        exam.setStatus(examDto.getStatus());

        if (examDto.getQuestionIds() != null) {
            List<Question> questions = questionRepository.findAllById(examDto.getQuestionIds());
            exam.getQuestions().clear();
            exam.getQuestions().addAll(questions);
        }

        Exam updated = examRepository.save(exam);
        return mapToDto(updated);
    }

    @Override
    public void deleteExam(Long id) {
        examRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ExamDto getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        return mapToDto(exam);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamSummaryDto> getAllExams() {
        return examRepository.findAll().stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamSummaryDto> getPublishedExams() {
        return examRepository.findByStatusIgnoreCase("PUBLISHED").stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ExamResultDto submitExam(Long userId, ExamSubmissionDto submission) {
        Exam exam = examRepository.findById(submission.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        int correctCount = 0;
        int wrongCount = 0;
        List<ExamAttemptAnswer> attemptAnswers = new ArrayList<>();

        for (QuestionAnswerDto qa : submission.getAnswers()) {
            Question question = questionRepository.findById(qa.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Question not found"));
            
            boolean isCorrect = false;
            Answer selectedAnswer = null;
            if (qa.getSelectedAnswerId() != null) {
                for (Answer ans : question.getAnswers()) {
                    if (ans.getId().equals(qa.getSelectedAnswerId())) {
                        selectedAnswer = ans;
                        isCorrect = Boolean.TRUE.equals(ans.getIsCorrect());
                        break;
                    }
                }
            }

            if (isCorrect) correctCount++;
            else wrongCount++;

            attemptAnswers.add(ExamAttemptAnswer.builder()
                    .question(question)
                    .selectedAnswer(selectedAnswer)
                    .build());
        }

        double score = (double) correctCount / exam.getTotalQuestions() * 10.0;
        
        Long attemptId = null;
        LocalDateTime submitTime = LocalDateTime.now();

        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ExamAttempt attempt = ExamAttempt.builder()
                    .user(user)
                    .exam(exam)
                    .startTime(submitTime.minusMinutes(exam.getDuration())) // Mock start time
                    .submitTime(submitTime)
                    .score(score)
                    .totalCorrect(correctCount)
                    .totalWrong(wrongCount)
                    .build();

            ExamAttempt savedAttempt = attemptRepository.save(attempt);
            attemptId = savedAttempt.getId();
            
            attemptAnswers.forEach(answer -> answer.setAttempt(savedAttempt));
            attemptAnswerRepository.saveAll(attemptAnswers);
        }

        return ExamResultDto.builder()
                .attemptId(attemptId)
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .totalCorrect(correctCount)
                .totalWrong(wrongCount)
                .totalQuestions(exam.getTotalQuestions())
                .score(score)
                .submitTime(submitTime)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResultDto> getUserHistory(Long userId) {
        return attemptRepository.findByUserIdOrderBySubmitTimeDesc(userId).stream()
                .map(attempt -> {
                    return ExamResultDto.builder()
                            .attemptId(attempt.getId())
                            .examId(attempt.getExam().getId())
                            .examTitle(attempt.getExam().getTitle())
                            .totalCorrect(attempt.getTotalCorrect() != null ? attempt.getTotalCorrect() : 0)
                            .totalWrong(attempt.getTotalWrong() != null ? attempt.getTotalWrong() : 0)
                            .totalQuestions(attempt.getExam().getTotalQuestions())
                            .score(attempt.getScore())
                            .submitTime(attempt.getSubmitTime())
                            .build();
                })
                .collect(Collectors.toList());
    }


    private ExamDto mapToDto(Exam exam) {
        return ExamDto.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .duration(exam.getDuration())
                .totalQuestions(exam.getTotalQuestions())
                .status(exam.getStatus())
                .questionIds(exam.getQuestions().stream()
                        .map(Question::getId)
                        .collect(Collectors.toSet()))
                .questions(exam.getQuestions().stream()
                        .map(this::mapQuestionToDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private ExamSummaryDto mapToSummaryDto(Exam exam) {
        return ExamSummaryDto.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .duration(exam.getDuration())
                .totalQuestions(exam.getTotalQuestions())
                .status(exam.getStatus())
                .build();
    }

    private QuestionDto mapQuestionToDto(Question question) {
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
