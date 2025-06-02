package proiect.proiectPs.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// Make sure SessionCreationPolicy is imported if you intend to use it for stateless sessions
// import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
// HandlerMappingIntrospector is not used in the corrected filterChain, can be removed if not needed elsewhere
// import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

import java.util.Arrays;

@Configuration
public class SecurityConfig {
    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); // In production, specify exact origins
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception { // HandlerMappingIntrospector removed as it's not used
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Configure CORS
                .csrf(csrf -> csrf.disable()) // Disable CSRF
                .authorizeHttpRequests(authz -> authz
                        // Publicly accessible paths
                        .requestMatchers(
                                new AntPathRequestMatcher("/h2-console/**"),
                                new AntPathRequestMatcher("/auth/**"),
                                new AntPathRequestMatcher("/test-api"),
                                new AntPathRequestMatcher("/posts/sortedByDate"),
                                new AntPathRequestMatcher("/posts/filterByTitle"),
                                new AntPathRequestMatcher("/posts/filterByUsername")
                        ).permitAll()

                        // Admin-specific paths
                        .requestMatchers(
                                new AntPathRequestMatcher("/users/deleteUser"),
                                new AntPathRequestMatcher("/users/getAll"),
                                // .requestMatchers(new AntPathRequestMatcher("/users/banUser")).hasRole("ADMIN") // Original: ADMIN, then USER/ADMIN. Consolidate or clarify. Assuming ADMIN for now.
                                new AntPathRequestMatcher("/tags/create"),
                                new AntPathRequestMatcher("/tags/updateTag"),
                                new AntPathRequestMatcher("/tags/delete")
                        ).hasRole("ADMIN")

                        // User and Admin paths (shared)
                        .requestMatchers(
                                new AntPathRequestMatcher("/users/banUser"), // Moved here as it was duplicated with different roles, assuming stricter or more general one. Adjust if needed.
                                new AntPathRequestMatcher("/comments/vote"),
                                new AntPathRequestMatcher("/comments/insertComment"),
                                new AntPathRequestMatcher("/comments/editComment"),
                                new AntPathRequestMatcher("/posts/create"),
                                new AntPathRequestMatcher("/posts/upvote"),
                                new AntPathRequestMatcher("/posts/edit"),
                                new AntPathRequestMatcher("/posts/delete")
                        ).hasAnyRole("USER", "ADMIN")

                        // Authenticated paths
                        .requestMatchers(new AntPathRequestMatcher("/users/me")).authenticated()

                        // All other requests (if not matched above)
                        .anyRequest().permitAll() // Ensure this is the LAST rule
                )
                // For H2 console to be accessible in a browser
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));

        // Add your JWT filter
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // Optional: If you are using JWTs, you typically want stateless sessions
        // http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}