package proiect.proiectPs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import proiect.proiectPs.entity.User;
import proiect.proiectPs.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/getAll") // Fixed typo from "/gelAll" to "/getAll"
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
