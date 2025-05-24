package proiect.proiectPs.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "Post_has_Tag")
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
