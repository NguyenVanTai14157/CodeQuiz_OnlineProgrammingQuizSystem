package com.codequiz.controller;

import com.codequiz.dto.QuestionDto;
import com.codequiz.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDto> createQuestion(@RequestBody QuestionDto questionDto) {
        return ResponseEntity.ok(questionService.createQuestion(questionDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDto> updateQuestion(@PathVariable Long id, @RequestBody QuestionDto questionDto) {
        return ResponseEntity.ok(questionService.updateQuestion(id, questionDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionDto> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<QuestionDto>> getQuestionsBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(questionService.getQuestionsBySubject(subjectId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<QuestionDto>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }
}
