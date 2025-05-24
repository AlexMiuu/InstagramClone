import { Injectable } from "@angular/core"
import { BehaviorSubject,  Observable, of } from "rxjs"
import  { Tag } from "../interfaces/post.interface"
import { v4 as uuidv4 } from "uuid"

@Injectable({
  providedIn: "root",
})
export class TagService {
  private tags: Tag[] = [
    { id: "1", name: "travel" },
    { id: "2", name: "food" },
    { id: "3", name: "fashion" },
    { id: "4", name: "photography" },
  ]

  private tagsSubject = new BehaviorSubject<Tag[]>(this.tags)

  constructor() {}

  getTags(): Observable<Tag[]> {
    return this.tagsSubject.asObservable()
  }

  createTag(name: string): Observable<Tag> {
    // Check if tag already exists
    const existingTag = this.tags.find((t) => t.name.toLowerCase() === name.toLowerCase())
    if (existingTag) {
      return of(existingTag)
    }

    // Create new tag
    const newTag: Tag = {
      id: uuidv4(),
      name: name.toLowerCase(),
    }

    this.tags.push(newTag)
    this.tagsSubject.next(this.tags)
    return of(newTag)
  }

  searchTags(query: string): Observable<Tag[]> {
    if (!query) {
      return of(this.tags)
    }

    const filteredTags = this.tags.filter((tag) => tag.name.toLowerCase().includes(query.toLowerCase()))
    return of(filteredTags)
  }
}
