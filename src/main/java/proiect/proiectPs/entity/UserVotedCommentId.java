package proiect.proiectPs.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserVotedCommentId implements Serializable {


    @Column(name = "user_id")
    private Long userId;

    @Column(name = "comment_id")
    private Long commentId;

    // Constructors
    public UserVotedCommentId() {}

    public UserVotedCommentId(Long userId, Long commentId) {
        this.userId = userId;
        this.commentId = commentId;
    }

    // Getters and setters
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public Long getCommentId() {
        return commentId;
    }
    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }
}
