package proiect.proiectPs.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import proiect.proiectPs.entity.PostHasTag;
import proiect.proiectPs.entity.PostHasTagId;

public interface PostHasTagRepository extends JpaRepository<PostHasTag, PostHasTagId> {
    List<PostHasTag> findById_TagId(Long tagId);
    List<PostHasTag> findById_PostId(Long postId);
}
