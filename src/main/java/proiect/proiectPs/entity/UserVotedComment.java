package proiect.proiectPs.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_voted_comment")
public class UserVotedComment {

    @EmbeddedId
    private UserVotedCommentId id = new UserVotedCommentId();

    // Many-to-one association with User; maps the userId field from the composite key
    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "id")
    private User user;

    // Many-to-one association with Comment; maps the commentId field from the composite key
    @ManyToOne
    @MapsId("commentId")
    @JoinColumn(name = "id")
    private Comment comment;

    // Extra field to store vote information: e.g., +1 for upvote, -1 for downvote.
    @Column( name = "vote")
    private int vote;

    // Constructors
    public UserVotedComment() {}

    public UserVotedComment(User user, Comment comment, int vote) {
        this.user = user;
        this.comment = comment;
        this.vote = vote;
        this.id = new UserVotedCommentId(user.getId(), comment.getId());
    }

    // Getters and setters
    public UserVotedCommentId getId() {
        return id;
    }
    public void setId(UserVotedCommentId id) {
        this.id = id;
    }
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
        if (this.id == null) {
            this.id = new UserVotedCommentId();
        }
        this.id.setUserId(user.getId());
    }
    public Comment getComment() {
        return comment;
    }
    public void setComment(Comment comment) {
        this.comment = comment;
        if (this.id == null) {
            this.id = new UserVotedCommentId();
        }
        this.id.setCommentId(comment.getId());
    }
    public int getVote() {
        return vote;
    }
    public void setVote(int vote) {
        this.vote = vote;
    }
}
