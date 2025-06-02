import { Component, type OnInit, Output, EventEmitter } from "@angular/core"
import  { Router } from "@angular/router"
import  { AuthService } from "../../services/auth.service"
import { MessageService } from "primeng/api"
import  { PostService } from "../../services/post.service"

import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { MenubarModule } from "primeng/menubar"
import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"
import { DialogModule } from "primeng/dialog"
import { DropdownModule } from "primeng/dropdown"
import { ToastModule } from "primeng/toast"

@Component({
  selector: "app-feed-form-header",
  templateUrl: "./feed-form-header.component.html",
  styleUrls: ["./feed-form-header.component.css"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MenubarModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    ToastModule,
  ],
  providers: [MessageService],
})
export class FeedFormHeaderComponent implements OnInit {
  @Output() postCreated = new EventEmitter<void>()

  displayCreatePostDialog = false
  currentRoute = ""
  isAdmin = false

  postForm: {
    title: string
    text: string
  } = {
    title: "",
    text: "",
  }

  tagsText = ""
  selectedFile: File | null = null
  imagePreviewUrl: string | ArrayBuffer | null = null

  constructor(
    private router: Router,
    private postService: PostService,
    private messageService: MessageService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser()
    if (currentUser) {
      this.isAdmin = currentUser.is_admin
    }
    this.currentRoute = this.router.url
  }

  navigateTo(route: string) {
    this.router.navigate([route])
    this.currentRoute = route
  }

  createNewPost() {
    this.resetPostForm()
    this.displayCreatePostDialog = true
  }

  resetPostForm() {
    this.postForm = {
      title: "",
      text: "",
    }
    this.tagsText = ""
    this.selectedFile = null
    this.imagePreviewUrl = null
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      const file = input.files[0]
      this.selectedFile = file

      const reader = new FileReader()
      reader.onload = () => {
        this.imagePreviewUrl = reader.result
      }
      reader.readAsDataURL(file)
    }
  }

  savePostForm(): void {
    if (!this.postForm.title || !this.postForm.text) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Title and description are required",
      })
      return
    }

    const postData = {
      title: this.postForm.title,
      text: this.postForm.text,
    }

    const tags = this.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    this.postService.createPostWithImage(postData, tags, this.selectedFile).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Post created successfully",
        })
        this.displayCreatePostDialog = false
        this.postCreated.emit()
      },
      error: (error) => {
        let errorMessage = "Failed to create post"
        if (error.status === 500) {
          errorMessage = "Server error occurred. Please check the backend logs."
        } else if (error.error && typeof error.error === "string") {
          errorMessage = error.error
        } else if (error.message) {
          errorMessage = error.message
        }

        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: errorMessage,
        })
      },
    })
  }
}
