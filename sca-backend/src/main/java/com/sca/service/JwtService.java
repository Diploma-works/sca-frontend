package com.sca.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${spring.security.jwt.secret}")
    private String secretKey;

    @Value("${spring.security.jwt.expiration}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration
    ) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            System.out.println("JWT Service - Checking token validity for username: " + username);
            System.out.println("JWT Service - Expected username: " + userDetails.getUsername());
            System.out.println("JWT Service - Token expired: " + isTokenExpired(token));
            
            boolean isValid = (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
            System.out.println("JWT Service - Token is valid: " + isValid);
            return isValid;
        } catch (Exception e) {
            System.err.println("JWT Service - Error validating token: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            boolean expired = extractExpiration(token).before(new Date());
            System.out.println("JWT Service - Token expiration check: " + expired);
            return expired;
        } catch (Exception e) {
            System.err.println("JWT Service - Error checking token expiration: " + e.getMessage());
            return true;
        }
    }

    private Date extractExpiration(String token) {
        try {
            Date expiration = extractClaim(token, Claims::getExpiration);
            System.out.println("JWT Service - Token expiration: " + expiration);
            return expiration;
        } catch (Exception e) {
            System.err.println("JWT Service - Error extracting expiration: " + e.getMessage());
            throw e;
        }
    }

    private Claims extractAllClaims(String token) {
        try {
            System.out.println("JWT Service - Extracting claims from token");
            System.out.println("JWT Service - Secret key length: " + (secretKey != null ? secretKey.length() : "NULL"));
            Claims claims = Jwts
                    .parser()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            System.out.println("JWT Service - Claims extracted successfully");
            return claims;
        } catch (Exception e) {
            System.err.println("JWT Service - Error extracting claims: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private Key getSignInKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
} 