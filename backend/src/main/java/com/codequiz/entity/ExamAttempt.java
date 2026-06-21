package com.codequiz.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id")
    private Exam exam;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "submit_time")
    private LocalDateTime submitTime;

    private Double score;

    @Column(name = "total_correct")
    private Integer totalCorrect;

    @Column(name = "total_wrong")
    private Integer totalWrong;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ExamAttemptAnswer> answers;

}
