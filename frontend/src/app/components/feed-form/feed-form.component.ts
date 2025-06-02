import { Component, EventEmitter, Input,  OnInit, Output, ViewChild,  ElementRef } from "@angular/core"
import { ConfirmationService, MessageService } from "primeng/api"
import  { PostService } from "../../services/post.service"
import  { TagService } from "../../services/tag.service"
import  { CommentService } from "../../services/comment.service"
import  { Observable } from "rxjs"
// Import the interfaces from your file
import  { Post, Tag, Comment } from "../../interfaces/post.interface"

// PrimeNG Modules
import { CommonModule, DatePipe } from "@angular/common" // Added DatePipe
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { AvatarModule } from "primeng/avatar"
import { DialogModule } from "primeng/dialog"
import { DropdownModule } from "primeng/dropdown"
import { InputTextModule } from "primeng/inputtext"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { ToastModule } from "primeng/toast"
import { MultiSelectModule } from "primeng/multiselect"
import { InplaceModule } from "primeng/inplace"
import { ProgressSpinnerModule } from "primeng/progressspinner"

// --- Best Practice: Define View Models for UI-specific state ---
// This adds UI properties without changing the original backend model.
type CommentViewModel = Comment & {
  editing?: boolean
  editText?: string
}

// This is the main object we'll use in the component's `posts` array.
// It includes everything from the backend Post, plus our UI properties.
type PostViewModel = Post & {
  likerIds: string[] // REQUIRED for the "liked" feature to work.
  showComments?: boolean
  newComment?: string
  comments: CommentViewModel[] // Ensure comments inside are also view models.
}

@Component({
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    AvatarModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    MultiSelectModule,
    InplaceModule,
    ProgressSpinnerModule,
  ],
  standalone: true,
  selector: "app-feed-form",
  templateUrl: "./feed-form.component.html",
  styleUrls: ["./feed-form.component.css"],
  providers: [ConfirmationService, MessageService, DatePipe], // Added DatePipe
})
export class FeedFormComponent implements OnInit {
  @Input() displayPostDialog = false
  @Output() displayPostDialogChange = new EventEmitter<boolean>()
  @Output() postCreated = new EventEmitter<void>()

  // Use the PostViewModel for our component's state
  posts: PostViewModel[] = []
  loading = false
  currentUserId = ""
  currentUsername = "" // <-- add this line
  tags: Tag[] = []
  selectedTag: Tag | null = null

  // Edit dialog
  displayEditDialog = false
  editingPost: Post | null = null
  postForm: {
    id?: string
    title: string
    text: string
    imageUrl: string
    selectedTags: Tag[]
  } = {
    title: "",
    text: "",
    imageUrl: "",
    selectedTags: [],
  }

  // Tags as text input
  tagsText = ""

  // Image upload
  selectedFile: File | null = null
  selectedFileName = ""
  imagePreviewUrl: string | ArrayBuffer | null = null

  sortOptions = [
    { label: "Sort by Score", value: "score" },
    { label: "Sort by Date", value: "date" },
  ]
  selectedSort = "score"
  onlyMine = false

  // Search functionality
  searchText = ""
  searchType: "tag" | "username" | "title" = "tag"
  searchOptions = [
    { label: "Tag", value: "tag" },
    { label: "Username", value: "username" },
    { label: "Title", value: "title" },
  ]

  @ViewChild("searchInput") searchInputRef!: ElementRef<HTMLInputElement>

  constructor(
    private postService: PostService,
    private tagService: TagService,
    private commentService: CommentService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    // Get current user and set IDs
    this.postService.authService.getCurrentUserFromApi().subscribe({
      next: (user) => {
        if (user) {
          this.currentUserId = user.id?.toString() || ""
          this.currentUsername = user.username || ""
          console.log("Current user ID:", this.currentUserId)
        }
        this.loadPosts()
        this.loadTags()
      },
      error: () => {
        // If user fetch fails, try to get from current state
        const currentUser = this.postService.authService.getCurrentUser()
        this.currentUserId = currentUser?.id?.toString() || ""
        this.currentUsername = currentUser?.username || ""
        console.log("Current user ID (from local):", this.currentUserId)
        this.loadPosts()
        this.loadTags()
      },
    })
  }

  // Helper method to check if current user is the post owner
  isPostOwner(post: Post): boolean {
    console.log(`Comparing post.authorId: ${post.authorId} with currentUserId: ${this.currentUserId}`)
    return this.currentUserId !== "" && post.authorId === this.currentUserId
  }

  // Helper method to check if current user is the comment owner
  isCommentOwner(comment: Comment): boolean {
    console.log(`Comparing comment.userId: ${comment.userId} with currentUserId: ${this.currentUserId}`)
    return this.currentUserId !== "" && comment.userId === this.currentUserId
  }

  loadPosts(): void {
    this.loading = true

    if (this.onlyMine) {
      this.postService.getPostsFilteredByUsername(this.currentUsername).subscribe({
        next: (posts: Post[]) => {
          this.setPosts(posts)
          this.fetchScoresForAllComments() // Fetch scores after posts are set
          this.loading = false
        },
        error: (error: any) => {
          this.showError("Failed to load posts: " + error.message)
          this.loading = false
        },
      })
      return
    }

    let postsObservable: Observable<Post[]>
    if (this.selectedSort === "score") {
      postsObservable = this.postService.getSortedPosts()
    } else if (this.selectedSort === "date") {
      postsObservable = this.postService.getPostsSortedByDate()
    } else {
      postsObservable = this.postService.getPosts()
    }

    postsObservable.subscribe({
      next: (posts: Post[]) => {
        this.setPosts(posts)
        this.fetchScoresForAllComments() // Fetch scores after posts are set
        this.loading = false
      },
      error: (error: any) => {
        this.showError("Failed to load posts: " + error.message)
        this.loading = false
      },
    })

    if (this.searchText.trim() !== "") {
      // Note: searchPosts also calls setPosts, so fetchScoresForAllComments will be covered
      this.searchPosts()
    }
  }

  private fetchScoresForAllComments(): void {
    if (this.posts && this.posts.length > 0) {
      this.posts.forEach((postVM) => {
        if (postVM.comments && postVM.comments.length > 0) {
          postVM.comments.forEach((commentVM) => {
            this.commentService.getCommentScore(commentVM.id).subscribe({
              next: (updatedScore) => {
                commentVM.score = updatedScore
              },
              error: (err) => {
                console.warn(`Failed to fetch score for comment ${commentVM.id} during initial load:`, err)
                // Optionally set to 0 or keep whatever value it had if fetching fails
                commentVM.score = commentVM.score !== undefined ? commentVM.score : 0
              },
            })
          })
        }
      })
    }
  }

  private setPosts(posts: Post[]): void {
    console.log("Setting posts:", posts)
    this.posts = posts.map((post) => {
      const mappedPost: PostViewModel = {
        ...post,
        likerIds: Array.isArray((post as any).likerIds) ? (post as any).likerIds : [],
        showComments: false,
        newComment: "",
        comments: Array.isArray(post.comments)
          ? post.comments.map((comment: any) => ({
              // Ensure comment is typed if possible
              ...comment,
              // Score should ideally come from `post.comments` here if PostService provides it
              // If not, fetchScoresForAllComments will update it.
              editing: false,
              editText: "",
            }))
          : [],
      }
      console.log("Mapped post for UI:", mappedPost)
      return mappedPost
    })
    console.log("Final posts array:", this.posts)
  }

  private showError(detail: string): void {
    this.messageService.add({ severity: "error", summary: "Error", detail })
  }

  searchPosts(): void {
    this.loading = true
    const query = this.searchText.trim()
    if (!query) {
      this.loadPosts() // This will call setPosts and then fetchScoresForAllComments
      return
    }
    let obs: Observable<Post[]>
    if (this.searchType === "tag") {
      obs = this.postService.getPostsByTag(query)
    } else if (this.searchType === "username") {
      obs = this.postService.getPostsFilteredByUsername(query)
    } else {
      obs = this.postService.getPostsFilteredByTitle(query)
    }
    obs.subscribe({
      next: (posts: Post[]) => {
        this.setPosts(posts)
        this.fetchScoresForAllComments() // Fetch scores after search results are set
        this.loading = false
      },
      error: (error: any) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to search posts: " + error.message,
        })
        this.loading = false
      },
    })
  }

  onSortChange(event: any): void {
    this.selectedSort = event.value
    this.loadPosts() // This will call setPosts and then fetchScoresForAllComments
  }

  onToggleOnlyMine(): void {
    this.onlyMine = !this.onlyMine

    // Always get the current username from /users/me
    this.postService.authService.getCurrentUserFromApi().subscribe({
      next: (user: any) => {
        this.currentUsername = user?.username || ""
        this.loadPosts() // This will call setPosts and then fetchScoresForAllComments
      },
      error: () => {
        this.currentUsername = ""
        this.loadPosts() // This will call setPosts and then fetchScoresForAllComments
      },
    })
  }

  loadTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load tags: " + error.message,
        })
      },
    })
  }

  filterByTag(tag: Tag | string): void {
    if (typeof tag === "string") {
      this.selectedTag = { name: tag, id: "" }
    } else {
      this.selectedTag = tag
    }
    this.applyFilters()
  }

  applyFilters(): void {
    this.loading = true
    const filter: any = {}
    if (this.selectedTag) {
      filter.tag = this.selectedTag.name
    }

    this.postService.getFilteredPosts(filter).subscribe({
      next: (posts) => {
        this.setPosts(posts)
        this.fetchScoresForAllComments() // Fetch scores after filters are applied
        this.loading = false
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to apply filters: " + error.message,
        })
        this.loading = false
      },
    })
  }

  likePost(post: PostViewModel): void {
    console.log("Liking post:", post.id, "Current likes:", post.likes)

    this.postService.likePost(post.id).subscribe({
      next: (updatedPost) => {
        console.log("Like response:", updatedPost)

        if (updatedPost) {
          const index = this.posts.findIndex((p) => p.id === post.id)
          if (index !== -1) {
            // Preserve the UI state when updating the post data
            const originalState = this.posts[index]
            this.posts[index] = {
              ...updatedPost,
              likerIds: Array.isArray((updatedPost as any).likerIds) ? (updatedPost as any).likerIds : [],
              showComments: originalState.showComments,
              newComment: originalState.newComment,
              comments: Array.isArray(updatedPost.comments)
                ? updatedPost.comments.map((comment) => ({
                    ...comment,
                    editing: false,
                    editText: "",
                  }))
                : originalState.comments,
            }
            // After liking a post, its comments might have changed or their scores.
            // It's safer to re-fetch scores for comments of this specific post.
            if (this.posts[index].comments && this.posts[index].comments.length > 0) {
              this.posts[index].comments.forEach((commentVM) => {
                this.commentService.getCommentScore(commentVM.id).subscribe((score) => (commentVM.score = score))
              })
            }
            console.log("Updated post in array:", this.posts[index])
          }
        }
      },
      error: (error) => {
        console.error("Like error:", error)
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to like post: " + error.message,
        })
      },
    })
  }

  toggleComments(post: PostViewModel): void {
    post.showComments = !post.showComments
    // If comments are shown and scores might be stale, fetch them.
    // This is an optimization: only fetch if showing and scores haven't been fetched recently.
    // For simplicity, we can always re-fetch or rely on the initial fetchScoresForAllComments.
    // If scores are critical upon every toggle, add a fetch here.
    if (post.showComments && post.comments && post.comments.length > 0) {
      post.comments.forEach((commentVM) => {
        // Potentially only fetch if score is 0 or undefined, or always fetch
        this.commentService.getCommentScore(commentVM.id).subscribe((score) => (commentVM.score = score))
      })
    }
    console.log(
      "Toggled comments for post:",
      post.id,
      "Show:",
      post.showComments,
      "Comments count:",
      post.comments.length,
    )
  }

  addComment(post: PostViewModel): void {
    const commentText = post.newComment?.trim()
    console.log("Adding comment:", commentText, "to post:", post.id)

    if (!commentText) {
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Please enter a comment",
      })
      return
    }

    if (commentText.length > 500) {
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Comment is too long (max 500 characters)",
      })
      return
    }

    this.postService.addComment(post.id, commentText).subscribe({
      next: (response) => {
        console.log("Add comment response:", response)

        // Reset the input field immediately
        post.newComment = ""

        // Reload posts to get the updated data, which will also trigger fetchScoresForAllComments
        this.loadPosts()

        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Comment added successfully",
        })
      },
      error: (error) => {
        console.error("Add comment error:", error)

        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to add comment: " + error.message,
        })
      },
    })
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      const file = input.files[0]
      this.selectedFile = file
      this.selectedFileName = file.name

      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target) {
          this.imagePreviewUrl = e.target.result
        }
      }
      reader.readAsDataURL(file)
    }
  }

  editPost(post: Post): void {
    console.log("Editing post:", post)
    this.editingPost = { ...post }
    this.postForm = {
      id: post.id,
      title: post.title,
      text: post.text,
      imageUrl: post.imageUrl,
      selectedTags: [...post.tags],
    }

    this.tagsText = post.tags.map((tag) => tag.name).join(", ")
    this.imagePreviewUrl = null
    this.selectedFile = null
    this.selectedFileName = ""
    this.displayEditDialog = true
  }

  hideEditDialog(): void {
    this.displayEditDialog = false
    this.editingPost = null
    this.tagsText = ""
    this.imagePreviewUrl = null
    this.selectedFile = null
    this.selectedFileName = ""
    this.postForm = {
      title: "",
      text: "",
      imageUrl: "",
      selectedTags: [],
    }
  }

  savePostForm(): void {
    console.log("Saving post form:", this.postForm)

    if (!this.postForm.title || !this.postForm.text) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Title and text are required",
      })
      return
    }

    const tagNamesFromString = this.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    if (this.editingPost && this.postForm.id) {
      console.log("Updating existing post with ID:", this.postForm.id)

      const postData: Partial<Post> = {
        title: this.postForm.title,
        text: this.postForm.text,
      }
      const tagsToSend: Tag[] = this.tags.filter((tagObject) => tagNamesFromString.includes(tagObject.name))

      this.postService.updatePost(this.postForm.id, postData, tagsToSend).subscribe({
        next: (updatedPost) => {
          console.log("Post updated successfully:", updatedPost)
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Post updated successfully",
          })
          this.hideEditDialog()
          this.loadPosts() // This will re-trigger fetchScoresForAllComments
          this.postCreated.emit()
        },
        error: (error) => {
          console.error("Update post error:", error)
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to update post: " + error.message,
          })
        },
      })
    }
  }

  confirmDeletePost(post: Post): void {
    console.log("Confirming delete for post:", post.id)
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this post?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        console.log("Delete confirmed, calling service")
        this.postService.deletePost(post.id).subscribe({
          next: (success) => {
            console.log("Delete response:", success)
            if (success) {
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Post deleted successfully",
              })
              this.loadPosts() // This will re-trigger fetchScoresForAllComments
            } else {
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete post",
              })
            }
          },
          error: (error) => {
            console.error("Delete error:", error)
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete post: " + error.message,
            })
          },
        })
      },
    })
  }

  upvoteComment(comment: CommentViewModel): void {
    // Ensure we have current user ID
    if (!this.currentUserId) {
      const currentUser = this.postService.authService.getCurrentUser()
      this.currentUserId = currentUser?.id?.toString() || ""
    }

    if (!this.currentUserId) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "You must be logged in to vote on comments",
      })
      return
    }

    this.commentService.voteComment(comment.id, true, this.currentUserId).subscribe({
      next: () => {
        this.commentService.getCommentScore(comment.id).subscribe({
          next: (score) => {
            comment.score = score
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Comment upvoted",
            })
          },
          error: (error) => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to get updated score: " + error.message,
            })
          },
        })
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to upvote comment: " + error.message,
        })
      },
    })
  }

  downvoteComment(comment: CommentViewModel): void {
    if (!this.currentUserId) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "You must be logged in to vote on comments",
      })
      return
    }

    this.commentService.voteComment(comment.id, false, this.currentUserId).subscribe({
      next: () => {
        this.commentService.getCommentScore(comment.id).subscribe({
          next: (score) => {
            comment.score = score
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Comment downvoted",
            })
          },
          error: (error) => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to get updated score: " + error.message,
            })
          },
        })
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to downvote comment: " + error.message,
        })
      },
    })
  }

  editComment(comment: CommentViewModel, newText: string): void {
    const trimmedText = newText?.trim()

    if (!trimmedText) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Comment text cannot be empty",
      })
      return
    }

    if (trimmedText.length > 500) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Comment is too long (max 500 characters)",
      })
      return
    }

    // Ensure we have current user ID
    if (!this.currentUserId) {
      const currentUser = this.postService.authService.getCurrentUser()
      this.currentUserId = currentUser?.id?.toString() || ""
    }

    if (!this.currentUserId) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "You must be logged in to edit comments",
      })
      return
    }

    this.commentService.editComment(comment.id, trimmedText, this.currentUserId).subscribe({
      next: (updatedComment) => {
        comment.text = updatedComment.text
        comment.editing = false
        // After editing, the score might not have changed, but good to be consistent
        this.commentService.getCommentScore(comment.id).subscribe((score) => (comment.score = score))
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Comment updated successfully",
        })
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to update comment: " + error.message,
        })
      },
    })
  }

  deleteComment(comment: Comment): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this comment? This action cannot be undone.",
      header: "Delete Comment",
      icon: "pi pi-exclamation-triangle",
      acceptButtonStyleClass: "p-button-danger",
      accept: () => {
        this.commentService.deleteComment(comment.id).subscribe({
          next: () => {
            this.loadPosts() // Reload to refresh the comments, which will trigger fetchScoresForAllComments
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Comment deleted successfully",
            })
          },
          error: (error) => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete comment: " + error.message,
            })
          },
        })
      },
    })
  }

  // TrackBy function for better performance with comment lists
  trackByCommentId(index: number, comment: Comment): string {
    return comment.id
  }

  onSearchButton(): void {
    this.searchPosts() // This will call setPosts and then fetchScoresForAllComments
  }

  onSearchInputKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      this.searchPosts() // This will call setPosts and then fetchScoresForAllComments
    }
  }

  onSearchTypeChange(event: any): void {
    this.searchType = event.value
    // Optionally clear search text or trigger search
  }

  clearSearch(): void {
    this.searchText = ""
    this.loadPosts() // This will call setPosts and then fetchScoresForAllComments
    if (this.searchInputRef) {
      this.searchInputRef.nativeElement.value = ""
    }
  }

  // Add these helper methods for debugging
  getObjectKeys(obj: any): string {
    return Object.keys(obj || {}).join(", ")
  }

  getType(value: any): string {
    return typeof value + (Array.isArray(value) ? " (array)" : "")
  }
}
