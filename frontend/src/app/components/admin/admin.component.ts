import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { TableModule } from "primeng/table"
import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"
import { TagModule } from "primeng/tag"
import { DialogModule } from "primeng/dialog"
import { ToastModule } from "primeng/toast"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { CardModule } from "primeng/card"
import { TabViewModule } from "primeng/tabview"
import { TooltipModule } from "primeng/tooltip"
import { MessageService, ConfirmationService } from "primeng/api"
import { FeedFormHeaderComponent } from "../feed-form-header/feed-form-header.component"
import  { AdminService } from "../../services/admin.service"
import  { PostService } from "../../services/post.service"
import  { CommentService } from "../../services/comment.service"
import  { Router } from "@angular/router"
import  { AuthService } from "../../services/auth.service"
import  { User } from "../../interfaces/user"
import  { Post, Comment } from "../../interfaces/post.interface"

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    TabViewModule,
    TooltipModule,
    FeedFormHeaderComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"],
})
export class AdminComponent implements OnInit {
  users: User[] = []
  posts: Post[] = []
  comments: Comment[] = []

  filteredUsers: User[] = []
  filteredPosts: Post[] = []
  filteredComments: Comment[] = []

  userSearchText = ""
  postSearchText = ""
  commentSearchText = ""

  loading = false
  activeIndex = 0

  constructor(
    private adminService: AdminService,
    private postService: PostService,
    private commentService: CommentService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Check if user is admin
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser || !currentUser.is_admin) {
      this.messageService.add({
        severity: "error",
        summary: "Access Denied",
        detail: "You do not have permission to access this page",
      })
      this.router.navigate(["/admin"])
      return
    }

    this.loadData()
  }

  loadData() {
    this.loadUsers()
    this.loadPosts()
    this.loadComments()
  }

  loadUsers() {
    this.loading = true
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users
        this.filteredUsers = users
        this.loading = false
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load users: " + error.message,
        })
        this.loading = false
      },
    })
  }

  loadPosts() {
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts
        this.filteredPosts = posts
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load posts: " + error.message,
        })
      },
    })
  }

  loadComments() {
    this.commentService.getAllComments().subscribe({
      next: (comments) => {
        this.comments = comments
        this.filteredComments = comments
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load comments: " + error.message,
        })
      },
    })
  }

  // User management
  toggleUserBan(user: User) {
    const action = user.is_blocked ? "unban" : "ban"

    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} ${user.email}?`,
      header: "Confirm Action",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.adminService.toggleUserBan(user.id!.toString()).subscribe({
          next: () => {
            user.is_blocked = !user.is_blocked
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: `User ${action}ned successfully`,
            })
          },
          error: (error) => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: `Failed to ${action} user: ` + error.message,
            })
          },
        })
      },
    })
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to permanently delete user ${user.email}? This action cannot be undone.`,
      header: "Delete User",
      icon: "pi pi-trash",
      accept: () => {
        this.adminService.deleteUser(user.id!.toString()).subscribe({
          next: () => {
            this.users = this.users.filter((u) => u.id !== user.id)
            this.filteredUsers = this.filteredUsers.filter((u) => u.id !== user.id)
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "User deleted successfully",
            })
          },
          error: (error) => {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete user: " + error.message,
            })
          },
        })
      },
    })
  }

  // Post management
  deletePost(post: Post) {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this post?",
      header: "Delete Post",
      icon: "pi pi-trash",
      accept: () => {
        this.postService.deletePost(post.id).subscribe({
          next: () => {
            this.posts = this.posts.filter((p) => p.id !== post.id)
            this.filteredPosts = this.filteredPosts.filter((p) => p.id !== post.id)
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Post deleted successfully",
            })
          },
          error: (error) => {
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

  // Comment management
  deleteComment(comment: Comment) {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this comment?",
      header: "Delete Comment",
      icon: "pi pi-trash",
      accept: () => {
        this.commentService.deleteComment(comment.id).subscribe({
          next: () => {
            this.comments = this.comments.filter((c) => c.id !== comment.id)
            this.filteredComments = this.filteredComments.filter((c) => c.id !== comment.id)
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

  // Search functionality
  searchUsers() {
    if (!this.userSearchText) {
      this.filteredUsers = this.users
    } else {
      const searchLower = this.userSearchText.toLowerCase()
      this.filteredUsers = this.users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) || (user.id && user.id.toString().includes(searchLower)),
      )
    }
  }

  searchPosts() {
    if (!this.postSearchText) {
      this.filteredPosts = this.posts
    } else {
      const searchLower = this.postSearchText.toLowerCase()
      this.filteredPosts = this.posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.text.toLowerCase().includes(searchLower) ||
          post.authorUsername.toLowerCase().includes(searchLower),
      )
    }
  }

  searchComments() {
    if (!this.commentSearchText) {
      this.filteredComments = this.comments
    } else {
      const searchLower = this.commentSearchText.toLowerCase()
      this.filteredComments = this.comments.filter(
        (comment) =>
          comment.text.toLowerCase().includes(searchLower) || comment.username.toLowerCase().includes(searchLower),
      )
    }
  }

  // Utility methods
  getUserStatusSeverity(isBlocked: boolean): "success" | "danger" {
    return isBlocked ? "danger" : "success"
  }

  getUserStatusLabel(isBlocked: boolean): string {
    return isBlocked ? "Banned" : "Active"
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString()
  }
}
