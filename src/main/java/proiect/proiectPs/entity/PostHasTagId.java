package proiect.proiectPs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public class PostHasTagId implements Serializable {
    @Column(name = "post_id")
    private Long postId;
    @Column(name = "tag_id")
    private Long tagId;

    public PostHasTagId() {
    }

    public PostHasTagId(Long postId, Long tagId) {
        this.postId = postId;
        this.tagId = tagId;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public Long getTagId() {
        return tagId;
    }

    public void setTagId(Long tagId) {
        this.tagId = tagId;
    }
}
