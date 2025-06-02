import { Component, type OnInit } from "@angular/core";
import { CommonModule } from "@angular/common"; // For *ngIf
import { AvatarModule } from "primeng/avatar"; // For p-avatar
import { CardModule } from "primeng/card"; // For p-card
import { ProgressSpinnerModule } from "primeng/progressspinner"; // For loading spinner
import { FeedFormHeaderComponent } from "../feed-form-header/feed-form-header.component";
import { AuthService } from "../../services/auth.service";
import { User as AuthUser } from "../../interfaces/user"; // This is your User interface from auth.service

// RxJS operators for handling observable streams
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs'; // For creating observables from static values

// Simplified interface for the profile page
interface ProfileUser {
  id: string;
  username: string;
  email: string;
  profileImage: string;
  score: number;
}

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, AvatarModule, FeedFormHeaderComponent, CardModule, ProgressSpinnerModule],
  providers: [],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.css",
})
export class ProfileComponent implements OnInit {
  user: ProfileUser | null = null;
  loading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loading = true;
    this.authService.getCurrentUserFromApi().pipe(
      switchMap((authUser: AuthUser | null) => {
        if (authUser) {
          // User data exists from getCurrentUserFromApi
          const userIdString = authUser.id != null ? authUser.id.toString() : "N/A";

          const baseProfileData = {
            id: userIdString,
            username: authUser.username || "Username not set",
            email: authUser.email || "Email not set",
          };

          if (authUser.id != null) {
            // If a valid user ID exists, fetch their score
            return this.authService.getUserScore(authUser.id).pipe(
              map(score => ({
                ...baseProfileData,
                score: score,
              } as ProfileUser)),
              catchError(scoreError => {
                console.error("Failed to load user score for user:", authUser.id, scoreError);
                // If score fetching fails, return user data with a default score
                return of({ ...baseProfileData, score: 0 } as ProfileUser);
              })
            );
          } else {
            // AuthUser exists but doesn't have a valid ID (e.g., authUser.id is null)
            // Complete ProfileUser with a default score
            return of({ ...baseProfileData, score: 0 } as ProfileUser);
          }
        } else {
          // authUser is null (e.g., not logged in, or initial fetch failed and service returned null)
          // Return the "Guest" user profile
          return of({
            id: "anonymous",
            username: "Guest",
            email: "N/A",
            profileImage: "/placeholder.svg?height=128&width=128",
            score: 0,
          } as ProfileUser);
        }
      }),
      // This catchError handles failures from getCurrentUserFromApi itself,
      // or any unhandled errors from the switchMap operations if they weren't caught internally.
      catchError(initialError => {
        console.error("Failed to load initial user data for profile:", initialError);
        // Return the "Error Loading Profile" user profile
        return of({
          id: "error",
          username: "Error Loading Profile",
          email: "N/A",
          profileImage: "/placeholder.svg?height=128&width=128",
          score: 0,
        } as ProfileUser);
      })
    ).subscribe({
      next: (profileUser: ProfileUser) => {
        this.user = profileUser;
        this.loading = false;
      },
      error: (criticalError) => {
        // This error block is a final safeguard, though most errors should be
        // handled by the catchError operators within the pipe.
        console.error("Critical error in profile data processing:", criticalError);
        this.user = { // Fallback to a generic error user
          id: "critical-error",
          username: "Critical Profile Error",
          email: "N/A",
          profileImage: "/placeholder.svg?height=128&width=128",
          score: 0,
        };
        this.loading = false;
      }
    });
  }
}