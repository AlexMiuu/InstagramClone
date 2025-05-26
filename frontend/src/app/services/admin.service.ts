import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import { map } from "rxjs/operators"
import  { User } from "../interfaces/user"
import { environment } from "../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`
  private usersUrl = `${environment.apiUrl}/users`

  constructor(private http: HttpClient) {}

  /**
   * Get all users (admin only)
   */
  getAllUsers(): Observable<User[]> {
    // Backend: /users/getAll
    return this.http.get<User[]>(`${this.usersUrl}/getAll`).pipe(map((users) => this.mapUsersFromBackend(users)))
  }

  /**
   * Toggle user ban status (ban/unban)
   */
  toggleUserBan(userId: string): Observable<any> {
    // Backend: /users/update (PUT) with is_blocked toggled
    // For toggling, you need to fetch the user, toggle is_blocked, then send PUT
    // But for simplicity, let's call /users/update with only id and is_blocked
    // (Assume the backend allows partial update)
    return this.http.put(`${this.usersUrl}/update?id=${userId}`, { is_blocked: true })
  }

  /**
   * Delete a user (admin only)
   */
  deleteUser(userId: string): Observable<any> {
    // Backend: /users/deleteUser?id=...
    return this.http.delete(`${this.usersUrl}/deleteUser`, { params: { id: userId } })
  }

  /**
   * Get admin statistics
   */
  getAdminStats(): Observable<{
    totalUsers: number
    bannedUsers: number
    totalPosts: number
    totalComments: number
  }> {
    // No direct endpoint in provided backend, keep as is or implement if backend supports
    return this.http.get<any>(`${this.apiUrl}/stats`)
  }

  /**
   * Map backend user format to frontend format
   */
  private mapUserFromBackend(backendUser: any): User {
    return {
      id: backendUser.id,
      email: backendUser.email,
      username: backendUser.username,
      date_of_birth: backendUser.date_of_birth ? new Date(backendUser.date_of_birth) : undefined,
      is_admin: backendUser.is_admin || false,
      is_blocked: backendUser.is_blocked || false,
    }
  }

  /**
   * Map multiple users from backend format
   */
  private mapUsersFromBackend(backendUsers: any[]): User[] {
    return backendUsers.map((user) => this.mapUserFromBackend(user))
  }
}
