package proiect.proiectPs.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test-api")
@CrossOrigin(origins = "*", allowedHeaders = "*") // Explicit CORS for test endpoints
public class TestApiController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello from backend!";
    }

    @PostMapping("/echo")
    public String echo(@RequestBody String body) {
        return "Echo: " + body;
    }
}
