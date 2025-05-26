package proiect.proiectPs.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(
    origins = "http://localhost:4200",
    allowCredentials = "true",
    allowedHeaders = "*"
)
@RestController
@RequestMapping("test")
public class TestController {
    @GetMapping("/{nr}")
    public String getMapping(@PathVariable Integer nr){
        Integer y = nr+1;
        return String.valueOf(y);
    }
}
