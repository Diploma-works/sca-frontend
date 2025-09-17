package com.sca.config;

import com.sca.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;
        
        System.out.println("=== JWT FILTER START ===");
        System.out.println("JWT Filter - Request URI: " + request.getRequestURI());
        System.out.println("JWT Filter - Request Method: " + request.getMethod());
        System.out.println("JWT Filter - Authorization header: " + (authHeader != null ? authHeader.substring(0, Math.min(50, authHeader.length())) + "..." : "NULL"));
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("JWT Filter - No Bearer token found, continuing filter chain");
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        System.out.println("JWT Filter - Extracted JWT token: " + jwt.substring(0, Math.min(50, jwt.length())) + "...");
        
        try {
            System.out.println("JWT Filter - Attempting to extract username from token");
            username = jwtService.extractUsername(jwt);
            System.out.println("JWT Filter - Extracted username: " + username);
            
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                System.out.println("JWT Filter - Loading user details for username: " + username);
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                System.out.println("JWT Filter - Loaded user details: " + userDetails.getUsername());
                System.out.println("JWT Filter - User authorities: " + userDetails.getAuthorities());
                
                System.out.println("JWT Filter - Validating token");
                boolean valid = jwtService.isTokenValid(jwt, userDetails);
                System.out.println("JWT Filter - Token valid? " + valid);
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    System.out.println("JWT Filter - Token is valid, creating authentication token");
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("JWT Filter - Authentication set successfully");
                } else {
                    System.out.println("JWT Filter - Token is not valid");
                }
            } else {
                System.out.println("JWT Filter - Username is null or authentication already exists");
                if (username == null) {
                    System.out.println("JWT Filter - Username is null");
                }
                if (SecurityContextHolder.getContext().getAuthentication() != null) {
                    System.out.println("JWT Filter - Authentication already exists: " + SecurityContextHolder.getContext().getAuthentication().getName());
                }
            }
        } catch (Exception e) {
            // Логируем ошибку, но не прерываем цепочку фильтров
            System.err.println("JWT Filter - Error processing JWT token: " + e.getMessage());
            System.err.println("JWT Filter - Exception type: " + e.getClass().getName());
            e.printStackTrace();
        }
        
        System.out.println("JWT Filter - Continuing filter chain");
        filterChain.doFilter(request, response);
        System.out.println("=== JWT FILTER END ===");
    }
} 