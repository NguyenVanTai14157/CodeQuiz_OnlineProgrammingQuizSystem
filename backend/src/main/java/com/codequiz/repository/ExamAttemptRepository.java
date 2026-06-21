package com.codequiz.repository;

import com.codequiz.entity.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    List<ExamAttempt> findByUserIdOrderBySubmitTimeDesc(Long userId);
    List<ExamAttempt> findByExamId(Long examId);
}
