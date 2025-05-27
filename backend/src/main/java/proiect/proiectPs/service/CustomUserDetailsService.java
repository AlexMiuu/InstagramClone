package proiect.proiectPs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import proiect.proiectPs.entity.User;
import proiect.proiectPs.repository.UserRepository;
import org.springframework.security.core.userdetails.User.UserBuilder;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            System.out.println("UserDetailsService: User not found for email: " + email);
            throw new UsernameNotFoundException("User not found");
        }
        System.out.println("UserDetailsService: Found user " + user.getEmail() + ", is_admin=" + user.isIs_admin());
        UserBuilder builder = org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
            .password(user.getPassword())
            .roles(user.isIs_admin() ? "ADMIN" : "USER");
        return builder.build();
    }
}
