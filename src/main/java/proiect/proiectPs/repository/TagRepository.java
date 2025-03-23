package proiect.proiectPs.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import proiect.proiectPs.entity.Tag;

@Repository
public interface TagRepository extends CrudRepository<Tag, Long> {
}
