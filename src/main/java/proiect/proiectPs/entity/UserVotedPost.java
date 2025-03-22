package proiect.proiectPs.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_voted_post")
public class UserVotedPost {

    @EmbeddedId
    private  UserVotedPostId id = new UserVotedPostId();

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "id")
    private User user;

    @ManyToOne
    @MapsId("postId")
    @JoinColumn(name = "id")
    private Post post;

    @Column(name="vote")
    private int vote;

    public UserVotedPost(UserVotedPostId id, User user, Post post, int vote) {
        this.id = id;
        this.user = user;
        this.post = post;
        this.vote = vote;
    }

    public UserVotedPost() {
    }

    public UserVotedPostId getId() {
        return id;
    }

    public void setId(UserVotedPostId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public int getVote() {
        return vote;
    }

    public void setVote(int vote) {
        this.vote = vote;
    }
}
