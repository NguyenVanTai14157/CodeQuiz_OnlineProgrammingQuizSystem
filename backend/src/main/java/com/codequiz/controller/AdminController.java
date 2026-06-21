package com.codequiz.controller;

import com.codequiz.dto.DashboardDto;
import com.codequiz.dto.UserDto;
import com.codequiz.entity.User;
import com.codequiz.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired UserRepository userRepository;
    @Autowired SubjectRepository subjectRepository;
    @Autowired QuestionRepository questionRepository;
    @Autowired ExamRepository examRepository;
    @Autowired ExamAttemptRepository attemptRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard() {
        DashboardDto dto = DashboardDto.builder()
                .totalUsers(userRepository.count())
                .totalSubjects(subjectRepository.count())
                .totalQuestions(questionRepository.count())
                .totalExams(examRepository.count())
                .totalAttempts(attemptRepository.count())
                .build();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(this::mapUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tên đăng nhập '" + userDto.getUsername() + "' đã tồn tại"));
        }
        if (userDto.getEmail() != null && !userDto.getEmail().isEmpty() && userRepository.existsByEmail(userDto.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email '" + userDto.getEmail() + "' đã tồn tại"));
        }
        String role = "ROLE_USER";
        if (userDto.getRoles() != null && (userDto.getRoles().contains("ROLE_ADMIN") || userDto.getRoles().contains("admin"))) {
            role = "ROLE_ADMIN";
        }
        if (userDto.getPassword() == null || userDto.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu không được để trống"));
        }
        
        User user = User.builder()
                .username(userDto.getUsername())
                .email(userDto.getEmail())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .fullName(userDto.getFullName())
                .status("ACTIVE")
                .role(role)
                .build();
        return ResponseEntity.ok(mapUser(userRepository.save(user)));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserDto> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(body.getOrDefault("status", user.getStatus()));
        return ResponseEntity.ok(mapUser(userRepository.save(user)));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (userDto.getFullName() != null) user.setFullName(userDto.getFullName());
        if (userDto.getEmail() != null) user.setEmail(userDto.getEmail());
        if (userDto.getStatus() != null) user.setStatus(userDto.getStatus());
        
        if (userDto.getRoles() != null && !userDto.getRoles().isEmpty()) {
            String newRole = userDto.getRoles().iterator().next();
            if (!newRole.startsWith("ROLE_")) {
                newRole = "ROLE_" + newRole.toUpperCase();
            }
            user.setRole(newRole);
        }
        
        if (userDto.getPassword() != null && !userDto.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        return ResponseEntity.ok(mapUser(userRepository.save(user)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private UserDto mapUser(User user) {
        Set<String> roles = user.getRole() != null ? Set.of(user.getRole()) : Set.of();
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .status(user.getStatus())
                .roles(roles)
                .build();
    }
}
