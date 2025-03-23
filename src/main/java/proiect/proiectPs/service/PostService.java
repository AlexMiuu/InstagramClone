package proiect.proiectPs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import proiect.proiectPs.entity.Post;
import proiect.proiectPs.repository.PostRepository;

import java.util.List;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    public List<Post> retrievePosts() {
        return (List<Post>) this.postRepository.findAll();
    }

    public Post insertPost(Post post) {
        return this.postRepository.save(post);
    }

    public String deletePostById(Long id) {
        try{
            this.postRepository.deleteById(id);
            return "Successfully deleted post with id " + id;
        } catch (Exception e) {
            return "Failed deleting post with id " + id;
        }
    }
}
