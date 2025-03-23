package proiect.proiectPs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import proiect.proiectPs.entity.Post;
import proiect.proiectPs.entity.Tag;
import proiect.proiectPs.repository.TagRepository;

import java.util.List;

@Service
public class TagService {
    @Autowired
    private TagRepository tagRepository;

    public List<Tag> retrieveAllTags() {
        return (List<Tag>) this.tagRepository.findAll();
    }

    public Tag insertTag(Tag tag) {
        return this.tagRepository.save(tag);
    }

    public String deleteTagById(Long id) {
        try{
            this.tagRepository.deleteById(id);
            return "Successfully deleted tag with id " + id;
        } catch (Exception e) {
            return "Failed deleting tag with id " + id;
        }
    }

}
