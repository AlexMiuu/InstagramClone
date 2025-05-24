import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { AvatarModule } from "primeng/avatar"
import { ButtonModule } from "primeng/button"
import { DividerModule } from "primeng/divider"
import { DialogModule } from "primeng/dialog"
import { InputTextModule } from "primeng/inputtext"
import { FormsModule } from "@angular/forms"
import { ToastModule } from "primeng/toast"
import { MessageService } from "primeng/api"
import { FeedFormHeaderComponent } from "../feed-form-header/feed-form-header.component"
import { CardModule } from "primeng/card"
import { RouterModule } from "@angular/router"

interface ProfileUser {
  id: string
  username: string
  fullName: string
  bio: string
  profileImage: string
  isVerified: boolean
  email: string
  phoneNumber?: string
  gender?: string
  website?: string
}

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    ButtonModule,
    DividerModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ToastModule,
    FeedFormHeaderComponent,
    CardModule,
    RouterModule,
  ],
  providers: [MessageService],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.css",
})
export class ProfileComponent implements OnInit {
  user: ProfileUser = {
    id: "user123",
    username: "instagram_user",
    fullName: "Instagram User",
    bio: "Digital creator | Photography enthusiast 📸\nExploring the world one photo at a time ✈️",
    profileImage: "/public\favicon.ico",
    isVerified: true,
    email: "user@example.com",
    phoneNumber: "+1 (555) 123-4567",
    gender: "Prefer not to say",
    website: "www.instagram.com",
  }

  showEditProfileDialog = false
  editedUser = { ...this.user }
  activeSection = "edit_profile" // Can be 'edit_profile', 'change_password', 'privacy'

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    // Initialize component
  }

  openEditProfileDialog(): void {
    this.editedUser = { ...this.user }
    this.showEditProfileDialog = true
  }

  saveProfile(): void {
    this.user = { ...this.editedUser }
    this.showEditProfileDialog = false
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: "Profile updated successfully",
    })
  }

  setActiveSection(section: string): void {
    this.activeSection = section
  }
}
