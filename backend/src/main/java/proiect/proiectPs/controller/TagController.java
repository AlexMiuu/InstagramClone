package proiect.proiectPs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import proiect.proiectPs.entity.Tag;
import proiect.proiectPs.service.TagService;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/tags")
public class TagController {
    @Autowired
    private TagService tagService;

    @GetMapping("/getAll")
    @ResponseBody
    public List<Tag> retrieveAllTags() {
        return this.tagService.retrieveAllTags();
    }

    @GetMapping("/search")
    @ResponseBody
    public List<Tag> searchTags(@RequestParam String substring) {
        return this.tagService.searchTagsBySubstring(substring);
    }

    @PostMapping("/create")
    @ResponseBody
    public Tag createTag(@RequestBody Tag tag) {
        return this.tagService.insertOrUpdateTag(tag);
    }

    @PutMapping("/updateTag")
    @ResponseBody
    public Tag updateTag(@RequestBody Tag tag) {
        return this.tagService.insertOrUpdateTag(tag);
    }

    @DeleteMapping("/delete")
    @ResponseBody
    public String deleteTag(@RequestParam Long id) {
        return this.tagService.deleteTagById(id);
    }

}
