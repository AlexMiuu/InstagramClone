package proiect.proiectPs.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import proiect.proiectPs.entity.Post;
import proiect.proiectPs.entity.User;
import proiect.proiectPs.service.PostService;
import proiect.proiectPs.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/gelAll")
    @ResponseBody
    public List<User> retrieveAllUsers() {
        return this.userService.retrieveAllUsers();
    }

    @PostMapping("/insertUser")
    @ResponseBody
    public User insertUser(@RequestBody User user) {
        return this.userService.insertUser(user);
    }

    @PutMapping("/updateUser")
    @ResponseBody
    public User updateUser(@RequestBody User user) {
        return this.userService.insertUser(user);
    }

    @DeleteMapping("/deleteUser")
    @ResponseBody
    public String deleteUserById(@RequestParam Long id) {
        return this.userService.deleteUserById(id);
    }
}
