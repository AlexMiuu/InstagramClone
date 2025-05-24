package proiect.proiectPs.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import proiect.proiectPs.entity.Post;
import proiect.proiectPs.entity.PostHasTag;
import proiect.proiectPs.entity.PostHasTagId;
import proiect.proiectPs.entity.Tag;
import proiect.proiectPs.entity.User;
import proiect.proiectPs.entity.UserVotedPost;
import proiect.proiectPs.entity.UserVotedPostId;
import proiect.proiectPs.repository.PostHasTagRepository;
import proiect.proiectPs.repository.PostRepository;
import proiect.proiectPs.repository.TagRepository;
import proiect.proiectPs.repository.UserRepository;
import proiect.proiectPs.repository.UserVotedPostRepository;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserVotedPostRepository userVotedPostRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private PostHasTagRepository postHasTagRepository;

    public List<Post> retrievePosts() {
        return (List<Post>) this.postRepository.findAll();
    }

    public Post insertPost(Post post) {
        // Set user to the currently authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User must be logged in to create a post");
        }
        String currentEmail = auth.getName();
        User user = userRepository.findByEmail(currentEmail);
        if (user == null) {
            throw new RuntimeException("Authenticated user not found");
        }
        post.setUser(user);
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

    public Post createPost(Post post, List<String> tags) {
        // Only authenticated users can create posts
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User must be logged in to create a post");
        }
        String currentEmail = auth.getName();
        User user = userRepository.findByEmail(currentEmail);
        if (user == null) {
            throw new RuntimeException("Authenticated user not found");
        }
        post.setUser(user);
        Post savedPost = this.postRepository.save(post);

        // Attach tags to post
        Set<String> uniqueTags = new HashSet<>(tags);
        for (String tagText : uniqueTags) {
            Tag tag = tagRepository.findByName(tagText);
            if (tag == null) {
                tag = new Tag();
                tag.setTagText(tagText);
                tag.setName(tagText);
                tag = tagRepository.save(tag);
            }
            PostHasTagId phtId = new PostHasTagId(savedPost.getId(), tag.getTagText().hashCode() * 1L); // Use a unique id if needed
            PostHasTag pht = new PostHasTag(phtId);
            postHasTagRepository.save(pht);
        }
        return savedPost;
    }

    public String upvotePost(Long postId, Long userId) {
        // Only authenticated users can upvote
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return "User must be logged in to upvote";
        }
        // Only allow one upvote per user per post
        UserVotedPostId id = new UserVotedPostId(userId, postId);
        if (userVotedPostRepository.existsById(id)) {
            return "You have already voted on this post";
        }
        User user = userRepository.findById(userId).orElse(null);
        Post post = postRepository.findById(postId).orElse(null);
        if (user == null || post == null) {
            return "User or post not found";
        }
        UserVotedPost vote = new UserVotedPost(id, user, post, 1);
        userVotedPostRepository.save(vote);
        return "Upvoted successfully";
    }

    public Post editPost(Long postId, Post post, Long userId) {
        Post existingPost = postRepository.findById(postId).orElse(null);
        if (existingPost == null) return null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !existingPost.getUser().getId().equals(userId)) {
            return null; // Only owner or admin can edit
        }
        if (post.getTitle() != null) existingPost.setTitle(post.getTitle());
        if (post.getText() != null) existingPost.setText(post.getText());
        if (post.getPost_date() != null) existingPost.setPost_date(post.getPost_date());
        if (post.getUser() != null && isAdmin) existingPost.setUser(post.getUser());
        // Optionally handle image update
        return postRepository.save(existingPost);
    }

    public List<Post> getAllPostsSortedByScore() {
        List<Post> posts = (List<Post>) postRepository.findAll();
        posts.sort((a, b) -> Integer.compare(getPostScore(b.getId()), getPostScore(a.getId())));
        return posts;
    }

    public List<Post> getPostsByTag(String tag) {
        // Find tag entity
        Tag tagEntity = tagRepository.findByName(tag);
        if (tagEntity == null) return new ArrayList<>();
        // Find all PostHasTag with this tag
        List<PostHasTag> postHasTags = postHasTagRepository.findById_TagId(tagEntity.getTagText().hashCode() * 1L);
        List<Post> posts = new ArrayList<>();
        for (PostHasTag pht : postHasTags) {
            Post post = postRepository.findById(pht.getId().getPostId()).orElse(null);
            if (post != null) posts.add(post);
        }
        posts.sort((a, b) -> Integer.compare(getPostScore(b.getId()), getPostScore(a.getId())));
        return posts;
    }

    public int getPostScore(Long postId) {
        List<UserVotedPost> votes = userVotedPostRepository.findByPost_Id(postId);
        int score = 0;
        for (UserVotedPost vote : votes) {
            score += vote.getVote();
        }
        return score;
    }
}
