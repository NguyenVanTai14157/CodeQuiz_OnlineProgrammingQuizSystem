package com.codequiz.security;

import com.codequiz.security.jwt.AuthEntryPointJwt;
import com.codequiz.security.jwt.AuthTokenFilter;
import com.codequiz.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import java.util.Arrays;
import java.util.Collections;
import java.util.stream.Collectors;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {
  @Autowired
  UserDetailsServiceImpl userDetailsService;

  @Autowired
  private AuthEntryPointJwt unauthorizedHandler;

  @Autowired
  private AuthTokenFilter authTokenFilter;

  @Value("${ALLOWED_ORIGINS:http://localhost:4200,http://localhost:4300}")
  private String allowedOrigins;

  @Bean
  public DaoAuthenticationProvider authenticationProvider() {
      DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
       
      authProvider.setUserDetailsService(userDetailsService);
      authProvider.setPasswordEncoder(passwordEncoder());
   
      return authProvider;
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
    return authConfig.getAuthenticationManager();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(org.springframework.security.config.Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> 
          auth.requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher(org.springframework.http.HttpMethod.OPTIONS, "/**")).permitAll()
              .requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher("/api/auth/**")).permitAll()
              .requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher(org.springframework.http.HttpMethod.GET, "/api/subjects/**")).permitAll()
              .requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher(org.springframework.http.HttpMethod.GET, "/api/subjects")).permitAll()
              .requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher(org.springframework.http.HttpMethod.GET, "/api/exams/published/**")).permitAll()
              .requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher(org.springframework.http.HttpMethod.GET, "/api/exams/published")).permitAll()
              .requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher(org.springframework.http.HttpMethod.GET, "/api/exams")).permitAll()
              .requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher(org.springframework.http.HttpMethod.GET, "/api/exams/**")).permitAll()
              .requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher(org.springframework.http.HttpMethod.POST, "/api/exams/submit")).permitAll()
              .requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher(org.springframework.http.HttpMethod.GET, "/api/questions/**")).permitAll()
              .requestMatchers(org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher("/api/test/**")).permitAll()
              .anyRequest().authenticated()
        );
    
    http.authenticationProvider(authenticationProvider());
    http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
    org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
    
    if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .collect(Collectors.toList()));
    } else {
        configuration.setAllowedOrigins(Collections.singletonList("*"));
    }
    
    configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "X-Requested-With"));
    configuration.setAllowCredentials(true);
    org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
