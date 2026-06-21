package com.codequiz.security.jwt;

import com.codequiz.security.services.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
  private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

  @Value("${codequiz.app.jwtSecret}")
  private String jwtSecret;

  @Value("${codequiz.app.jwtExpirationMs}")
  private int jwtExpirationMs;

  private Key getSigningKey() {
    byte[] keyBytes = this.jwtSecret.getBytes(StandardCharsets.UTF_8);
    return Keys.hmacShaKeyFor(keyBytes);
  }

  public String generateJwtToken(Authentication authentication) {

    UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

    return Jwts.builder()
        .setSubject((userPrincipal.getUsername()))
        .setIssuedAt(new Date())
        .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
        .signWith(getSigningKey(), SignatureAlgorithm.HS512)
        .compact();
  }

  public String getUserNameFromJwtToken(String token) {
    String username = Jwts.parserBuilder()
        .setSigningKey(getSigningKey())
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject();
    logger.info("DEBUG: Parsed username from token: {}", username);
    return username;
  }

  public boolean validateJwtToken(String authToken) {
    try {
      logger.info("DEBUG: Validating token: {}...", authToken.substring(0, 10));
      Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
      logger.info("DEBUG: Token is VALID");
      return true;
    } catch (io.jsonwebtoken.security.SignatureException e) {
      logger.error("DEBUG ERROR: Invalid JWT signature: {}. Key used ends with: ...{}", e.getMessage(), jwtSecret.substring(jwtSecret.length() - 5));
    } catch (MalformedJwtException e) {
      logger.error("DEBUG ERROR: Invalid JWT token: {}", e.getMessage());
    } catch (ExpiredJwtException e) {
      logger.error("DEBUG ERROR: JWT token is expired: {}", e.getMessage());
    } catch (UnsupportedJwtException e) {
      logger.error("DEBUG ERROR: JWT token is unsupported: {}", e.getMessage());
    } catch (IllegalArgumentException e) {
      logger.error("DEBUG ERROR: JWT claims string is empty: {}", e.getMessage());
    } catch (Exception e) {
      logger.error("DEBUG ERROR: JWT unexpected error: {}", e.getMessage());
    }

    return false;
  }
}
