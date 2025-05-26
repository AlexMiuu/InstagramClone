import { Injectable } from "@angular/core"
import {  HttpClient, HttpParams } from "@angular/common/http"
import  { Observable } from "rxjs"
import { map } from "rxjs/operators"
import  { Comment } from "../interfaces/post.interface"
import { environment } from "../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`

  constructor(private http: HttpClient) {}

  /**
   * Get all comments
   */
  getAllComments(): Observable<Comment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAll`).pipe(map((comments) => this.mapCommentsFromBackend(comments)))
  }

  /**
   * Get all comments sorted by score
   */
  getAllCommentsSorted(): Observable<Comment[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/getAllSorted`)
      .pipe(map((comments) => this.mapCommentsFromBackend(comments)))
  }

  /**
   * Create a new comment
   */
  createComment(postId: string, userId: string, text: string): Observable<Comment> {
    const comment = {
      post_id: Number(postId),
      user_id: Number(userId),
      text: text,
      created_at: new Date(),
    }

    return this.http
      .post<any>(`${this.apiUrl}/insertComment`, comment)
      .pipe(map((comment) => this.mapCommentFromBackend(comment)))
  }

  /**
   * Update an existing comment
   */
  updateComment(comment: Comment): Observable<Comment> {
    const backendComment = this.mapCommentToBackend(comment)
    return this.http
      .put<any>(`${this.apiUrl}/updateComment`, backendComment)
      .pipe(map((comment) => this.mapCommentFromBackend(comment)))
  }

  /**
   * Delete a comment by ID
   */
  deleteComment(id: string): Observable<string> {
    const params = new HttpParams().set("id", id)
    return this.http.delete<string>(`${this.apiUrl}/deleteComment`, { params })
  }

  /**
   * Vote on a comment (upvote or downvote)
   */
  voteComment(commentId: string, upvote: boolean, userId: string): Observable<string> {
    const params = new HttpParams().set("commentId", commentId).set("upvote", upvote.toString()).set("userId", userId)

    return this.http.post<string>(`${this.apiUrl}/vote`, null, { params })
  }

  /**
   * Edit a comment's text
   */
  editComment(commentId: string, newText: string, userId: string): Observable<Comment> {
    const params = new HttpParams().set("commentId", commentId).set("userId", userId)

    return this.http
      .put<any>(`${this.apiUrl}/editComment`, newText, { params })
      .pipe(map((comment) => this.mapCommentFromBackend(comment)))
  }

  /**
   * Get the score of a specific comment
   */
  getCommentScore(commentId: string): Observable<number> {
    const params = new HttpParams().set("commentId", commentId)
    return this.http.get<number>(`${this.apiUrl}/score`, { params })
  }

  /**
   * Map a backend comment to the frontend Comment interface
   */
  private mapCommentFromBackend(backendComment: any): Comment {
    return {
      id: backendComment.id.toString(),
      userId: backendComment.user_id.toString(),
      username: backendComment.username || "Unknown User",
      text: backendComment.text || "",
      timestamp: new Date(backendComment.created_at || new Date()),
      score: backendComment.score || 0,
    }
  }

  /**
   * Map multiple backend comments to frontend Comment interface
   */
  private mapCommentsFromBackend(backendComments: any[]): Comment[] {
    return backendComments.map((comment) => this.mapCommentFromBackend(comment))
  }

  /**
   * Map a frontend Comment to the backend format
   */
  private mapCommentToBackend(comment: Comment): any {
    return {
      id: comment.id ? Number.parseInt(comment.id) : null,
      user_id: comment.userId ? Number.parseInt(comment.userId) : null,
      post_id: comment.postId ? Number.parseInt(comment.postId) : null,
      text: comment.text || "",
      created_at: comment.timestamp || new Date(),
      score: comment.score || 0,
    }
  }
}
