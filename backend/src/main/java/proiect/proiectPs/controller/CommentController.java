package proiect.proiectPs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import proiect.proiectPs.entity.Comment;
import proiect.proiectPs.service.CommentService;

@CrossOrigin(origins = "http://localhost:4200")
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

    @PostMapping("/vote")
    @ResponseBody
    public String voteComment(@RequestParam Long commentId, @RequestParam boolean upvote, @RequestParam Long userId) {
        return this.commentService.voteComment(commentId, upvote, userId);
    }

    @PutMapping("/editComment")
    @ResponseBody
    public Comment editComment(@RequestParam Long commentId, @RequestBody String newText, @RequestParam Long userId) {
        return this.commentService.editComment(commentId, newText, userId);
    }

    @GetMapping("/getAllSorted")
    @ResponseBody
    public List<Comment> getAllCommentsSortedByScore() {
        return this.commentService.getAllCommentsSortedByScore();
    }

    @GetMapping("/score")
    @ResponseBody
    public int getCommentScore(@RequestParam Long commentId) {
        return this.commentService.getCommentScore(commentId);
    }
}
