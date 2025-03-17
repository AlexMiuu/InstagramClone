package proiect.proiectPs.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Post_hs_Tag")
public class PostHasTag {

    @OneToOne()
    @JoinColumn(name = "id")
    private Post post;

    @OneToOne()
    @JoinColumn(name = "tag_text")
    private Tag tag;
}
