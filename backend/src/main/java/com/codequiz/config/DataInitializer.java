package com.codequiz.config;

import com.codequiz.entity.*;
import com.codequiz.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;

    @Autowired private SubjectRepository subjectRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private ExamRepository examRepository;
    @Autowired private PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) return;

        // Users
        User admin = User.builder()
                .username("admin")
                .email("admin@codequiz.com")
                .password(encoder.encode("admin123"))
                .fullName("System Admin")
                .status("ACTIVE")
                .role("ROLE_ADMIN")
                .build();
        userRepository.save(admin);

        User user = User.builder()
                .username("user")
                .email("user@codequiz.com")
                .password(encoder.encode("user123"))
                .fullName("Normal User")
                .status("ACTIVE")
                .role("ROLE_USER")
                .build();
        userRepository.save(user);


        // Subjects
        Subject java = subjectRepository.save(Subject.builder()
                .subjectName("Java")
                .description("Core Java, OOP, Collections, Streams...")
                .build());
        Subject python = subjectRepository.save(Subject.builder()
                .subjectName("Python")
                .description("Syntax, Data Science, Web Frameworks...")
                .build());
        Subject cpp = subjectRepository.save(Subject.builder()
                .subjectName("C++")
                .description("Pointers, Memory Management, STL...")
                .build());

        // Questions for Java
        Question q1 = Question.builder()
                .content("What is the parent class of all classes in Java?")
                .subject(java)
                .difficultyLevel("EASY")
                .build();
        q1.setAnswers(Arrays.asList(
                new Answer(null, q1, "Object", true),
                new Answer(null, q1, "Class", false),
                new Answer(null, q1, "String", false),
                new Answer(null, q1, "Main", false)
        ));
        questionRepository.save(q1);

        Question q2 = Question.builder()
                .content("Which keyword is used to inherit a class in Java?")
                .subject(java)
                .difficultyLevel("EASY")
                .build();
        q2.setAnswers(Arrays.asList(
                new Answer(null, q2, "implements", false),
                new Answer(null, q2, "extends", true),
                new Answer(null, q2, "inherits", false),
                new Answer(null, q2, "super", false)
        ));
        questionRepository.save(q2);

        // Exam
        Exam javaExam = Exam.builder()
                .title("Java Fundamentals Quiz")
                .description("Test your basic Java knowledge with this quick quiz.")
                .duration(15)
                .totalQuestions(2)
                .status("PUBLISHED")
                .questions(new HashSet<>(Arrays.asList(q1, q2)))
                .build();
        examRepository.save(javaExam);

        System.out.println(">>> Data Seeded Successfully for H2 Database!");
    }
}
