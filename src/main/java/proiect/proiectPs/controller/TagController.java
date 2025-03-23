package proiect.proiectPs.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import proiect.proiectPs.entity.Tag;
import proiect.proiectPs.service.TagService;

import java.util.List;

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

    @PostMapping("/insertTag")
    @ResponseBody
    public Tag insertTag(@RequestBody Tag tag) {
        return this.tagService.insertTag(tag);
    }

    @PutMapping("/updateTag")
    @ResponseBody
    public Tag updateTag(@RequestBody Tag tag) {
        return this.tagService.insertTag(tag);
    }

    @DeleteMapping("/deleteTag")
    @ResponseBody
    public String deleteTagById(@RequestParam Long id) {
        return this.tagService.deleteTagById(id);
    }

}
