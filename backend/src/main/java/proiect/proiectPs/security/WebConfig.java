package proiect.proiectPs.security;// In your Spring Boot project (e.g., in a 'config' package)
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Allow all endpoints
                .allowedOrigins("http://localhost:4200") // Allow your Angular app's origin
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow specific methods
                .allowedHeaders("*") // Allow all headers
                .allowCredentials(true);
    }
}