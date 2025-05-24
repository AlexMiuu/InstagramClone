import { Component,  OnInit } from "@angular/core"
import { MenubarModule } from "primeng/menubar"
import  { MenuItem } from "primeng/api"
import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { IconFieldModule } from "primeng/iconfield"
import { InputIconModule } from "primeng/inputicon"
import { FloatLabelModule } from "primeng/floatlabel"
import {  Router, RouterModule } from "@angular/router"
import { DialogModule } from "primeng/dialog"
import { ChipModule } from "primeng/chip"
import { ToastModule } from "primeng/toast"
import { MessageService } from "primeng/api"
import  { PostService } from "../../services/post.service"
import  { TagService } from "../../services/tag.service"
import  { Tag } from "../../interfaces/post.interface"

@Component({
  selector: "app-feed-form-header",
  imports: [
    MenubarModule,
    ButtonModule,
    FloatLabelModule,
    InputTextModule,
    CommonModule,
    IconFieldModule,
    InputIconModule,
    FloatLabelModule,
    FormsModule,
    RouterModule,
    DialogModule,
    ChipModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: "./feed-form-header.component.html",
  styleUrl: "./feed-form-header.component.css",
  standalone: true,
})
export class FeedFormHeaderComponent implements OnInit {
  items: MenuItem[] = []
  searchValue = ""
  currentRoute = ""

  // Create post dialog
  displayCreatePostDialog = false
  postForm: {
    title: string
    text: string
    imageUrl: string
    tagInput: string[]
    selectedTags: Tag[]
  } = {
    title: "",
    text: "",
    imageUrl: "",
    tagInput: [],
    selectedTags: [],
  }

  // Image upload
  selectedFile: File | null = null
  selectedFileName = ""
  imagePreviewUrl = ""

  constructor(
    private router: Router,
    private postService: PostService,
    private tagService: TagService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
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
      imageUrl: "",
      tagInput: [],
      selectedTags: [],
    }
    this.selectedFile = null
    this.selectedFileName = ""
    this.imagePreviewUrl = ""
  }

  // Image selection handler
  onImageSelected(event: any): void {
    const file = event.target.files[0]
    if (file) {
      this.selectedFile = file
      this.selectedFileName = file.name

      // Create a preview URL
      const reader = new FileReader()
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result
        this.postForm.imageUrl = e.target.result // Store base64 image data
      }
      reader.readAsDataURL(file)
    }
  }

  onAddTag(event: any): void {
    const tagName = event.value.toLowerCase()
    this.tagService.createTag(tagName).subscribe((tag) => {
      if (!this.postForm.selectedTags.some((t) => t.id === tag.id)) {
        this.postForm.selectedTags.push(tag)
      }
    })
  }

  savePostForm(): void {
    if (!this.postForm.title || !this.postForm.text) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Title and text are required",
      })
      return
    }

    const postData = {
      title: this.postForm.title,
      text: this.postForm.text,
      imageUrl: this.postForm.imageUrl,
    }

    this.postService.createPost(postData, this.postForm.selectedTags).subscribe((newPost) => {
      this.messageService.add({
        severity: "success",
        summary: "Success",
        detail: "Post created successfully",
      })
      this.displayCreatePostDialog = false

      // Refresh the feed
      this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        this.router.navigate(["/feed"])
      })
    })
  }

  searchPosts() {
    // Refresh the feed with search filter
    if (this.searchValue.trim()) {
      // Pass the search value to the feed component
      this.postService.setSearchFilter(this.searchValue)
    } else {
      this.postService.clearSearchFilter()
    }

    // Refresh the feed
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate(["/feed"])
    })
  }
}
