package com.codequiz.repository;

import com.codequiz.entity.ExamAttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamAttemptAnswerRepository extends JpaRepository<ExamAttemptAnswer, Long> {
}
