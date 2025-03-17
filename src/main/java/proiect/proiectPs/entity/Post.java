package proiect.proiectPs.entity;

import jakarta.persistence.*;

import java.awt.image.BufferedImage;
import java.util.Date;


@Entity
@Table(name = "Post")
public class Post {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne()
    @JoinColumn(name = "id")
    private User user;

    @Column(name = "title")
    private String title;

    @Column(name = "text")
    private String text;

    @Column(name = "post_date")
    private Date post_date;

    //@Column(name = "image") ???????????????????

    //@Column(name = "state") ????????????????????

    public Post() {}

    public Post(Long id, User user, String title, String text, Date post_date) {
        this.id = id;
        this.user = user;
        this.title = title;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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
