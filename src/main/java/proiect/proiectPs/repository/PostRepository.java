package proiect.proiectPs.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import proiect.proiectPs.entity.Post;

@Repository
public interface PostRepository extends CrudRepository<Post,Long> {
}
