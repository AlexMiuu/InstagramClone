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

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    public Tag() {}

    public Tag(String tagText, String name) {
        this.tagText = tagText;
        this.name = name;
    }

    public String getTagText() {
        return tagText;
    }

    public void setTagText(String tagText) {
        this.tagText = tagText;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
