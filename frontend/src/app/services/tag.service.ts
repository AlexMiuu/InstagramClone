import { Injectable } from "@angular/core"
import {  HttpClient, HttpParams } from "@angular/common/http"
import  { Observable } from "rxjs"
import { map } from "rxjs/operators"
import  { Tag } from "../interfaces/post.interface"
import { environment } from "../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class TagService {
  private apiUrl = `${environment.apiUrl}/tags`

  constructor(private http: HttpClient) {}

  /**
   * Get all tags from the backend
   */
  getTags(): Observable<Tag[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAll`).pipe(map((tags) => this.mapTagsFromBackend(tags)))
  }

  /**
   * Search tags by substring
   */
  searchTags(query: string): Observable<Tag[]> {
    if (!query || query.trim() === "") {
      return this.getTags()
    }

    const params = new HttpParams().set("substring", query)
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params }).pipe(map((tags) => this.mapTagsFromBackend(tags)))
  }

  /**
   * Create a new tag
   */
  createTag(name: string): Observable<Tag> {
    const tag = { name: name.toLowerCase() }
    return this.http.post<any>(`${this.apiUrl}/create`, tag).pipe(map((tag) => this.mapTagFromBackend(tag)))
  }

  /**
   * Update an existing tag
   */
  updateTag(tag: Tag): Observable<Tag> {
    const backendTag = this.mapTagToBackend(tag)
    return this.http.put<any>(`${this.apiUrl}/updateTag`, backendTag).pipe(map((tag) => this.mapTagFromBackend(tag)))
  }

  /**
   * Delete a tag by ID
   */
  deleteTag(id: string): Observable<string> {
    const params = new HttpParams().set("id", id)
    return this.http.delete<string>(`${this.apiUrl}/delete`, { params })
  }

  /**
   * Map a backend tag to the frontend Tag interface
   */
  private mapTagFromBackend(backendTag: any): Tag {
    return {
      id: backendTag.id.toString(),
      name: backendTag.name,
    }
  }

  /**
   * Map multiple backend tags to frontend Tag interface
   */
  private mapTagsFromBackend(backendTags: any[]): Tag[] {
    return backendTags.map((tag) => this.mapTagFromBackend(tag))
  }

  /**
   * Map a frontend Tag to the backend format
   */
  private mapTagToBackend(tag: Tag): any {
    return {
      id: tag.id ? Number.parseInt(tag.id) : null,
      name: tag.name,
    }
  }
}
