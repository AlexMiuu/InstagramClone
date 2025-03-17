package proiect.proiectPs.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "User_voted_Comment")
public class UserVotedComment {

    @Id
    @Column(name = "vote_type")
    private boolean vote_type;

    @OneToOne()
    @JoinColumn(name = "id")
    private User user;

    @OneToOne()
    @JoinColumn(name = "id")
    private Comment comment;

    public UserVotedComment() {}
    public UserVotedComment(boolean vote_type, User user, Comment comment) {
        this.vote_type = vote_type;
        this.user = user;
        this.comment = comment;
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

    public Comment getComment() {
        return comment;
    }

    public void setComment(Comment comment) {
        this.comment = comment;
    }
}
