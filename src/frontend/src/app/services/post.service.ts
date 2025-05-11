import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable, of } from "rxjs"
import { type Post, PostStatus, type Tag, type PostFilter } from "../interfaces/post.interface"
import { v4 as uuidv4 } from "uuid"

@Injectable({
  providedIn: "root",
})
export class PostService {
  // Mock user ID for current user
  private currentUserId = "user123"
  private currentUsername = "currentUser"

  // Mock data for posts
  private posts: Post[] = []
  private postsSubject = new BehaviorSubject<Post[]>([])

  // Search filter
  private searchFilter = new BehaviorSubject<string>("")

  constructor() {
    // Initialize with empty posts
    this.refreshPosts()
  }

  private refreshPosts(): void {
    // Sort posts by creation date (newest first)
    const sortedPosts = [...this.posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    this.postsSubject.next(sortedPosts)
  }

  getPosts(): Observable<Post[]> {
    return this.postsSubject.asObservable()
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

  getFilteredPosts(filter: PostFilter): Observable<Post[]> {
    let filteredPosts = [...this.posts]

    // Get current search filter
    const currentSearchFilter = this.searchFilter.getValue()
    if (currentSearchFilter) {
      filter.searchText = currentSearchFilter
    }

    if (filter.tag) {
      filteredPosts = filteredPosts.filter((post) =>
        post.tags.some((tag) => tag.name.toLowerCase() === filter.tag?.toLowerCase()),
      )
    }

    if (filter.searchText) {
      const searchText = filter.searchText.toLowerCase()
      filteredPosts = filteredPosts.filter((post) => post.title.toLowerCase().includes(searchText))
    }

    if (filter.onlyMine) {
      filteredPosts = filteredPosts.filter((post) => post.authorId === this.currentUserId)
    }

    // Sort by creation date (newest first)
    filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return of(filteredPosts)
  }

  getPostById(id: string): Observable<Post | undefined> {
    const post = this.posts.find((p) => p.id === id)
    return of(post)
  }

  createPost(postData: Partial<Post>, tags: Tag[]): Observable<Post> {
    const newPost: Post = {
      id: uuidv4(),
      authorId: this.currentUserId,
      authorUsername: this.currentUsername,
      authorProfileImage: "/placeholder.svg",
      title: postData.title || "",
      text: postData.text || "",
      imageUrl: postData.imageUrl || "",
      createdAt: new Date(),
      status: PostStatus.JUST_POSTED,
      tags: tags,
      likes: 0,
      comments: [],
    }

    this.posts.push(newPost)
    this.refreshPosts()
    return of(newPost)
  }

  updatePost(id: string, postData: Partial<Post>, tags: Tag[]): Observable<Post | undefined> {
    const index = this.posts.findIndex((p) => p.id === id)
    if (index === -1) {
      return of(undefined)
    }

    // Only allow updating if current user is the author
    if (this.posts[index].authorId !== this.currentUserId) {
      return of(undefined)
    }

    const updatedPost = {
      ...this.posts[index],
      ...postData,
      tags: tags,
    }

    this.posts[index] = updatedPost
    this.refreshPosts()
    return of(updatedPost)
  }

  deletePost(id: string): Observable<boolean> {
    const index = this.posts.findIndex((p) => p.id === id)
    if (index === -1) {
      return of(false)
    }

    // Only allow deletion if current user is the author
    if (this.posts[index].authorId !== this.currentUserId) {
      return of(false)
    }

    this.posts.splice(index, 1)
    this.refreshPosts()
    return of(true)
  }

  likePost(id: string): Observable<Post | undefined> {
    const index = this.posts.findIndex((p) => p.id === id)
    if (index === -1) {
      return of(undefined)
    }

    const post = this.posts[index]
    post.likes = post.likes ? post.likes + 1 : 1

    // Update status if needed
    if (post.likes > 0 && post.status === PostStatus.JUST_POSTED) {
      post.status = PostStatus.FIRST_REACTIONS
    }

    this.refreshPosts()
    return of(post)
  }

  addComment(postId: string, text: string): Observable<Post | undefined> {
    const index = this.posts.findIndex((p) => p.id === postId)
    if (index === -1) {
      return of(undefined)
    }

    const newComment = {
      id: uuidv4(),
      userId: this.currentUserId,
      username: this.currentUsername,
      text: text,
      timestamp: new Date(),
    }

    this.posts[index].comments.push(newComment)

    // Update status if needed
    if (this.posts[index].status === PostStatus.JUST_POSTED) {
      this.posts[index].status = PostStatus.FIRST_REACTIONS
    }

    this.refreshPosts()
    return of(this.posts[index])
  }

  getCurrentUserId(): string {
    return this.currentUserId
  }
}
