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

import proiect.proiectPs.entity.Post;
import proiect.proiectPs.service.PostService;

@RestController
@RequestMapping("/posts")
public class PostController {
    @Autowired
    private PostService postService;

    @GetMapping("/getAll")
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

    @PostMapping("/create")
    @ResponseBody
    public Post createPost(@RequestBody Post post, @RequestParam List<String> tags) {
        return this.postService.createPost(post, tags);
    }

    @PostMapping("/upvote")
    @ResponseBody
    public String upvotePost(@RequestParam Long postId, @RequestParam Long userId) {
        return this.postService.upvotePost(postId, userId);
    }

    @PutMapping("/edit")
    @ResponseBody
    public Post editPost(@RequestParam Long postId, @RequestBody Post post, @RequestParam Long userId) {
        return this.postService.editPost(postId, post, userId);
    }

    @GetMapping("/getAllSorted")
    @ResponseBody
    public List<Post> getAllPostsSortedByScore() {
        return this.postService.getAllPostsSortedByScore();
    }

    @GetMapping("/byTag")
    @ResponseBody
    public List<Post> getPostsByTag(@RequestParam String tag) {
        return this.postService.getPostsByTag(tag);
    }
}
