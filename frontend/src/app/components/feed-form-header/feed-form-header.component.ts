import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { PostService } from "../../services/post.service";

// Unused TagService import removed
// import { TagService } from "../../services/tag.service";
// import { Tag } from "../../interfaces/post.interface";

import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MenubarModule } from "primeng/menubar";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DialogModule } from "primeng/dialog";
// Unused FileUploadModule import removed
// import { FileUploadModule } from "primeng/fileupload";
import { DropdownModule } from "primeng/dropdown";
import { ToastModule } from "primeng/toast";
// Unused environment and MultiSelectModule imports removed
// import { environment } from "../../../environments/environment";
// import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: "app-feed-form-header",
  templateUrl: "./feed-form-header.component.html",
  styleUrls: ["./feed-form-header.component.css"],
  standalone: true, // Added standalone flag for clarity
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
  // Use an Output to notify parent components when a post is created
  @Output() postCreated = new EventEmitter<void>();

  displayCreatePostDialog = false;
  currentRoute = "";

  // Strongly type the form object for better code quality and safety
  postForm: {
    title: string;
    text: string;
  } = {
    title: "",
    text: "",
  };

  tagsText = "";
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null; // Correct type for FileReader result

  constructor(
    private router: Router,
    private postService: PostService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.currentRoute = this.router.url;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.currentRoute = route;
  }

  createNewPost() {
    this.resetPostForm();
    this.displayCreatePostDialog = true;
  }

  resetPostForm() {
    this.postForm = {
      title: "",
      text: "",
    };
    this.tagsText = "";
    this.selectedFile = null;
    this.imagePreviewUrl = null;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

 savePostForm(): void {
  if (!this.postForm.title || !this.postForm.text) {
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: "Title and description are required",
    });
    return;
  }

  // Separate the core post data from the tags, as required by the new service method
  const postData = {
    title: this.postForm.title,
    text: this.postForm.text,
  };

  const tags = this.tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  // Call the updated service method with three distinct arguments
  this.postService
    .createPostWithImage(postData, tags, this.selectedFile)
    .subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Post created successfully",
        });
        this.displayCreatePostDialog = false;
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