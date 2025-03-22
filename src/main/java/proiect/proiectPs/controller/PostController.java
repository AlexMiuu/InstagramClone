package proiect.proiectPs.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import proiect.proiectPs.entity.Post;
import proiect.proiectPs.service.PostService;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {
    @Autowired
    private PostService postService;

    public List<Post> getAllPosts(){
        //TODO functie din service de getAllPosts
        throw new UnsupportedOperationException();
    }
}

