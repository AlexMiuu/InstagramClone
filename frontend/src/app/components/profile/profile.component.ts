import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common" // For *ngIf
import { AvatarModule } from "primeng/avatar" // For p-avatar
import { CardModule } from "primeng/card" // For p-card
import { ProgressSpinnerModule } from "primeng/progressspinner" // For loading spinner
import { FeedFormHeaderComponent } from "../feed-form-header/feed-form-header.component"
import  { AuthService } from "../../services/auth.service"
import  { User as AuthUser } from "../../interfaces/user"

// Simplified interface for the profile page
interface ProfileUser {
  id: string
  username: string
  email: string
  profileImage: string
  score: number
}

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, AvatarModule, FeedFormHeaderComponent, CardModule, ProgressSpinnerModule],
  providers: [], // MessageService and others removed
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.css",
})
export class ProfileComponent implements OnInit {
  user: ProfileUser | null = null
  loading = true

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUserFromApi().subscribe({
      next: (authUser: AuthUser | null) => {
        if (authUser) {
          this.user = {
            id: authUser.id?.toString() || "N/A",
            username: authUser.username || "Username not set",
            email: authUser.email || "Email not set",
            profileImage: `/placeholder.svg?height=128&width=128&query=user+avatar+${encodeURIComponent(authUser.username || "default")}`,
            score: Math.floor(Math.random() * 5000) + 100, // Placeholder score, replace with actual data
          }
        } else {
          // Fallback for non-authenticated or error state
          this.user = {
            id: "anonymous",
            username: "Guest",
            email: "N/A",
            profileImage: "/placeholder.svg?height=128&width=128",
            score: 0,
          }
        }
        this.loading = false
      },
      error: (err) => {
        console.error("Failed to load user data for profile:", err)
        this.user = {
          id: "error",
          username: "Error Loading Profile",
          email: "N/A",
          profileImage: "/placeholder.svg?height=128&width=128",
          score: 0,
        }
        this.loading = false
      },
    })
  }
}
