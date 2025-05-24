package proiect.proiectPs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import proiect.proiectPs.entity.User;
import proiect.proiectPs.service.UserService;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/getAll")
    @ResponseBody
    public List<User> retrieveAllUsers() {
        return this.userService.retrieveAllUsers();
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).build();
        }
        String email = auth.getName();
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/update")
    @ResponseBody
    public User updateUser(@RequestParam Long id, @RequestBody User user) {
        return this.userService.updateUser(id, user);
    }

    @DeleteMapping("/deleteUser")
    @ResponseBody
    public String deleteUserById(@RequestParam Long id) {
        return this.userService.deleteUserById(id);
    }

    @PostMapping("/banUser")
    @ResponseBody
    public String banUser(@RequestParam Long id) {
        return this.userService.banUser(id);
    }

    @GetMapping("/score")
    @ResponseBody
    public int getUserScore(@RequestParam Long id) {
        return this.userService.getUserScore(id);
    }
}
