package proiect.proiectPs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scripting.bsh.BshScriptUtils;
import org.springframework.stereotype.Service;
import proiect.proiectPs.entity.Comment;
import proiect.proiectPs.entity.Post;
import proiect.proiectPs.repository.CommentRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;

    public List<Comment> retrieveAllComments(){
        return (List<Comment>) this.commentRepository.findAll();
    }

    public Comment insertComment(Comment comment) {
        System.out.print("inside service");
        System.out.println(comment.getId());
        System.out.println(comment.getPost());
        System.out.println(comment.getUser());
        return this.commentRepository.save(comment);
    }

    public String deleteCommentById(Long id) {
        try {
            System.out.println("idul primit:");
            System.out.println(id);
            this.commentRepository.deleteById(id);
            return "Successfully deleted comment with id " + id;
        } catch (Exception e) {
            return "Failed deleting the comment with the id " + id;
        }
    }
}
