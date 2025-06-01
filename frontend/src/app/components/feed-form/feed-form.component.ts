import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { PostService } from "../../services/post.service";
import { TagService } from "../../services/tag.service";
import { CommentService } from "../../services/comment.service";
// Import the interfaces from your file
import { Post, Tag, Comment } from "../../interfaces/post.interface";

// PrimeNG Modules
import { CommonModule, DatePipe } from '@angular/common'; // Added DatePipe
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { InplaceModule } from 'primeng/inplace';

// --- Best Practice: Define View Models for UI-specific state ---
// This adds UI properties without changing the original backend model.
type CommentViewModel = Comment & {
  editing?: boolean;
  editText?: string;
};

// This is the main object we'll use in the component's `posts` array.
// It includes everything from the backend Post, plus our UI properties.
type PostViewModel = Post & {
  likerIds: string[]; // REQUIRED for the "liked" feature to work.
  showComments?: boolean;
  newComment?: string;
  comments: CommentViewModel[]; // Ensure comments inside are also view models.
};


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
  ],
  standalone: true,
  selector: "app-feed-form",
  templateUrl: "./feed-form.component.html",
  styleUrls: ["./feed-form.component.css"],
  providers: [ConfirmationService, MessageService, DatePipe], // Added DatePipe
})
export class FeedFormComponent implements OnInit {
  @Input() displayPostDialog = false;
  @Output() displayPostDialogChange = new EventEmitter<boolean>();
  @Output() postCreated = new EventEmitter<void>();

  // Use the PostViewModel for our component's state
  posts: PostViewModel[] = [];
  currentUserId = "";
  tags: Tag[] = [];
  selectedTag: Tag | null = null;

  // Post dialog
  editingPost: Post | null = null;
  postForm: {
    id?: string;
    title: string;
    text: string;
    imageUrl: string;
    selectedTags: Tag[];
  } = {
    title: "",
    text: "",
    imageUrl: "",
    selectedTags: [],
  };

  // Tags as text input
  tagsText = "";

  // Image upload
  selectedFile: File | null = null;
  selectedFileName = "";
  imagePreviewUrl: string | ArrayBuffer | null = null;

  constructor(
    private postService: PostService,
    private tagService: TagService,
    private commentService: CommentService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.postService.getCurrentUserId();
    this.loadPosts();
    this.loadTags();
  }

loadPosts(): void {
  console.log("1. Starting loadPosts()..."); 
  
  this.postService.getPosts().subscribe({
    next: (postsFromBackend) => {
      console.log("2. Raw data from backend:", postsFromBackend); 

      this.posts = postsFromBackend.map(post => {
        // More detailed logging for each post
        console.log(`Post ID ${post.id}:`, {
          likes: post.likes,
          likerIds: (post as any).likerIds,
          comments: post.comments,
          commentsCount: post.comments?.length || 0
        });

        return {
          ...post,
          // Ensure likerIds is always an array
          likerIds: Array.isArray((post as any).likerIds) ? (post as any).likerIds : [],
          showComments: false,
          newComment: "",
          // Ensure comments is always an array and properly typed
          comments: Array.isArray(post.comments) ? post.comments.map(comment => ({
            ...comment,
            editing: false,
            editText: ""
          })) : []
        };
      });
      
      console.log("3. Final mapped posts:", this.posts);
    },
    error: (error) => {
      console.error("ERROR in loadPosts():", error); 
      
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to load posts: " + error.message,
      });
    },
  });
}

  loadTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags) => { this.tags = tags; },
      error: (error) => {
        this.messageService.add({
          severity: "error", summary: "Error", detail: "Failed to load tags: " + error.message,
        });
      },
    });
  }

  filterByTag(tag: Tag | string): void {
    if (typeof tag === "string") {
      this.selectedTag = { name: tag, id: '' };
    } else {
      this.selectedTag = tag;
    }
    this.applyFilters();
  }

  applyFilters(): void {
    const filter: any = {};
    if (this.selectedTag) {
      filter.tag = this.selectedTag.name;
    }

    this.postService.getFilteredPosts(filter).subscribe({
      next: (posts) => {
        this.posts = posts.map(post => ({
          ...post,
          likerIds: Array.isArray((post as any).likerIds) ? (post as any).likerIds : [],
          showComments: false,
          newComment: "",
          comments: Array.isArray(post.comments) ? post.comments.map(comment => ({
            ...comment,
            editing: false,
            editText: ""
          })) : []
        }));
      },
      error: (error) => {
        this.messageService.add({
          severity: "error", summary: "Error", detail: "Failed to apply filters: " + error.message,
        });
      },
    });
  }

  likePost(post: PostViewModel): void {
    console.log("Liking post:", post.id, "Current likes:", post.likes);
    
    this.postService.likePost(post.id).subscribe({
      next: (updatedPost) => {
        console.log("Like response:", updatedPost);
        
        if (updatedPost) {
          const index = this.posts.findIndex((p) => p.id === post.id);
          if (index !== -1) {
            // Preserve the UI state when updating the post data
            const originalState = this.posts[index];
            this.posts[index] = {
              ...updatedPost,
              likerIds: Array.isArray((updatedPost as any).likerIds) ? (updatedPost as any).likerIds : [],
              showComments: originalState.showComments,
              newComment: originalState.newComment,
              comments: Array.isArray(updatedPost.comments) ? updatedPost.comments.map(comment => ({
                ...comment,
                editing: false,
                editText: ""
              })) : originalState.comments
            };
            
            console.log("Updated post in array:", this.posts[index]);
          }
        }
      },
      error: (error) => {
        console.error("Like error:", error);
        this.messageService.add({
          severity: "error", summary: "Error", detail: "Failed to like post: " + error.message,
        });
      },
    });
  }

  toggleComments(post: PostViewModel): void {
    post.showComments = !post.showComments;
    console.log("Toggled comments for post:", post.id, "Show:", post.showComments, "Comments count:", post.comments.length);
  }

addComment(post: PostViewModel): void {
  const commentText = post.newComment?.trim();
  console.log("Adding comment:", commentText, "to post:", post.id);
  
  if (commentText) {
    this.postService.addComment(post.id, commentText).subscribe({
      next: (response) => {
        console.log("Add comment response:", response);
        
        // Reset the input field immediately
        post.newComment = "";
        
        // Reload posts to get the updated data
        this.loadPosts();
        
        this.messageService.add({
          severity: "success",
          summary: "Success", 
          detail: "Comment added successfully"
        });
      },
      error: (error) => {
        console.error("Add comment error:", error);
        
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to add comment: " + error.message,
        });
      },
    });
  }
}

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) { this.imagePreviewUrl = e.target.result; }
      };
      reader.readAsDataURL(file);
    }
  }

  editPost(post: Post): void {
    this.editingPost = { ...post };
    this.postForm = {
      id: post.id,
      title: post.title,
      text: post.text,
      imageUrl: post.imageUrl,
      selectedTags: [...post.tags],
    };

    this.tagsText = post.tags.map(tag => tag.name).join(", ");
    this.imagePreviewUrl = post.imageUrl || null;
    this.selectedFileName = "";
    this.selectedFile = null;
    this.displayPostDialog = true;
    this.displayPostDialogChange.emit(true);
  }

  hideDialog(): void {
    this.displayPostDialog = false;
    this.displayPostDialogChange.emit(false);
    this.editingPost = null;
    this.tagsText = "";
    this.imagePreviewUrl = null;
    this.selectedFile = null;
    this.selectedFileName = "";
    this.postForm = {
      title: "", text: "", imageUrl: "", selectedTags: [],
    };
  }

  savePostForm(): void {
  if (!this.postForm.title || !this.postForm.text) {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: "Title and text are required",
    });
    return;
  }

  const tagNamesFromString = this.tagsText
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  // This part handles UPDATING an existing post and is already correct.
  if (this.editingPost && this.postForm.id) {
    const postData: Partial<Post> = {
      title: this.postForm.title,
      text: this.postForm.text,
    };
    const tagsToSend: Tag[] = this.tags.filter(tagObject =>
      tagNamesFromString.includes(tagObject.name)
    );

    this.postService.updatePost(this.postForm.id, postData, tagsToSend).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Post updated successfully",
        });
        this.hideDialog();
        this.loadPosts();
        this.postCreated.emit();
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to update post: " + error.message,
        });
      },
    });
  } else {
    // This part handles CREATING a new post and needs to be fixed.

    // FIX: 1. Separate the core post data from the tags.
    const postData = {
      title: this.postForm.title,
      text: this.postForm.text,
    };

    // FIX: 2. Call the updated service method with three distinct arguments.
    this.postService
      .createPostWithImage(postData, tagNamesFromString, this.selectedFile)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Post created successfully",
          });
          this.hideDialog();
          this.loadPosts();
          this.postCreated.emit();
        },
        error: (error) => {
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to create post: " + error.message,
          });
        },
      });
  }
}

  // NOTE: All the following methods are now correctly placed inside the class.
  startEditComment(comment: CommentViewModel): void {
    comment.editing = true;
    comment.editText = comment.text;
  }

  confirmDeletePost(post: Post): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this post?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.postService.deletePost(post.id).subscribe({
          next: (success) => {
            if (success) {
              this.messageService.add({ severity: "success", summary: "Success", detail: "Post deleted successfully" });
              this.loadPosts();
            } else {
              this.messageService.add({ severity: "error", summary: "Error", detail: "You can only delete your own posts" });
            }
          },
          error: (error) => {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to delete post: " + error.message });
          },
        });
      },
    });
  }

  upvoteComment(comment: Comment): void {
    this.commentService.voteComment(comment.id, true, this.currentUserId).subscribe({
      next: () => {
        this.commentService.getCommentScore(comment.id).subscribe({
          next: (score) => { 
            comment.score = score;
            console.log("Updated comment score:", comment.id, score);
          },
          error: (error) => {
            console.error("Failed to get comment score:", error);
            this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to get comment score: " + error.message });
          }
        });
      },
      error: (error) => {
        console.error("Failed to upvote comment:", error);
        this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to upvote comment: " + error.message });
      },
    });
  }

  downvoteComment(comment: Comment): void {
    this.commentService.voteComment(comment.id, false, this.currentUserId).subscribe({
      next: () => {
        this.commentService.getCommentScore(comment.id).subscribe({
          next: (score) => { 
            comment.score = score;
            console.log("Updated comment score:", comment.id, score);
          },
          error: (error) => {
            console.error("Failed to get comment score:", error);
            this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to get comment score: " + error.message });
          }
        });
      },
      error: (error) => {
        console.error("Failed to downvote comment:", error);
        this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to downvote comment: " + error.message });
      },
    });
  }

  editComment(comment: CommentViewModel, newText: string): void {
    if (!newText || newText.trim() === "") {
      this.messageService.add({ severity: "error", summary: "Error", detail: "Comment text cannot be empty" });
      return;
    }
    this.commentService.editComment(comment.id, newText, this.currentUserId).subscribe({
      next: (updatedComment) => {
        comment.text = updatedComment.text;
        comment.editing = false; // Turn off editing mode
        this.messageService.add({ severity: "success", summary: "Success", detail: "Comment updated successfully" });
      },
      error: (error) => {
        this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to update comment: " + error.message });
      },
    });
  }

  deleteComment(comment: Comment): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this comment?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.commentService.deleteComment(comment.id).subscribe({
          next: () => {
            this.loadPosts();
            this.messageService.add({ severity: "success", summary: "Success", detail: "Comment deleted successfully" });
          },
          error: (error) => {
            this.messageService.add({ severity: "error", summary: "Error", detail: "Failed to delete comment: " + error.message });
          },
        });
      },
    });
  }

  trackByCommentId(index: number, comment: Comment): string {
  return comment.id;
}
}