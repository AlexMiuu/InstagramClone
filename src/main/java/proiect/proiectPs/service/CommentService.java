package proiect.proiectPs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import proiect.proiectPs.entity.Comment;
import proiect.proiectPs.entity.User;
import proiect.proiectPs.entity.UserVotedComment;
import proiect.proiectPs.entity.UserVotedCommentId;
import proiect.proiectPs.repository.UserVotedCommentRepository;
import proiect.proiectPs.repository.CommentRepository;
import proiect.proiectPs.repository.UserRepository;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserVotedCommentRepository userVotedCommentRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Comment> retrieveAllComments(){
        return (List<Comment>) this.commentRepository.findAll();
    }

    public Comment insertComment(Comment comment) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("User must be logged in to comment");
        }
        String currentEmail = auth.getName();
        User user = userRepository.findByEmail(currentEmail);
        if (user == null) {
            throw new RuntimeException("Authenticated user not found");
        }
        comment.setUser(user);
        return this.commentRepository.save(comment);
    }

    public String deleteCommentById(Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return "Not authenticated";
        }
        Comment comment = commentRepository.findById(id).orElse(null);
        if (comment == null) return "Comment not found";
        User user = comment.getUser();
        String currentEmail = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && (user == null || !user.getEmail().equals(currentEmail))) {
            return "You can only delete your own comment";
        }
        try {
            this.commentRepository.deleteById(id);
            return "Successfully deleted comment with id " + id;
        } catch (Exception e) {
            return "Failed deleting the comment with the id " + id;
        }
    }

    public String voteComment(Long commentId, boolean upvote, Long userId) {
        // Only allow one vote per user per comment; update if exists, else create
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment == null) return "Comment not found";
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return "User not found";

        UserVotedCommentId voteId = new UserVotedCommentId(userId, commentId);
        UserVotedComment vote = userVotedCommentRepository.findById(voteId).orElse(null);
        int voteValue = upvote ? 1 : -1;
        if (vote == null) {
            vote = new UserVotedComment(user, comment, voteValue);
        } else {
            vote.setVote(voteValue);
        }
        userVotedCommentRepository.save(vote);
        return "Voted successfully";
    }

    public Comment editComment(Long commentId, String newText, Long userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment == null) return null;
        User user = comment.getUser();
        String currentEmail = auth.getName();
        if (user == null || !user.getEmail().equals(currentEmail)) {
            return null; // Not owner
        }
        comment.setText(newText);
        return commentRepository.save(comment);
    }

    public List<Comment> getAllCommentsSortedByScore() {
        List<Comment> comments = (List<Comment>) commentRepository.findAll();
        comments.sort((a, b) -> {
            int scoreA = getCommentScore(a.getId());
            int scoreB = getCommentScore(b.getId());
            return Integer.compare(scoreB, scoreA);
        });
        return comments;
    }

    public int getCommentScore(Long commentId) {
        List<UserVotedComment> votes = userVotedCommentRepository.findByComment_Id(commentId);
        int score = 0;
        for (UserVotedComment vote : votes) {
            score += vote.getVote();
        }
        return score;
    }
}
