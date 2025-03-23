package proiect.proiectPs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import proiect.proiectPs.entity.Post;
import proiect.proiectPs.entity.User;
import proiect.proiectPs.repository.UserRepository;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public List<User> retrieveAllUsers() {
        return (List<User>) this.userRepository.findAll();
    }

    public User insertUser(User user) {
        return this.userRepository.save(user);
    }

    public String deleteUserById(Long id) {
        try{
            this.userRepository.deleteById(id);
            return "Successfully deleted user with id " + id;
        } catch (Exception e) {
            return "Failed deleting user with id " + id;
        }
    }
}
