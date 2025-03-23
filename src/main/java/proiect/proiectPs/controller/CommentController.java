package proiect.proiectPs.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import proiect.proiectPs.entity.Comment;
import proiect.proiectPs.entity.Post;
import proiect.proiectPs.service.CommentService;

import java.util.List;

@RestController
@RequestMapping("/comments")
public class CommentController {
    @Autowired
    private CommentService commentService;

    @GetMapping("/getAll")
    @ResponseBody
    public List<Comment> retrieveAllComments() {
        return this.commentService.retrieveAllComments();
    }

    @PostMapping("/insertComment")
    @ResponseBody
    public Comment insertComment(@RequestBody Comment comment) {
        return this.commentService.insertComment(comment);
    }

    @PutMapping("/updateComment")
    @ResponseBody
    public Comment updateComment(@RequestBody Comment comment){
        return this.commentService.insertComment(comment);
    }

    @DeleteMapping("/deleteComment")
    @ResponseBody
    public String deleteCommentById(@RequestParam Long id) {
        return this.commentService.deleteCommentById(id);
    }
}
