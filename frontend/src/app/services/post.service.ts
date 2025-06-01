import { Injectable } from "@angular/core"
import  { HttpClient, HttpErrorResponse } from "@angular/common/http" // Import HttpErrorResponse
import { BehaviorSubject,  Observable, of, forkJoin } from "rxjs"
import { map, switchMap, catchError } from "rxjs/operators"
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
    public authService: AuthService,
    private commentService: CommentService,
  ) {}

  // Get all posts with comments
  getPosts(): Observable<Post[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAll`).pipe(
      switchMap((posts) => {
        const mappedPosts = this.mapPostsFromBackend(posts)

        const postsWithComments$ = mappedPosts.map((post) =>
          this.fetchCommentsForPost(post.id).pipe(
            switchMap((comments) =>
              this.getPostScore(post.id).pipe(
                map((score) => ({
                  ...post,
                  comments: comments,
                  likes: score,
                })),
                catchError(() =>
                  of({
                    ...post,
                    comments: comments,
                  }),
                ),
              ),
            ),
            catchError(() =>
              of({
                ...post,
                comments: [],
              }),
            ),
          ),
        )

        return forkJoin(postsWithComments$).pipe(catchError(() => of(mappedPosts)))
      }),
    )
  }

  // Fetch comments for a specific post
  private fetchCommentsForPost(postId: string): Observable<any[]> {
    return this.commentService.getAllComments().pipe(
      map((comments) => comments.filter((comment) => comment.postId === postId)),
      catchError(() => of([])),
    )
  }

  // Get all posts sorted by score
  getSortedPosts(): Observable<Post[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAllSorted`).pipe(
      switchMap((posts) => {
        const mappedPosts = this.mapPostsFromBackend(posts)

        const postsWithComments$ = mappedPosts.map((post) =>
          this.fetchCommentsForPost(post.id).pipe(
            switchMap((comments) =>
              this.getPostScore(post.id).pipe(
                map((score) => ({
                  ...post,
                  comments: comments,
                  likes: score,
                })),
                catchError(() =>
                  of({
                    ...post,
                    comments: comments,
                  }),
                ),
              ),
            ),
            catchError(() =>
              of({
                ...post,
                comments: [],
              }),
            ),
          ),
        )

        return forkJoin(postsWithComments$).pipe(catchError(() => of(mappedPosts)))
      }),
      map((posts) =>
        posts.sort((a, b) => {
          if (b.likes !== a.likes) {
            return b.likes - a.likes
          }
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        }),
      ),
    )
  }

  // Get all posts sorted by date
  getPostsSortedByDate(): Observable<Post[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sortedByDate`).pipe(
      switchMap((posts) => {
        const mappedPosts = this.mapPostsFromBackend(posts)

        const postsWithComments$ = mappedPosts.map((post) =>
          this.fetchCommentsForPost(post.id).pipe(
            switchMap((comments) =>
              this.getPostScore(post.id).pipe(
                map((score) => ({
                  ...post,
                  comments: comments,
                  likes: score,
                })),
                catchError(() =>
                  of({
                    ...post,
                    comments: comments,
                  }),
                ),
              ),
            ),
            catchError(() =>
              of({
                ...post,
                comments: [],
              }),
            ),
          ),
        )

        return forkJoin(postsWithComments$).pipe(catchError(() => of(mappedPosts)))
      }),
      map((posts) => posts.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))),
    )
  }

  // Get posts filtered by username (for "only mine" toggle)
  getPostsFilteredByUsername(username: string): Observable<Post[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/filterByUsername`, {
        params: { username },
      })
      .pipe(
        switchMap((posts) => {
          const mappedPosts = this.mapPostsFromBackend(posts)

          const postsWithComments$ = mappedPosts.map((post) =>
            this.fetchCommentsForPost(post.id).pipe(
              switchMap((comments) =>
                this.getPostScore(post.id).pipe(
                  map((score) => ({
                    ...post,
                    comments: comments,
                    likes: score,
                  })),
                  catchError(() =>
                    of({
                      ...post,
                      comments: comments,
                    }),
                  ),
                ),
              ),
              catchError(() =>
                of({
                  ...post,
                  comments: [],
                }),
              ),
            ),
          )

          return forkJoin(postsWithComments$).pipe(catchError(() => of(mappedPosts)))
        }),
      )
  }

  // Get posts filtered by title (for search)
  getPostsFilteredByTitle(title: string): Observable<Post[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/filterByTitle`, {
        params: { search: title },
      })
      .pipe(
        switchMap((posts) => {
          const mappedPosts = this.mapPostsFromBackend(posts)

          const postsWithComments$ = mappedPosts.map((post) =>
            this.fetchCommentsForPost(post.id).pipe(
              switchMap((comments) =>
                this.getPostScore(post.id).pipe(
                  map((score) => ({
                    ...post,
                    comments: comments,
                    likes: score,
                  })),
                  catchError(() =>
                    of({
                      ...post,
                      comments: comments,
                    }),
                  ),
                ),
              ),
              catchError(() =>
                of({
                  ...post,
                  comments: [],
                }),
              ),
            ),
          )

          return forkJoin(postsWithComments$).pipe(catchError(() => of(mappedPosts)))
        }),
      )
  }

  // Get post by ID with comments
  getPostById(id: string): Observable<Post | undefined> {
    return this.getPosts().pipe(
      map((posts) => posts.find((post) => post.id === id)),
      switchMap((post) => {
        if (!post) return of(undefined)

        return this.fetchCommentsForPost(id).pipe(
          switchMap((comments) =>
            this.getPostScore(id).pipe(
              map((score) => ({
                ...post,
                comments: comments,
                likes: score,
              })),
              catchError(() =>
                of({
                  ...post,
                  comments: comments,
                }),
              ),
            ),
          ),
          catchError(() => of(post)),
        )
      }),
    )
  }

  // Create a new post with tags
  createPost(postData: Partial<Post>, tags: Tag[]): Observable<Post> {
    const tagNames = tags.map((tag) => tag.name)
    const post = this.preparePostForBackend(postData)

    return this.http
      .post<any>(`${this.apiUrl}/create`, post, {
        params: { tags: tagNames },
      })
      .pipe(map((post) => this.mapPostFromBackend(post)))
  }

  // Create a post with image upload
  createPostWithImage(
    postData: { title: string; text: string },
    tags: string[],
    imageFile: File | null,
  ): Observable<Post> {
    const formData = new FormData()

    if (imageFile) {
      formData.append("imageFile", imageFile, imageFile.name)
    }

    const postObject = { title: postData.title, text: postData.text }
    const postBlob = new Blob([JSON.stringify(postObject)], { type: "application/json" })
    formData.append("post", postBlob)

    tags.forEach((tag) => {
      formData.append("tags", tag)
    })

    return this.http
      .post<any>(`${this.apiUrl}/createWithImage`, formData)
      .pipe(map((post) => this.mapPostFromBackend(post)))
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
      .put<any>(`${this.apiUrl}/edit`, post, {
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
    console.log(`PostService: Attempting to delete post with ID: ${id}`)
    return this.http
      .delete(`${this.apiUrl}/deletePost`, {
        params: { id: id },
        responseType: "text", // Expect plain text
        observe: "response", // Observe the full HttpResponse
      })
      .pipe(
        map((response) => {
          console.log("PostService deletePost - Full HTTP Response:", response)
          console.log(`Response Status: ${response.status}, Body: '${response.body}'`)

          if (response.status === 204) {
            // HTTP 204 No Content is a clear success
            console.log("PostService: Post deletion successful (HTTP 204 No Content).")
            return true
          }
          if (response.status >= 200 && response.status < 300) {
            // For 200 OK or other 2xx, inspect the body.
            // This depends heavily on what the backend sends for a successful text response.
            // If the backend sends a specific success message, check for it.
            // Example: if (response.body && response.body.toLowerCase().includes('deleted successfully'))
            if (response.body && response.body.toLowerCase().includes("post deleted successfully")) {
              // Adjust if backend sends different success text
              console.log(`PostService: Post deletion successful (HTTP ${response.status} OK, body indicates success).`)
              return true
            } else if (response.body === null || response.body.trim() === "") {
              // If body is empty for a 200 OK, it might be an implicit success for some backends
              console.log(
                `PostService: Post deletion potentially successful (HTTP ${response.status} OK, empty body). Assuming success.`,
              )
              return true // Or false if an empty body on 200 is not a success indicator
            } else {
              console.warn(
                `PostService: Post deletion HTTP ${response.status} OK, but body does NOT indicate clear success. Body: '${response.body}'. Assuming failure.`,
              )
              return false
            }
          }

          // For any other status, it's not a success
          console.warn(
            `PostService: Post deletion returned non-success HTTP status: ${response.status}. Body: '${response.body}'.`,
          )
          return false
        }),
        catchError((error: HttpErrorResponse) => {
          console.error("PostService deletePost - HTTP Error caught in catchError:", error)
          console.error(
            `Error details: Status=${error.status}, StatusText=${error.statusText}, Message='${error.message}', URL='${error.url}'`,
          )
          if (error.error) {
            console.error("Error Body/Content:", error.error)
          }
          return of(false)
        }),
      )
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
        responseType: "text" as "json",
      })
      .pipe(switchMap(() => this.getPostById(id)))
  }

  // Get post score
  getPostScore(postId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/score`, {
      params: { postId },
    })
  }

  // Get posts filtered by tag
  getPostsByTag(tag: string): Observable<Post[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/byTag`, {
        params: { tag: tag },
      })
      .pipe(
        switchMap((posts) => {
          const mappedPosts = this.mapPostsFromBackend(posts)

          const postsWithComments$ = mappedPosts.map((post) =>
            this.fetchCommentsForPost(post.id).pipe(
              switchMap((comments) =>
                this.getPostScore(post.id).pipe(
                  map((score) => ({
                    ...post,
                    comments: comments,
                    likes: score,
                  })),
                  catchError(() =>
                    of({
                      ...post,
                      comments: comments,
                    }),
                  ),
                ),
              ),
              catchError(() =>
                of({
                  ...post,
                  comments: [],
                }),
              ),
            ),
          )

          return forkJoin(postsWithComments$).pipe(catchError(() => of(mappedPosts)))
        }),
      )
  }

  // Get post image
  getPostImage(postId: string): string {
    return `${this.apiUrl}/image/${postId}`
  }

  // Get filtered posts
  getFilteredPosts(filter: PostFilter): Observable<Post[]> {
    let postsObservable: Observable<Post[]>

    if (filter.tag) {
      postsObservable = this.getPostsByTag(filter.tag)
    } else {
      postsObservable = this.getPosts()
    }

    return postsObservable.pipe(
      map((posts) => {
        let filteredPosts = posts

        if (filter.searchText) {
          const searchText = filter.searchText.toLowerCase()
          filteredPosts = filteredPosts.filter(
            (post) => post.title.toLowerCase().includes(searchText) || post.text.toLowerCase().includes(searchText),
          )
        }

        if (filter.userId) {
          filteredPosts = filteredPosts.filter((post) => post.authorId === filter.userId)
        }

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
    if (!backendPost) {
      return {} as Post
    }

    const user = backendPost.user || {}
    const authorId = user.id?.toString() || backendPost.user_id?.toString() || ""
    const authorUsername = user.username || backendPost.username || "Unknown User"

    const mappedPost: Post = {
      id: backendPost.id?.toString() || "",
      authorId: authorId,
      authorUsername: authorUsername,
      title: backendPost.title || "",
      text: backendPost.text || "",
      createdAt: new Date(backendPost.post_date || backendPost.created_at || new Date()),
      imageUrl: backendPost.image_link ? `${this.apiUrl}/image/${backendPost.id}` : "",
      status: this.determinePostStatus(backendPost),
      tags: (backendPost.tags || []).map((tag: any) => ({
        id: tag.id?.toString() || "",
        name: tag.name,
      })),
      likes: backendPost.score || 0,
      likerIds: [],
      comments: [],
    }

    return mappedPost
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
      text: post.text || "",
      image_link: post.imageUrl || null,
      post_date: post.createdAt || new Date(),
    }
  }

  // Helper method to determine post status based on backend data
  private determinePostStatus(backendPost: any): string {
    const createdAt = new Date(backendPost.post_date || backendPost.created_at || new Date())
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
        return this.getPostById(postId)
      }),
    )
  }
}
