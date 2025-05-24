package proiect.proiectPs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import proiect.proiectPs.entity.Tag;
import proiect.proiectPs.repository.TagRepository;

@Service
public class TagService {
    @Autowired
    private TagRepository tagRepository;

    public List<Tag> retrieveAllTags() {
        return (List<Tag>) this.tagRepository.findAll();
    }

    public Tag insertTag(Tag tag) {
        // Check if tag exists, if not create
        Tag existing = tagRepository.findByName(tag.getTagText());
        if (existing != null) return existing;
        return this.tagRepository.save(tag);
    }

    public Tag insertOrUpdateTag(Tag tag) {
        Tag existing = tagRepository.findByName(tag.getTagText());
        if (existing != null) {
            return existing;
        }
        return this.tagRepository.save(tag);
    }

    public List<Tag> searchTagsBySubstring(String substring) {
        return tagRepository.findByTagTextContainingIgnoreCase(substring);
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
