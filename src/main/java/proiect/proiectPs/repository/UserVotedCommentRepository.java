package proiect.proiectPs.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import proiect.proiectPs.entity.UserVotedComment;
import proiect.proiectPs.entity.UserVotedCommentId;

public interface UserVotedCommentRepository extends JpaRepository<UserVotedComment, UserVotedCommentId> {
    List<UserVotedComment> findByComment_User_Id(Long userId);
    List<UserVotedComment> findByComment_Id(Long commentId);
}