package proiect.proiectPs.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("test")
public class TestController {
    @GetMapping("/{nr}")
    public String getMapping(@PathVariable Integer nr){
        Integer y = nr+1;
        return String.valueOf(y);
    }
}
