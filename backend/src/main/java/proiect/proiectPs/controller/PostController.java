package proiect.proiectPs.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import proiect.proiectPs.entity.Post;
import proiect.proiectPs.service.PostService;

@CrossOrigin(origins = "http://localhost:4200")
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

    @GetMapping(value = "/image/{postId}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> getPostImage(@PathVariable Long postId) {
        // Find the post
        Optional<Post> postOpt = Optional.ofNullable(
            postService.retrievePosts().stream().filter(p -> p.getId().equals(postId)).findFirst().orElse(null)
        );
        if (postOpt.isEmpty() || postOpt.get().getImage_link() == null) {
            return ResponseEntity.notFound().build();
        }
        String filename = postOpt.get().getImage_link();
        byte[] fileBytes = postService.downloadFileFromStorage(filename);
        return ResponseEntity.ok()
            .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
            .body(fileBytes);
    }

    // Update: Create post with image upload (multipart/form-data)
    @PostMapping(value = "/createWithImage", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public Post createPostWithImage(
        @RequestPart("post") Post post,
        @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
        @RequestParam List<String> tags
    ) {
        // Print the content of the request for debugging
        System.out.println("Received Post: " + post);
        System.out.println("Received Tags: " + tags);
        if (imageFile != null) {
            System.out.println("Received Image File: " + imageFile.getOriginalFilename() + ", size: " + imageFile.getSize());
        } else {
            System.out.println("No image file received.");
        }
        return this.postService.createPostWithImage(post, tags, imageFile);
    }
}
