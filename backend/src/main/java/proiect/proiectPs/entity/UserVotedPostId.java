package proiect.proiectPs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public class UserVotedPostId implements Serializable {
    @Column(name = "user_id")
    private Long userId;
    @Column(name = "post_id")
    private Long postId;

    public UserVotedPostId() {
    }

    public UserVotedPostId(Long userId, Long postId) {
        this.userId = userId;
        this.postId = postId;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
