package com.codequiz.controller;

import com.codequiz.dto.ExamDto;
import com.codequiz.dto.ExamSummaryDto;
import com.codequiz.dto.ExamSubmissionDto;
import com.codequiz.dto.ExamResultDto;
import com.codequiz.service.ExamService;
import com.codequiz.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/exams")
public class ExamController {

    @Autowired
    private ExamService examService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto> createExam(@RequestBody ExamDto examDto) {
        return ResponseEntity.ok(examService.createExam(examDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExamDto> updateExam(@PathVariable Long id, @RequestBody ExamDto examDto) {
        return ResponseEntity.ok(examService.updateExam(id, examDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamDto> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @GetMapping
    public ResponseEntity<List<ExamSummaryDto>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/published")
    public ResponseEntity<List<ExamSummaryDto>> getPublishedExams() {
        return ResponseEntity.ok(examService.getPublishedExams());
    }

    @PostMapping("/submit")
    public ResponseEntity<ExamResultDto> submitExam(@AuthenticationPrincipal UserDetailsImpl userDetails, 
                                                  @RequestBody ExamSubmissionDto submission) {
        Long userId = (userDetails != null) ? userDetails.getId() : null;
        return ResponseEntity.ok(examService.submitExam(userId, submission));
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ExamResultDto>> getUserHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(examService.getUserHistory(userDetails.getId()));
    }
}
