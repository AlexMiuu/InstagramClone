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
   * Get comments for a specific post
   */
  getCommentsByPostId(postId: string): Observable<Comment[]> {
    const params = new HttpParams().set("postId", postId)
    return this.http
      .get<any[]>(`${this.apiUrl}/byPost`, { params })
      .pipe(map((comments) => this.mapCommentsFromBackend(comments)))
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
      text: text,
      post_date: new Date(),
      user: { id: Number(userId) },
      post: { id: Number(postId) },
    }

    return this.http.post<any>(`${this.apiUrl}/insertComment`, comment).pipe(
      map((response) => {
        const mappedComment = this.mapCommentFromBackend(response)
        if (!mappedComment.postId) {
          mappedComment.postId = postId
        }
        return mappedComment
      }),
    )
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
    return this.http.delete<string>(`${this.apiUrl}/deleteComment`, {
      params,
      responseType: "text" as "json",
    })
  }

  /**
   * Vote on a comment (upvote or downvote)
   */
  voteComment(commentId: string, upvote: boolean, userId: string): Observable<string> {
    const params = new HttpParams().set("commentId", commentId).set("upvote", upvote.toString()).set("userId", userId)

    return this.http.post<string>(`${this.apiUrl}/vote`, null, {
      params,
      responseType: "text" as "json",
    })
  }

  /**
   * Edit a comment's text
   */
  editComment(commentId: string, newText: string, userId: string): Observable<Comment> {
    const params = new HttpParams().set("commentId", commentId).set("userId", userId)

    return this.http
      .put<any>(`${this.apiUrl}/editComment`, newText, {
        params,
        headers: { "Content-Type": "text/plain" },
      })
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
    let postId = ""
    if (backendComment.post?.id) {
      postId = backendComment.post.id.toString()
    } else if (backendComment.post_id) {
      postId = backendComment.post_id.toString()
    }

    let userId = ""
    let username = "Unknown User"

    if (backendComment.user) {
      userId = backendComment.user.id?.toString() || ""
      username = backendComment.user.username || backendComment.user.email || "Unknown User"
    } else if (backendComment.user_id) {
      userId = backendComment.user_id.toString()
    }

    if (username === "Unknown User" && backendComment.username) {
      username = backendComment.username
    }

    return {
      id: backendComment.id?.toString() || "",
      userId: userId,
      username: username,
      text: backendComment.text || "",
      timestamp: new Date(backendComment.post_date || backendComment.created_at || new Date()),
      score: backendComment.score || 0,
      postId: postId,
      post_date: new Date(backendComment.post_date || new Date()),
      user: backendComment.user,
      post: backendComment.post,
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
      user: comment.user || { id: Number.parseInt(comment.userId) },
      post: comment.post || { id: Number.parseInt(comment.postId || "") },
      text: comment.text || "",
      post_date: comment.post_date || comment.timestamp || new Date(),
    }
  }
}
