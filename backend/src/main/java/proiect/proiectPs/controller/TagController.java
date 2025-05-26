package proiect.proiectPs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import proiect.proiectPs.entity.Tag;
import proiect.proiectPs.service.TagService;

@CrossOrigin(
    origins = "http://localhost:4200",
    allowCredentials = "true",
    allowedHeaders = "*"
)
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
