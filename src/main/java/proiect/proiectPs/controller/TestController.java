package proiect.proiectPs.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("test")
public class TestController {
    @GetMapping("/{nr}")
    public String getMapping(@PathVariable Integer nr){
        Integer y = nr+1;
        return String.valueOf(y);
    }
}
