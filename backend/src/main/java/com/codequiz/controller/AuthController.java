package com.codequiz.controller;

import com.codequiz.dto.JwtResponse;
import com.codequiz.dto.LoginRequest;
import com.codequiz.dto.MessageResponse;
import com.codequiz.dto.SignupRequest;
import com.codequiz.entity.User;
import com.codequiz.repository.UserRepository;

import com.codequiz.security.jwt.JwtUtils;
import com.codequiz.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;


  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    try {
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

      SecurityContextHolder.getContext().setAuthentication(authentication);
      String jwt = jwtUtils.generateJwtToken(authentication);
      
      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
      List<String> roles = userDetails.getAuthorities().stream()
          .map(item -> item.getAuthority())
          .collect(Collectors.toList());

      return ResponseEntity.ok(new JwtResponse(jwt, 
                           userDetails.getId(), 
                           userDetails.getUsername(), 
                           userDetails.getEmail(), 
                           roles));
    } catch (org.springframework.security.authentication.BadCredentialsException e) {
      return ResponseEntity.status(401).body(new MessageResponse("Tên đăng nhập hoặc mật khẩu không chính xác!"));
    } catch (Exception e) {
      return ResponseEntity.status(401).body(new MessageResponse("Lỗi: " + e.getMessage()));
    }
  }

  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    if (userRepository.existsByUsername(signUpRequest.getUsername())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Lỗi: Tên đăng nhập đã tồn tại!"));
    }

    if (userRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Lỗi: Email này đã được sử dụng!"));
    }

    // Create new user's account
    User user = User.builder()
        .username(signUpRequest.getUsername())
        .email(signUpRequest.getEmail())
        .password(encoder.encode(signUpRequest.getPassword()))
        .fullName(signUpRequest.getFullName())
        .status("ACTIVE")
        .build();

    Set<String> strRoles = signUpRequest.getRole();
    String role = "ROLE_USER";

    if (strRoles != null && strRoles.contains("admin")) {
        role = "ROLE_ADMIN";
    }

    user.setRole(role);
    userRepository.save(user);
    return ResponseEntity.ok(new MessageResponse("Đăng ký tài khoản thành công!"));

  }
}
