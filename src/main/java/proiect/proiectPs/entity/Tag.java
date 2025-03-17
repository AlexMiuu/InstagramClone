package proiect.proiectPs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Tag")
public class Tag {

    @Id
    @Column(name = "tag_text")
    private String tagText;

    public Tag() {}

    public Tag(String tagText) {
        this.tagText = tagText;
    }

    public String getTagText() {
        return tagText;
    }

    public void setTagText(String tagText) {
        this.tagText = tagText;
    }
}
