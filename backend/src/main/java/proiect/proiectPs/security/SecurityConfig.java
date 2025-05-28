package proiect.proiectPs.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

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
    //*
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, HandlerMappingIntrospector introspector) throws Exception {
        http
            .cors() // Enable CORS support
            .and()
            .csrf().disable()
            .authorizeHttpRequests()
            .requestMatchers(new AntPathRequestMatcher("/h2-console/**")).permitAll()
            .requestMatchers(new AntPathRequestMatcher("/auth/**")).permitAll()
            .requestMatchers(new AntPathRequestMatcher("/test-api")).permitAll()
            .requestMatchers(new AntPathRequestMatcher("/posts/sortedByDate")).permitAll()
            .requestMatchers(new AntPathRequestMatcher("/posts/filterByTitle")).permitAll()
            .requestMatchers(new AntPathRequestMatcher("/posts/filterByUsername")).permitAll()
            .requestMatchers(new AntPathRequestMatcher("/users/deleteUser")).hasRole("ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/users/getAll")).hasRole("ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/users/banUser")).hasAnyRole("USER", "ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/comments/vote")).hasAnyRole("USER", "ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/comments/insertComment")).hasAnyRole("USER", "ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/comments/editComment")).hasAnyRole("USER", "ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/posts/create")).hasAnyRole("USER", "ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/posts/upvote")).hasAnyRole("USER", "ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/posts/edit")).hasAnyRole("USER", "ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/posts/delete")).hasAnyRole("USER", "ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/tags/create")).hasRole("ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/tags/updateTag")).hasRole("ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/tags/delete")).hasRole("ADMIN")
            .requestMatchers(new AntPathRequestMatcher("/users/me")).authenticated()
            .anyRequest().permitAll();
        http.headers().frameOptions().disable();

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowCredentials(true);
        configuration.addAllowedOriginPattern("*"); //enable all cors
        configuration.addAllowedHeader("*");
        configuration.addAllowedMethod("*");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }



//*/
/*
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .authorizeHttpRequests()
            .requestMatchers(new AntPathRequestMatcher("/auth/**")).permitAll()
            .requestMatchers(new AntPathRequestMatcher("/h2-console/**")).permitAll()
            .anyRequest().permitAll();
        // Allow frames for H2 console
        http.headers().frameOptions().disable();

        //http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
//*/
}
