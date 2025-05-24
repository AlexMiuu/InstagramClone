package proiect.proiectPs.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import proiect.proiectPs.entity.Comment;

@Repository
public interface CommentRepository extends CrudRepository<Comment, Long> {
}
