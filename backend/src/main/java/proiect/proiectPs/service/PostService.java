package proiect.proiectPs.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

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

    @Value("${filestorage.url:http://localhost:8081/files}")
    private String fileStorageUrl;

    private final RestTemplate restTemplate = new RestTemplate();

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
        post.setPost_date(new Date()); // Set current date
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
        post.setPost_date(new Date()); // Set current date
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
        posts.sort((a, b) -> {
            int scoreDiff = Integer.compare(getPostScore(b.getId()), getPostScore(a.getId()));
            if (scoreDiff != 0) return scoreDiff;
            Date d1 = a.getPost_date();
            Date d2 = b.getPost_date();
            if (d1 == null && d2 == null) return 0;
            if (d1 == null) return 1;
            if (d2 == null) return -1;
            return d2.compareTo(d1); // Descending (newest first)
        });
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

    // Uploads a file to the file storage microservice and returns the stored filename
    public String uploadFileToStorage(MultipartFile file) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        ByteArrayResource fileAsResource;
        try {
            fileAsResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
        } catch (Exception e) {
            throw new RuntimeException("Failed to read file for upload", e);
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileAsResource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
            fileStorageUrl + "/upload", requestEntity, String.class
        );
        // The microservice returns a message with the filename at the end
        // e.g., "File uploaded successfully! Download URI: http://.../files/{filename}"
        String responseBody = response.getBody();
        if (responseBody != null && responseBody.contains("/files/")) {
            return responseBody.substring(responseBody.lastIndexOf("/files/") + 7).trim();
        }
        throw new RuntimeException("File upload failed: " + responseBody);
    }

    // Downloads a file from the file storage microservice as a byte array
    public byte[] downloadFileFromStorage(String filename) {
        String url = fileStorageUrl + "/" + filename;
        ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);
        if (response.getStatusCode().is2xxSuccessful()) {
            return response.getBody();
        }
        throw new RuntimeException("Failed to download file: " + filename);
    }

    // Example: update createPost to accept MultipartFile and upload image
    public Post createPostWithImage(Post post, List<String> tags, MultipartFile imageFile) {
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
        post.setPost_date(new Date()); // Set current date

        // Upload image to file storage microservice
        if (imageFile != null && !imageFile.isEmpty()) {
            String storedFilename = uploadFileToStorage(imageFile);
            post.setImage_link(storedFilename); // Save only the filename
        }

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

    // --- New functionalities ---

    public List<Post> getPostsSortedByDate() {
        List<Post> posts = (List<Post>) postRepository.findAll();
        posts.sort((a, b) -> {
            Date d1 = a.getPost_date();
            Date d2 = b.getPost_date();
            if (d1 == null && d2 == null) return 0;
            if (d1 == null) return 1;
            if (d2 == null) return -1;
            return d2.compareTo(d1); // Descending (newest first)
        });
        return posts;
    }

    public List<Post> getPostsFilteredByTitle(String search) {
        List<Post> posts = (List<Post>) postRepository.findAll();
        String searchLower = search == null ? "" : search.toLowerCase();
        return posts.stream()
            .filter(p -> p.getTitle() != null && p.getTitle().toLowerCase().contains(searchLower))
            .collect(Collectors.toList());
    }

    public List<Post> getPostsFilteredByUsername(String username) {
        List<Post> posts = (List<Post>) postRepository.findAll();
        String usernameLower = username == null ? "" : username.toLowerCase();
        return posts.stream()
            .filter(p -> p.getUser() != null && p.getUser().getUsername() != null &&
                         p.getUser().getUsername().toLowerCase().equals(usernameLower))
            .collect(Collectors.toList());
    }
}
