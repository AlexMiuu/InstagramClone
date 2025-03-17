package proiect.proiectPs.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "User_voted_Post")
public class UserVotedPost {

    @Id
    @Column(name = "vote_type")
    private boolean vote_type;

    @OneToOne()
    @JoinColumn(name = "id")
    private User user;

    @OneToOne()
    @JoinColumn(name = "id")
    private Post post;

    public UserVotedPost() {}

    public UserVotedPost(boolean vote_type, User user, Post post) {
        this.vote_type = vote_type;
        this.user = user;
        this.post = post;
    }

    public boolean isVote_type() {
        return vote_type;
    }

    public void setVote_type(boolean vote_type) {
        this.vote_type = vote_type;
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


}
