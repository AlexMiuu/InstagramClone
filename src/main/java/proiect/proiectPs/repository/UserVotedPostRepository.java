package proiect.proiectPs.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import proiect.proiectPs.entity.UserVotedPost;
import proiect.proiectPs.entity.UserVotedPostId;

public interface UserVotedPostRepository extends JpaRepository<UserVotedPost, UserVotedPostId> {
    List<UserVotedPost> findByPost_User_Id(Long userId);
    List<UserVotedPost> findByPost_Id(Long postId);
}