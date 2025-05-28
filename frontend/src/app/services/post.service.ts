import { Injectable } from "@angular/core"
import {  HttpClient, HttpParams } from "@angular/common/http"
import { BehaviorSubject, Observable, of } from "rxjs"
import { map, switchMap, tap } from "rxjs/operators"
import  { Post, Tag, PostFilter } from "../interfaces/post.interface"
import { environment } from "../../environments/environment"
import  { AuthService } from "./auth.service"
import  { CommentService } from "./comment.service"

@Injectable({
  providedIn: "root",
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`
  private searchFilter = new BehaviorSubject<string>("")

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private commentService: CommentService,
  ) {}

  // Get all posts
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/getAll`).pipe(map((posts) => this.mapPostsFromBackend(posts)))
  }

  // Get all posts sorted by score
  getSortedPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/getAllSorted`).pipe(
      map((posts) => this.mapPostsFromBackend(posts)),
      map((posts) =>
        posts.sort((a, b) => {
          // Sort by score descending, then by date descending
          if (b.likes !== a.likes) {
            return b.likes - a.likes;
          }
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
        })
      )
    );
  }

  // Get all posts sorted by date
  getPostsSortedByDate(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/sortedByDate`).pipe(
      map((posts) => this.mapPostsFromBackend(posts)),
      map((posts) =>
        posts.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      )
    );
  }

  // Get posts filtered by username (for "only mine" toggle)
  getPostsFilteredByUsername(username: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/filterByUsername`, {
      params: { username }
    }).pipe(map((posts) => this.mapPostsFromBackend(posts)))
  }

  // Get posts filtered by title (for search)
  getPostsFilteredByTitle(title: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/filterByTitle`, {
      params: { search: title }
    }).pipe(map((posts) => this.mapPostsFromBackend(posts)))
  }

  // Get post by ID
  getPostById(id: string): Observable<Post | undefined> {
    // Since the backend doesn't have a direct endpoint for this,
    // we'll get all posts and filter
    return this.getPosts().pipe(map((posts) => posts.find((post) => post.id === id)))
  }

  // Create a new post with tags
  createPost(postData: Partial<Post>, tags: Tag[]): Observable<Post> {
    const tagNames = tags.map((tag) => tag.name)
    const post = this.preparePostForBackend(postData)

    return this.http
      .post<Post>(`${this.apiUrl}/create`, post, {
        params: { tags: tagNames },
      })
      .pipe(map((post) => this.mapPostFromBackend(post)))
  }

  // Create a post with image upload
// In src/app/services/post.service.ts

// Create a post with image upload
createPostWithImage(
  postData: { title: string; text: string }, // This only contains the core post fields
  tags: string[],                            // Tags are now a separate argument
  imageFile: File | null
): Observable<Post> {
  const formData = new FormData();

  // Part 1: Append the image file if it exists.
  if (imageFile) {
    formData.append('imageFile', imageFile, imageFile.name);
  }

  // Part 2: Append the 'post' JSON data as a Blob.
  // The backend expects a Post object, so we send title and text (description).
  // The backend will fill in the other details like id, author, etc.
  const postObject = { title: postData.title, text: postData.text };
  const postBlob = new Blob([JSON.stringify(postObject)], { type: 'application/json' });
  formData.append('post', postBlob);

  // Part 3: Append each tag under the 'tags' key.
  // This is how you send an array of strings in FormData.
  tags.forEach(tag => {
    formData.append('tags', tag);
  });

  // Send the request. HttpClient will set the multipart boundary automatically.
  return this.http.post<Post>(`${this.apiUrl}/createWithImage`, formData);
}

  // Update an existing post
  updatePost(id: string, postData: Partial<Post>, tags: Tag[]): Observable<Post | undefined> {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) {
      return of(undefined)
    }

    const post = this.preparePostForBackend({
      ...postData,
      id: id,
    })

    const tagNames = tags.map((tag) => tag.name)

    return this.http
      .put<Post>(`${this.apiUrl}/edit`, post, {
        params: {
          postId: id,
          userId: currentUser.id?.toString() || "",
          tags: tagNames,
        },
      })
      .pipe(map((post) => this.mapPostFromBackend(post)))
  }

  // Delete a post
  deletePost(id: string): Observable<boolean> {
    return this.http
      .delete<string>(`${this.apiUrl}/deletePost`, {
        params: { id: id },
      })
      .pipe(map((response) => response === "Post deleted successfully"))
  }

  // Like/upvote a post
  likePost(id: string): Observable<Post | undefined> {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) {
      return of(undefined)
    }

    return this.http
      .post<string>(`${this.apiUrl}/upvote`, null, {
        params: {
          postId: id,
          userId: currentUser.id?.toString() || "",
        },
      })
      .pipe(
        // After upvoting, get the updated post
        switchMap(() => this.getPostById(id))
      )
  }

  // Get posts filtered by tag
  getPostsByTag(tag: string): Observable<Post[]> {
    return this.http
      .get<Post[]>(`${this.apiUrl}/byTag`, {
        params: { tag: tag },
      })
      .pipe(map((posts) => this.mapPostsFromBackend(posts)))
  }

  // Get post image
  getPostImage(postId: string): string {
    return `${this.apiUrl}/image/${postId}`
  }

  // Get filtered posts
  getFilteredPosts(filter: PostFilter): Observable<Post[]> {
    // Start with all posts
    let postsObservable: Observable<Post[]>

    // If filtering by tag, use the specific endpoint
    if (filter.tag) {
      postsObservable = this.getPostsByTag(filter.tag)
    } else {
      // Otherwise get all posts
      postsObservable = this.getPosts()
    }

    return postsObservable.pipe(
      map((posts) => {
        let filteredPosts = posts

        // Apply search text filter if provided
        if (filter.searchText) {
          const searchText = filter.searchText.toLowerCase()
          filteredPosts = filteredPosts.filter(
            (post) => post.title.toLowerCase().includes(searchText) || post.text.toLowerCase().includes(searchText),
          )
        }

        // Filter by user ID if provided
        if (filter.userId) {
          filteredPosts = filteredPosts.filter((post) => post.authorId === filter.userId)
        }

        // Filter for current user's posts if requested
        if (filter.onlyMine) {
          const currentUser = this.authService.getCurrentUser()
          if (currentUser) {
            filteredPosts = filteredPosts.filter((post) => post.authorId === (currentUser.id?.toString() || ""))
          }
        }

        return filteredPosts
      }),
    )
  }

  // Set search filter
  setSearchFilter(searchText: string): void {
    this.searchFilter.next(searchText)
  }

  // Clear search filter
  clearSearchFilter(): void {
    this.searchFilter.next("")
  }

  // Get current search filter
  getSearchFilter(): Observable<string> {
    return this.searchFilter.asObservable()
  }

  // Get current user ID
  getCurrentUserId(): string {
    const currentUser = this.authService.getCurrentUser()
    return currentUser?.id?.toString() || ""
  }

  // Helper method to map backend post format to frontend format
private mapPostFromBackend(backendPost: any): Post {
  // Defensive check: if the post object itself is invalid, return a default structure
  if (!backendPost) {
    return {} as Post; // Return an empty object to be filtered out later if needed
  }

  // Extract user info from nested user object if present
  const user = backendPost.user || {};
  const authorId = user.id?.toString() || backendPost.authorId || backendPost.user_id?.toString() || '';
  const authorUsername = user.username || backendPost.authorUsername || backendPost.username || "Unknown User";

  return {
    id: backendPost.id?.toString() || '',
    authorId: authorId,
    authorUsername: authorUsername,
    title: backendPost.title || "",
    text: backendPost.description || backendPost.text || "",
    createdAt: new Date(backendPost.created_at || backendPost.post_date || new Date()),
    imageUrl: backendPost.image_link ? `${this.apiUrl}/image/${backendPost.id}` : "",
    status: this.determinePostStatus(backendPost),
    tags: (backendPost.tags || []).map((tag: any) => ({
      id: tag.id?.toString() || '',
      name: tag.name,
    })),
    likes: backendPost.score || 0,
    likerIds: backendPost.likerIds || [],
    comments: (backendPost.comments || []).map((comment: any) => ({
      id: comment.id?.toString() || '',
      userId: comment.user_id?.toString() || '',
      username: comment.username || "Unknown User",
      text: comment.text || "",
      timestamp: new Date(comment.created_at || comment.timestamp || new Date()),
      score: comment.score || 0,
    })),
  };
}
  // Helper method to map multiple posts
  private mapPostsFromBackend(backendPosts: any[]): Post[] {
    return backendPosts.map((post) => this.mapPostFromBackend(post))
  }

  // Helper method to prepare post for backend
  private preparePostForBackend(post: Partial<Post>): any {
    const currentUser = this.authService.getCurrentUser()

    return {
      id: post.id ? Number.parseInt(post.id) : null,
      user_id: currentUser?.id || null,
      title: post.title || "",
      description: post.text || "",
      image_link: post.imageUrl || null,
      score: post.likes || 0,
      created_at: post.createdAt || new Date(),
    }
  }

  // Helper method to determine post status based on backend data
  private determinePostStatus(backendPost: any): string {
    const createdAt = new Date(backendPost.created_at || new Date())
    const now = new Date()
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

    if (hoursSinceCreation < 1) {
      return "just posted"
    } else if (backendPost.score > 0 || (backendPost.comments && backendPost.comments.length > 0)) {
      return "first reactions"
    } else if (hoursSinceCreation > 24) {
      return "outdated"
    }

    return "just posted"
  }

  // Add comment to a post
  addComment(postId: string, text: string): Observable<Post | undefined> {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) {
      return of(undefined)
    }

    return this.commentService.createComment(postId, currentUser.id?.toString() || "", text).pipe(
      switchMap(() => {
        // After creating the comment, get the updated post
        return this.getPostById(postId)
      }),
    )
  }
}
