package proiect.proiectPs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import proiect.proiectPs.entity.Comment;
import proiect.proiectPs.repository.CommentRepository;

import java.util.List;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;

    public List<Comment> retrieveAllComments(){
        return (List<Comment>) this.commentRepository.findAll();
    }

    public Comment insertComment(Comment comment) {
        return this.commentRepository.save(comment);
    }

    public String deleteCommentById(Long id) {
        try {
            this.commentRepository.deleteById(id);
            return "Successfully deleted comment with id " + id;
        } catch (Exception e) {
            return "Failed deleting the comment with the id " + id;
        }
    }
}
