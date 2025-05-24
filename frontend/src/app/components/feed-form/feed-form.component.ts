import { Component,  OnInit } from "@angular/core"
import { CarouselModule } from "primeng/carousel"
import { CommonModule } from "@angular/common"
import { AvatarModule } from "primeng/avatar"
import { CardModule } from "primeng/card"
import { ButtonModule } from "primeng/button"
import { ScrollerModule } from "primeng/scroller"
import { InputTextModule } from "primeng/inputtext"
import { FormsModule } from "@angular/forms"
import { DropdownModule } from "primeng/dropdown"
import { DialogModule } from "primeng/dialog"
import { ChipModule } from "primeng/chip"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { ConfirmationService, MessageService } from "primeng/api"
import { ToastModule } from "primeng/toast"

import  { PostService } from "../../services/post.service"
import  { TagService } from "../../services/tag.service"
import  { Post, Tag, PostFilter } from "../../interfaces/post.interface"

@Component({
  selector: "app-feed-form",
  standalone: true,
  imports: [
    CarouselModule,
    CommonModule,
    AvatarModule,
    CardModule,
    ButtonModule,
    ScrollerModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    DialogModule,
    ChipModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./feed-form.component.html",
  styleUrl: "./feed-form.component.css",
})
export class FeedFormComponent implements OnInit {
  stories = [
    {
      username: "your_story",
      profileImage: "https://via.placeholder.com/150",
      hasUnseenStory: false,
      isYourStory: true,
    },
    {
      username: "user1",
      profileImage: "https://via.placeholder.com/150",
      hasUnseenStory: true,
    },
    {
      username: "user2",
      profileImage: "https://via.placeholder.com/150",
      hasUnseenStory: true,
    },
    {
      username: "user3",
      profileImage: "https://via.placeholder.com/150",
      hasUnseenStory: true,
    },
    {
      username: "user4",
      profileImage: "https://via.placeholder.com/150",
      hasUnseenStory: true,
    },
    {
      username: "user5",
      profileImage: "https://via.placeholder.com/150",
      hasUnseenStory: true,
    },
  ]

  responsiveOptions = [
    {
      breakpoint: "1024px",
      numVisible: 5,
      numScroll: 1,
    },
    {
      breakpoint: "768px",
      numVisible: 4,
      numScroll: 1,
    },
    {
      breakpoint: "560px",
      numVisible: 3,
      numScroll: 1,
    },
  ]

  // Posts
  posts: (Post & { showComments?: boolean; newComment?: string })[] = []
  currentUserId = ""

  // Filters
  searchText = ""
  tags: Tag[] = []
  selectedTag: Tag | null = null
  showMyPostsOnly = false

  // Post dialog
  displayPostDialog = false
  editingPost = false
  postForm: {
    id?: string
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
    private postService: PostService,
    private tagService: TagService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.postService.getCurrentUserId()
    this.loadPosts()
    this.loadTags()
  }

  loadPosts(): void {
    this.postService.getPosts().subscribe((posts) => {
      this.posts = posts.map((post) => ({
        ...post,
        showComments: false,
        newComment: "",
      }))
    })
  }

  loadTags(): void {
    this.tagService.getTags().subscribe((tags) => {
      this.tags = tags
    })
  }

  applyFilters(): void {
    const filter: PostFilter = {}

    if (this.searchText) {
      filter.searchText = this.searchText
    }

    if (this.selectedTag) {
      filter.tag = this.selectedTag.name
    }

    if (this.showMyPostsOnly) {
      filter.onlyMine = true
    }

    this.postService.getFilteredPosts(filter).subscribe((posts) => {
      this.posts = posts.map((post) => ({
        ...post,
        showComments: false,
        newComment: "",
      }))
    })
  }

  filterByTag(tag: Tag): void {
    this.selectedTag = tag
    this.applyFilters()
  }

  toggleMyPosts(): void {
    this.showMyPostsOnly = !this.showMyPostsOnly
    this.applyFilters()
  }

  likePost(post: Post): void {
    this.postService.likePost(post.id).subscribe((updatedPost) => {
      if (updatedPost) {
        const index = this.posts.findIndex((p) => p.id === post.id)
        if (index !== -1) {
          this.posts[index] = { ...updatedPost, showComments: this.posts[index].showComments }
        }
      }
    })
  }

  toggleComments(post: any): void {
    post.showComments = !post.showComments
  }

  addComment(post: any): void {
    if (post.newComment && post.newComment.trim()) {
      this.postService.addComment(post.id, post.newComment).subscribe((updatedPost) => {
        if (updatedPost) {
          const index = this.posts.findIndex((p) => p.id === post.id)
          if (index !== -1) {
            this.posts[index] = {
              ...updatedPost,
              showComments: true,
              newComment: "",
            }
          }
        }
      })
    }
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

  editPost(post: Post): void {
    this.editingPost = true
    this.postForm = {
      id: post.id,
      title: post.title,
      text: post.text,
      imageUrl: post.imageUrl,
      tagInput: post.tags.map((tag) => tag.name),
      selectedTags: [...post.tags],
    }

    // Set image preview if there's an image
    if (post.imageUrl) {
      this.imagePreviewUrl = post.imageUrl
    } else {
      this.imagePreviewUrl = ""
    }

    this.selectedFileName = ""
    this.selectedFile = null
    this.displayPostDialog = true
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

    if (this.editingPost && this.postForm.id) {
      this.postService.updatePost(this.postForm.id, postData, this.postForm.selectedTags).subscribe((updatedPost) => {
        if (updatedPost) {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Post updated successfully",
          })
          this.displayPostDialog = false
          this.loadPosts()
        } else {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "You can only edit your own posts",
          })
        }
      })
    } else {
      this.postService.createPost(postData, this.postForm.selectedTags).subscribe((newPost) => {
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Post created successfully",
        })
        this.displayPostDialog = false
        this.loadPosts()
      })
    }
  }

  confirmDeletePost(post: Post): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this post?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.postService.deletePost(post.id).subscribe((success) => {
          if (success) {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Post deleted successfully",
            })
            this.loadPosts()
          } else {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "You can only delete your own posts",
            })
          }
        })
      },
    })
  }
}
