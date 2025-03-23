package proiect.proiectPs.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import proiect.proiectPs.entity.Post;
import proiect.proiectPs.service.PostService;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {
    @Autowired
    private PostService postService;

    @GetMapping("/gelAll")
    @ResponseBody
    public List<Post> retrieveAllPosts() {
        return this.postService.retrievePosts();
    }

    @PostMapping("/insertPost")
    @ResponseBody
    public Post insertPost(@RequestBody Post post) {
        return this.postService.insertPost(post);
    }

    @PutMapping("/updatePost")
    @ResponseBody
    public Post updatePost(@RequestBody Post post) {
        return this.postService.insertPost(post);
    }

    @DeleteMapping("/deletePost")
    @ResponseBody
    public String deletePostById(@RequestParam Long id) {
        return this.postService.deletePostById(id);
    }
}
