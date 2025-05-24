package proiect.proiectPs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import proiect.proiectPs.entity.User;
import proiect.proiectPs.entity.UserVotedComment;
import proiect.proiectPs.entity.UserVotedPost;
import proiect.proiectPs.repository.UserRepository;
import proiect.proiectPs.repository.UserVotedCommentRepository;
import proiect.proiectPs.repository.UserVotedPostRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserVotedPostRepository userVotedPostRepository;
    @Autowired
    private UserVotedCommentRepository userVotedCommentRepository;

    public List<User> retrieveAllUsers() {
        return (List<User>) this.userRepository.findAll();
    }

    public User insertUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Prevent privilege escalation on registration
        user.setIs_admin(false);
        user.setIs_blocked(false);
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

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateUser(Long id, User user) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser == null) return null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        String currentEmail = auth != null ? auth.getName() : null;

        // Only allow user to update their own username and password
        if (!isAdmin && (existingUser.getEmail() == null || !existingUser.getEmail().equals(currentEmail))) {
            return null; // Not allowed
        }

        if (user.getEmail() != null) existingUser.setEmail(user.getEmail());
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        if (user.getDate_of_birth() != null && isAdmin) existingUser.setDate_of_birth(user.getDate_of_birth());
        if (isAdmin) {
            // Only admin can update admin and blocked status
            existingUser.setIs_admin(user.isIs_admin());
            existingUser.setIs_blocked(user.isIs_blocked());
        }
        // Do not allow non-admins to update admin/blocked/date_of_birth fields
        return userRepository.save(existingUser);
    }

    public String banUser(Long id) {
        // Only admin can ban users
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return "Only admin can ban users";
        }
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return "User not found";
        user.setIs_blocked(true);
        userRepository.save(user);
        return "User banned";
    }

    public int getUserScore(Long id) {
        int score = 0;
        // Sum all votes the user has received on their posts
        List<UserVotedPost> postVotes = userVotedPostRepository.findByPost_User_Id(id);
        for (UserVotedPost vote : postVotes) {
            score += vote.getVote();
        }
        // Sum all votes the user has received on their comments
        List<UserVotedComment> commentVotes = userVotedCommentRepository.findByComment_User_Id(id);
        for (UserVotedComment vote : commentVotes) {
            score += vote.getVote();
        }
        return score;
    }
}
