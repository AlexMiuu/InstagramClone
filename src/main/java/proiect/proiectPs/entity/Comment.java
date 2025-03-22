package proiect.proiectPs.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "comment")
public class Comment {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne()
    @JoinColumn(name = "id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "id")
    private Post post;

    @Column(name = "text")
    private String text;

    @Column(name = "post_date")
    private Date post_date;

    public Comment(){}

    public Comment(Long id, User user, Post post, String text, Date post_date) {
        this.id = id;
        this.user = user;
        this.post = post;
        this.text = text;
        this.post_date = post_date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Date getPost_date() {
        return post_date;
    }

    public void setPost_date(Date post_date) {
        this.post_date = post_date;
    }
}
