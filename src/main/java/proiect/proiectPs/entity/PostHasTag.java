package proiect.proiectPs.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Post_hs_Tag")
public class PostHasTag {

   @EmbeddedId
    private PostHasTagId id = new PostHasTagId();

    public PostHasTag() {
    }

    public PostHasTag(PostHasTagId id) {
        this.id = id;
    }

    public PostHasTagId getId() {
        return id;
    }

    public void setId(PostHasTagId id) {
        this.id = id;
    }
}
