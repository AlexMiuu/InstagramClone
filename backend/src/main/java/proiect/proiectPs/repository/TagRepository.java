package proiect.proiectPs.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import proiect.proiectPs.entity.Tag;

@Repository
public interface TagRepository extends CrudRepository<Tag, Long> {
    Tag findByName(String tagText);
    // For search by substring
    List<Tag> findByTagTextContainingIgnoreCase(String substring);
}
